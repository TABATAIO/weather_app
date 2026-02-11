/**
 * Background Controller Module
 * 天気に応じた背景の動的変更とアニメーション管理
 */

class BackgroundController {
    constructor() {
        this.backgroundElement = null;
        this.currentWeatherClass = 'default';
        this.isTransitioning = false;
        this.animationSettings = {
            transitionDuration: 2000,
            enableAnimations: true,
            enableParticles: true
        };
        
        // Performance optimization
        this.requestId = null;
        this.lastFrameTime = 0;
        this.fps = 60;
        this.frameInterval = 1000 / this.fps;
        
        this.init();
    }

    init() {
        console.log('🎨 Background Controller initialized');
        
        // Find or create background element
        this.initializeBackgroundElement();
        
        // Load settings
        this.loadSettings();
        
        // Listen for weather changes
        window.weatherService?.addEventListener('weatherUpdated', this.handleWeatherChange.bind(this));
        
        // Listen for performance settings
        this.setupPerformanceOptimization();
        
        // Set initial background
        this.setInitialBackground();
    }

    /**
     * Initialize background element
     */
    initializeBackgroundElement() {
        this.backgroundElement = document.getElementById('weather-background');
        
        if (!this.backgroundElement) {
            // Create background element if not exists
            this.backgroundElement = document.createElement('div');
            this.backgroundElement.id = 'weather-background';
            this.backgroundElement.className = 'weather-background';
            
            // Insert as first child of body
            document.body.insertBefore(this.backgroundElement, document.body.firstChild);
            console.log('🎨 Background element created');
        }
        
        // Ensure proper stacking
        this.backgroundElement.style.zIndex = '-1';
    }

