/**
 * Mascot Manager Module
 * マスコットの状態管理・アニメーション・インタラクション
 */

class MascotManager {
    constructor() {
        this.mascot = null;
        this.mascotData = {
            name: 'Sunny',
            level: 1,
            experience: 0,
            experienceToNext: 100,
            happiness: 100,
            hunger: 80,
            health: 100,
            mood: 'normal',
            lastFed: null,
            lastInteraction: null,
            totalInteractions: 0
        };
        
        this.animations = {
            idle: 'mascot-float',
            happy: 'mascot-bounce',
            excited: 'mascot-excited',
            sad: 'mascot-sad'
        };
        
        this.emojis = {
            normal: '🐱',
            happy: '😸',
            excited: '🤩',
            sad: '😿',
            sleeping: '😴',
            hungry: '🙀'
        };
        
        this.isAnimating = false;
        this.lastUpdateTime = Date.now();
        this.degradationInterval = 60000; // 1 minute
        this.saveInterval = 30000; // 30 seconds
        
        this.listeners = new Map();
        
        this.init();
    }

    async init() {
        console.log('🐱 Mascot Manager initialized');
        
        // Find mascot element
        this.findMascotElement();
        
        // Load mascot data
        await this.loadMascotData();
        
        // Setup periodic updates
        this.setupPeriodicUpdates();
        
        // Setup interactions
        this.setupInteractions();
        
        // Initial render
        this.renderMascot();
        
        // Listen for weather changes
        window.weatherService?.addEventListener('weatherUpdated', this.handleWeatherChange.bind(this));
    }

    /**
     * Find mascot DOM element
     */
    findMascotElement() {
        this.mascot = document.getElementById('mascot');
        this.mascotBody = document.querySelector('.mascot-body');
        this.mascotName = document.getElementById('mascot-name');
        
        if (!this.mascot) {
            console.warn('⚠️ Mascot element not found');
        }
    }

    /**
     * Load mascot data from storage and server
     */
    async loadMascotData() {
        try {
            // Load from local storage first (faster)
            const localData = window.storage?.get('mascot_data');
            if (localData) {
                this.mascotData = { ...this.mascotData, ...localData };
                console.log('🏪 Loaded mascot data from storage');
            }

            // Then sync with server
            const serverData = await window.apiClient.getMascotStatus();
            if (serverData && serverData.success && serverData.data) {
                this.mascotData = { ...this.mascotData, ...serverData.data };
                this.saveMascotData(); // Save synced data locally
                console.log('☁️ Synced mascot data from server');
            }
            
        } catch (error) {
            console.warn('⚠️ Failed to load mascot data from server:', error);
            // Continue with local data
        }
        
        this.validateMascotData();
    }

    /**
     * Validate and fix mascot data
     */
    validateMascotData() {
        // Ensure all values are within valid ranges
        this.mascotData.happiness = Math.max(0, Math.min(100, this.mascotData.happiness));
        this.mascotData.hunger = Math.max(0, Math.min(100, this.mascotData.hunger));
        this.mascotData.health = Math.max(0, Math.min(100, this.mascotData.health));
        this.mascotData.level = Math.max(1, this.mascotData.level);
        this.mascotData.experience = Math.max(0, this.mascotData.experience);
        
        // Set default name if missing
        if (!this.mascotData.name || this.mascotData.name.trim() === '') {
            this.mascotData.name = 'Sunny';
        }
        
        // Update mood based on metrics
        this.updateMood();
    }