    /**
     * Load background settings
     */
    loadSettings() {
        const saved = window.storage?.get('background_settings');
        if (saved) {
            this.animationSettings = { ...this.animationSettings, ...saved };
        }
        
        // Apply reduced motion preferences
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.animationSettings.enableAnimations = false;
            console.log('🔇 Animations disabled due to reduced motion preference');
        }
    }

    /**
     * Save settings
     */
    saveSettings() {
        window.storage?.set('background_settings', this.animationSettings);
    }

    /**
     * Setup performance optimization
     */
    setupPerformanceOptimization() {
        // Pause animations when tab is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
        
        // Reduce animations on low-end devices
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
            this.animationSettings.enableParticles = false;
            this.fps = 30;
            this.frameInterval = 1000 / this.fps;
            console.log('⚡ Performance mode enabled for low-end device');
        }
        
        // Battery level optimization (if available)
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                if (battery.level < 0.2) { // Less than 20% battery
                    this.animationSettings.enableAnimations = false;
                    console.log('🔋 Animations disabled due to low battery');
                }
            });
        }
    }

    /**
     * Set initial background based on current weather
     */
    setInitialBackground() {
        const currentWeather = window.weatherService?.getCurrentWeather();
        if (currentWeather) {
            this.updateBackground(currentWeather);
        } else {
            this.setBackground('default');
        }
    }

    /**
     * Handle weather change event
     */
    handleWeatherChange(data) {
        const weather = data.weather;
        if (weather && !this.isTransitioning) {
            console.log('🌤️ Weather changed, updating background...');
            this.updateBackground(weather, data.isSignificantChange);
        }
    }

    /**
     * Update background based on weather data
     */
    updateBackground(weatherData, animated = true) {
        if (!weatherData || !weatherData.current) {
            this.setBackground('default', animated);
            return;
        }

        const weather = weatherData.current.weather;
        const temperature = weatherData.current.temperature;
        const time = this.getTimeOfDay();
        
        // Determine background class
        const weatherClass = this.getWeatherClass(weather);
        const timeClass = this.getTimeClass(time);
        const tempClass = this.getTemperatureClass(temperature);
        
        // Combine classes
        const newClass = `${weatherClass} ${timeClass} ${tempClass}`.trim();
        
        this.setBackground(newClass, animated);
        
        console.log(`🎨 Background updated: ${newClass}`);
    }

    /**
     * Get weather class from weather data
     */
    getWeatherClass(weather) {
        if (!weather) return 'default';
        
        const weatherLower = weather.toLowerCase();
        
        if (weatherLower.includes('晴') || weatherLower.includes('sunny')) {
            return 'sunny';
        } else if (weatherLower.includes('曇') || weatherLower.includes('cloudy')) {
            return 'cloudy';
        } else if (weatherLower.includes('雨') || weatherLower.includes('rain')) {
            return 'rainy';
        } else if (weatherLower.includes('雪') || weatherLower.includes('snow')) {
            return 'snowy';
        } else if (weatherLower.includes('嵐') || weatherLower.includes('storm')) {
            return 'stormy';
        } else if (weatherLower.includes('霧') || weatherLower.includes('fog')) {
            return 'foggy';
        }
        
        return 'default';
    }

    /**
     * Get time class
     */
    getTimeClass(timeOfDay = this.getTimeOfDay()) {
        return timeOfDay === 'night' ? 'night' : 'day';
    }

    /**
     * Get temperature class
     */
    getTemperatureClass(temperature) {
        if (temperature == null) return '';
        
        if (temperature < 0) {
            return 'freezing';
        } else if (temperature < 10) {
            return 'cold';
        } else if (temperature > 30) {
            return 'hot';
        } else if (temperature > 25) {
            return 'warm';
        }
        
        return '';
    }

    /**
     * Get current time of day
     */
    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 18) {
            return 'day';
        } else {
            return 'night';
        }
    }

    /**
     * Set background with optional animation
     */
    setBackground(backgroundClass, animated = true) {
        if (this.currentWeatherClass === backgroundClass) {
            return; // No change needed
        }

        if (this.isTransitioning) {
            // Queue the change if currently transitioning
            setTimeout(() => this.setBackground(backgroundClass, animated), 500);
            return;
        }

        const perfStart = window.perfMonitor?.markRenderStart('background-change');

        try {
            this.isTransitioning = true;

            if (animated && this.animationSettings.enableAnimations) {
                this.animatedTransition(backgroundClass);
            } else {
                this.instantTransition(backgroundClass);
            }

            this.currentWeatherClass = backgroundClass;

        } finally {
            if (perfStart) {
                window.perfMonitor?.markRenderEnd('background-change', perfStart);
            }
        }
    }

    /**
     * Animated background transition
     */
    animatedTransition(newClass) {
        if (!this.backgroundElement) return;

        // Add transition class for smooth change
        this.backgroundElement.classList.add('changing');

        // Change background class after a brief delay for smooth transition
        setTimeout(() => {
            // Clear all weather-related classes
            this.backgroundElement.className = 'weather-background';
            
            // Add new classes
            newClass.split(' ').forEach(cls => {
                if (cls) this.backgroundElement.classList.add(cls);
            });

            // Remove transition class after animation completes
            setTimeout(() => {
                this.backgroundElement.classList.remove('changing');
                this.isTransitioning = false;
            }, this.animationSettings.transitionDuration);

        }, 100);
    }

    /**
     * Instant background transition
     */
    instantTransition(newClass) {
        if (!this.backgroundElement) return;

        // Clear all weather-related classes
        this.backgroundElement.className = 'weather-background';
        
        // Add new classes
        newClass.split(' ').forEach(cls => {
            if (cls) this.backgroundElement.classList.add(cls);
        });

        this.isTransitioning = false;
    }

    /**
     * Pause animations for performance
     */
    pauseAnimations() {
        if (this.backgroundElement) {
            this.backgroundElement.style.animationPlayState = 'paused';
        }
        
        if (this.requestId) {
            cancelAnimationFrame(this.requestId);
            this.requestId = null;
        }
    }

    /**
     * Resume animations
     */
    resumeAnimations() {
        if (this.backgroundElement && this.animationSettings.enableAnimations) {
            this.backgroundElement.style.animationPlayState = 'running';
        }
    }

    /**
     * Toggle animations on/off
     */
    toggleAnimations(enable = !this.animationSettings.enableAnimations) {
        this.animationSettings.enableAnimations = enable;
        this.saveSettings();
        
        if (enable) {
            this.resumeAnimations();
        } else {
            this.pauseAnimations();
        }
        
        console.log(`🎨 Animations ${enable ? 'enabled' : 'disabled'}`);
    }

    /**
     * Toggle particle effects on/off
     */
    toggleParticles(enable = !this.animationSettings.enableParticles) {
        this.animationSettings.enableParticles = enable;
        this.saveSettings();
        
        // Re-apply current background to show/hide particles
        if (this.backgroundElement) {
            this.backgroundElement.classList.toggle('no-particles', !enable);
        }
        
        console.log(`✨ Particles ${enable ? 'enabled' : 'disabled'}`);
    }

    /**
     * Force background update
     */
    forceUpdate() {
        const currentWeather = window.weatherService?.getCurrentWeather();
        this.currentWeatherClass = ''; // Reset to force update
        this.updateBackground(currentWeather, true);
    }

    /**
     * Get current background info
     */
    getCurrentBackground() {
        return {
            class: this.currentWeatherClass,
            isTransitioning: this.isTransitioning,
            animationsEnabled: this.animationSettings.enableAnimations,
            particlesEnabled: this.animationSettings.enableParticles
        };
    }

    /**
     * Add custom CSS for dynamic effects
     */
    addCustomCSS() {
        if (document.getElementById('dynamic-background-css')) return;
        
        const style = document.createElement('style');
        style.id = 'dynamic-background-css';
        style.textContent = `
            .weather-background.no-particles::before,
            .weather-background.no-particles::after {
                display: none !important;
            }
            
            .weather-background.low-performance {
                animation-duration: 20s !important;
            }
            
            .weather-background.low-performance::before,
            .weather-background.low-performance::after {
                animation-duration: 30s !important;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Cleanup method
     */
    destroy() {
        if (this.requestId) {
            cancelAnimationFrame(this.requestId);
        }
        
        // Remove event listeners would go here if we had explicit ones
        console.log('🗑️ Background Controller destroyed');
    }
}

// Global background controller instance
window.backgroundController = new BackgroundController();

console.log('🎨 Background Controller initialized');