    /**
     * Setup periodic updates
     */
    setupPeriodicUpdates() {
        // Slow degradation of stats
        setInterval(() => {
            this.degradeStats();
        }, this.degradationInterval);
        
        // Periodic save
        setInterval(() => {
            this.saveMascotData();
        }, this.saveInterval);
        
        // Update when window regains focus
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.handleTimeAway();
            }
        });
    }

    /**
     * Setup mascot interactions
     */
    setupInteractions() {
        if (this.mascot) {
            // Click interaction
            this.mascot.addEventListener('click', () => {
                this.interact();
            });
            
            // Touch interaction for mobile
            this.mascot.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevent click delay
                this.interact();
            });
            
            // Hover effect (desktop only)
            if (window.matchMedia('(hover: hover)').matches) {
                this.mascot.addEventListener('mouseenter', () => {
                    this.showPreviewAnimation();
                });
            }
        }
    }

    /**
     * Interact with mascot
     */
    interact(type = 'pet') {
        if (this.isAnimating) return;
        
        console.log(`🐾 Mascot interaction: ${type}`);
        
        // Update interaction stats
        this.mascotData.lastInteraction = Date.now();
        this.mascotData.totalInteractions++;
        
        // Increase happiness
        const happinessGain = type === 'feed' ? 20 : 10;
        this.mascotData.happiness = Math.min(100, this.mascotData.happiness + happinessGain);
        
        // Gain experience
        const expGain = type === 'feed' ? 15 : 5;
        this.addExperience(expGain);
        
        // Trigger animation
        this.playAnimation('happy', 1000);
        
        // Update mood and render
        this.updateMood();
        this.renderMascot();
        
        // Emit interaction event
        this.emit('interaction', {
            type,
            mascotData: this.mascotData,
            happinessGain,
            expGain
        });
        
        // Show floating text
        this.showFloatingText(`+${happinessGain} 😊`, 'success');
    }

    /**
     * Feed mascot
     */
    async feed(foodType = 'normal') {
        try {
            const response = await window.apiClient.feedMascot(foodType, 1);
            
            if (response && response.success) {
                this.mascotData.lastFed = Date.now();
                this.mascotData.hunger = Math.min(100, this.mascotData.hunger + 30);
                this.mascotData.happiness = Math.min(100, this.mascotData.happiness + 15);
                
                this.addExperience(20);
                this.interact('feed');
                
                console.log(`🍽️ Fed mascot with ${foodType}`);
                this.emit('fed', { foodType, mascotData: this.mascotData });
                
                return true;
            }
        } catch (error) {
            console.error('❌ Feed failed:', error);
            this.showFloatingText('Feed failed! 😞', 'error');
        }
        
        return false;
    }

    /**
     * Add experience and handle level up
     */
    addExperience(amount) {
        const oldLevel = this.mascotData.level;
        this.mascotData.experience += amount;
        
        // Check for level up
        while (this.mascotData.experience >= this.mascotData.experienceToNext) {
            this.mascotData.experience -= this.mascotData.experienceToNext;
            this.mascotData.level++;
            this.mascotData.experienceToNext = this.calculateNextLevelExp(this.mascotData.level);
            
            // Level up effects
            this.handleLevelUp(oldLevel, this.mascotData.level);
        }
    }

    /**
     * Calculate experience needed for next level
     */
    calculateNextLevelExp(level) {
        return Math.floor(100 * Math.pow(1.2, level - 1));
    }

    /**
     * Handle level up
     */
    handleLevelUp(oldLevel, newLevel) {
        console.log(`🎉 Level up! ${oldLevel} → ${newLevel}`);
        
        // Boost stats on level up
        this.mascotData.happiness = 100;
        this.mascotData.health = 100;
        
        // Play celebration animation
        this.playAnimation('excited', 2000);
        
        // Show level up notification
        this.showFloatingText(`Level ${newLevel}! 🎉`, 'success', 3000);
        
        // Emit level up event
        this.emit('levelUp', {
            oldLevel,
            newLevel,
            mascotData: this.mascotData
        });
    }

    /**
     * Degrade stats over time
     */
    degradeStats() {
        const timeSinceLastUpdate = Date.now() - this.lastUpdateTime;
        const degradationRate = timeSinceLastUpdate / (60 * 60 * 1000); // Per hour
        
        // Hunger decreases faster
        this.mascotData.hunger = Math.max(0, this.mascotData.hunger - (degradationRate * 10));
        
        // Happiness decreases based on hunger
        if (this.mascotData.hunger < 30) {
            this.mascotData.happiness = Math.max(0, this.mascotData.happiness - (degradationRate * 5));
        } else {
            this.mascotData.happiness = Math.max(0, this.mascotData.happiness - (degradationRate * 2));
        }
        
        // Health decreases if very hungry or unhappy
        if (this.mascotData.hunger < 10 || this.mascotData.happiness < 10) {
            this.mascotData.health = Math.max(0, this.mascotData.health - (degradationRate * 3));
        }
        
        this.lastUpdateTime = Date.now();
        this.updateMood();
        this.renderMascot();
    }

    /**
     * Handle time away from app
     */
    handleTimeAway() {
        const lastSaved = window.storage?.get('mascot_last_save') || Date.now();
        const timeAway = Date.now() - lastSaved;
        
        // If away for more than 30 minutes, apply degradation
        if (timeAway > 30 * 60 * 1000) {
            const hoursAway = timeAway / (60 * 60 * 1000);
            console.log(`⏰ Welcome back! You were away for ${hoursAway.toFixed(1)} hours`);
            
            // Apply degradation for time away
            this.mascotData.hunger = Math.max(10, this.mascotData.hunger - (hoursAway * 8));
            this.mascotData.happiness = Math.max(10, this.mascotData.happiness - (hoursAway * 3));
            
            this.updateMood();
            this.renderMascot();
            
            // Show status message
            if (hoursAway > 2) {
                this.showFloatingText(`Missed you! 🥺`, 'info', 2000);
            }
        }
    }

    /**
     * Update mascot mood based on stats
     */
    updateMood() {
        const { happiness, hunger, health } = this.mascotData;
        
        if (health < 30 || (happiness < 30 && hunger < 30)) {
            this.mascotData.mood = 'sad';
        } else if (hunger < 20) {
            this.mascotData.mood = 'hungry';
        } else if (happiness > 80 && hunger > 60) {
            this.mascotData.mood = happiness > 95 ? 'excited' : 'happy';
        } else {
            this.mascotData.mood = 'normal';
        }
    }

    /**
     * Handle weather changes
     */
    handleWeatherChange(data) {
        const weather = data.weather?.current?.weather;
        if (!weather) return;
        
        console.log(`🌤️ Weather changed to: ${weather}`);
        
        // Weather affects mood slightly
        if (weather.includes('雨') || weather.includes('rainy')) {
            this.mascotData.happiness = Math.max(20, this.mascotData.happiness - 5);
            this.showFloatingText('Rainy day... 🌧️', 'info');
        } else if (weather.includes('晴れ') || weather.includes('sunny')) {
            this.mascotData.happiness = Math.min(100, this.mascotData.happiness + 5);
            this.showFloatingText('Sunny day! ☀️', 'success');
        }
        
        this.updateMood();
        this.renderMascot();
    }

    /**
     * Play animation
     */
    playAnimation(animationType, duration = 1000) {
        if (!this.mascot || this.isAnimating) return;
        
        this.isAnimating = true;
        
        // Remove existing animation classes
        Object.values(this.animations).forEach(animClass => {
            this.mascot.classList.remove(animClass);
        });
        
        // Add new animation class
        this.mascot.classList.add(animationType);
        
        setTimeout(() => {
            this.mascot.classList.remove(animationType);
            this.isAnimating = false;
        }, duration);
    }

    /**
     * Show preview animation on hover
     */
    showPreviewAnimation() {
        if (!this.isAnimating) {
            this.playAnimation('happy', 500);
        }
    }

    /**
     * Show floating text
     */
    showFloatingText(text, type = 'info', duration = 1500) {
        if (!this.mascot) return;
        
        const floatingText = document.createElement('div');
        floatingText.className = `floating-text floating-text-${type}`;
        floatingText.textContent = text;
        floatingText.style.cssText = `
            position: absolute;
            top: -40px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            z-index: 1000;
            pointer-events: none;
            animation: floatUp 1.5s ease-out forwards;
        `;
        
        // Add to mascot container
        this.mascot.appendChild(floatingText);
        
        // Remove after duration
        setTimeout(() => {
            if (floatingText.parentNode) {
                floatingText.parentNode.removeChild(floatingText);
            }
        }, duration);
        
        // Add floating animation CSS if not exists
        this.addFloatingAnimation();
    }

    /**
     * Add floating animation CSS
     */
    addFloatingAnimation() {
        if (document.getElementById('floating-animation-css')) return;
        
        const style = document.createElement('style');
        style.id = 'floating-animation-css';
        style.textContent = `
            @keyframes floatUp {
                0% {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0px);
                }
                100% {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-50px);
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Render mascot to UI
     */
    renderMascot() {
        const perfStart = window.perfMonitor?.markRenderStart('mascot-render');
        
        try {
            // Update mascot body emoji
            if (this.mascotBody) {
                this.mascotBody.textContent = this.emojis[this.mascotData.mood] || this.emojis.normal;
            }
            
            // Update mascot name
            if (this.mascotName) {
                this.mascotName.textContent = this.mascotData.name;
            }
            
            // Update status bars
            this.updateStatusBars();
            
            // Update mood class
            if (this.mascot) {
                // Remove existing mood classes
                Object.keys(this.emojis).forEach(mood => {
                    this.mascot.classList.remove(mood);
                });
                
                // Add current mood class
                this.mascot.classList.add(this.mascotData.mood);
            }
            
        } catch (error) {
            console.error('❌ Mascot render error:', error);
        } finally {
            if (perfStart) {
                window.perfMonitor?.markRenderEnd('mascot-render', perfStart);
            }
        }
    }

    /**
     * Update status bars
     */
    updateStatusBars() {
        // Level progress
        const levelProgress = document.getElementById('level-progress');
        const levelValue = document.getElementById('level-value');
        if (levelProgress && levelValue) {
            const progressPercent = (this.mascotData.experience / this.mascotData.experienceToNext) * 100;
            levelProgress.style.width = `${progressPercent}%`;
            levelValue.textContent = this.mascotData.level;
        }
        
        // Happiness progress
        const happinessProgress = document.getElementById('happiness-progress');
        const happinessValue = document.getElementById('happiness-value');
        if (happinessProgress && happinessValue) {
            happinessProgress.style.width = `${this.mascotData.happiness}%`;
            happinessValue.textContent = Math.round(this.mascotData.happiness);
        }
    }

    /**
     * Save mascot data
     */
    async saveMascotData() {
        // Save locally
        window.storage?.set('mascot_data', this.mascotData);
        window.storage?.set('mascot_last_save', Date.now());
        
        // Sync with server (non-blocking)
        try {
            await window.apiClient.updateMascotStatus(this.mascotData);
        } catch (error) {
            // Silent fail for server sync
            console.warn('⚠️ Failed to sync mascot data to server:', error);
        }
    }

    /**
     * Add event listener
     */
    addEventListener(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * Emit event
     */
    emit(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in mascot manager listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Get mascot data
     */
    getMascotData() {
        return { ...this.mascotData };
    }

    /**
     * Update mascot name
     */
    updateName(newName) {
        if (newName && newName.trim().length > 0) {
            this.mascotData.name = newName.trim();
            this.renderMascot();
            this.saveMascotData();
            
            console.log(`📝 Mascot name updated to: ${newName}`);
            this.emit('nameChanged', { oldName: this.mascotData.name, newName });
        }
    }

    /**
     * Get status for debugging
     */
    getStatus() {
        return {
            mascotData: this.mascotData,
            isAnimating: this.isAnimating,
            lastUpdateTime: this.lastUpdateTime,
            mood: this.mascotData.mood,
            emoji: this.emojis[this.mascotData.mood]
        };
    }
}

// Global mascot manager instance
window.mascotManager = new MascotManager();

console.log('🐱 Mascot Manager initialized');