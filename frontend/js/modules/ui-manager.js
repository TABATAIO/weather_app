/**
 * UI Manager Module
 * ユーザーインターフェースの管理と統合制御
 */

class UIManager {
    constructor() {
        this.elements = new Map();
        this.sections = new Map();
        this.currentView = 'main';
        this.isInitialized = false;
        this.loadingScreen = null;
        this.errorModal = null;
        
        // State management
        this.appState = {
            isLoading: false,
            connectionStatus: 'connecting', // connecting, connected, disconnected
            errorMessage: null,
            currentWeather: null,
            mascotData: null
        };
        
        // UI settings
        this.settings = {
            enableAnimations: true,
            enableNotifications: true,
            autoRefresh: true
        };
        
        this.init();
    }

    async init() {
        console.log('📱 UI Manager initialized');
        
        // Cache DOM elements
        this.cacheElements();
        
        // Load settings
        this.loadSettings();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize UI state
        this.initializeUI();
        
        // Setup service listeners
        this.setupServiceListeners();
        
        this.isInitialized = true;
    }

    /**
     * Cache frequently used DOM elements
     */
    cacheElements() {
        const elementIds = [
            'loading-screen',
            'app',
            'error-modal',
            'weather-panel',
            'mascot-section',
            'chat-section',
            'current-location',
            'weather-icon',
            'temperature',
            'weather-description',
            'mascot-name',
            'level-progress',
            'level-value',
            'happiness-progress',
            'happiness-value',
            'chat-messages',
            'chat-input',
            'connection-status',
            'status-text'
        ];
        
        elementIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                this.elements.set(id, element);
            } else {
                console.warn(`⚠️ Element not found: ${id}`);
            }
        });

        // Cache section elements
        const sectionIds = ['weather-panel', 'mascot-section', 'chat-section'];
        sectionIds.forEach(id => {
            const section = document.getElementById(id);
            if (section) {
                this.sections.set(id, section);
            }
        });

        // Cache specific elements
        this.loadingScreen = this.elements.get('loading-screen');
        this.errorModal = this.elements.get('error-modal');
    }

    /**
     * Load UI settings
     */
    loadSettings() {
        const saved = window.storage?.get('ui_settings');
        if (saved) {
            this.settings = { ...this.settings, ...saved };
        }
    }

    /**
     * Save settings
     */
    saveSettings() {
        window.storage?.set('ui_settings', this.settings);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Button event listeners
        this.setupButtons();
        
        // Input event listeners
        this.setupInputs();
        
        // Window event listeners
        this.setupWindowEvents();
        
        // Touch and gesture events
        this.setupTouchEvents();
    }

    /**
     * Setup button event listeners
     */
    setupButtons() {
        // Settings button
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
        }

        // Refresh button
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshAll());
        }

        // Location button
        const locationBtn = document.getElementById('location-btn');
        if (locationBtn) {
            locationBtn.addEventListener('click', () => this.showLocationSelect());
        }

        // Chat button
        const chatBtn = document.getElementById('chat-btn');
        if (chatBtn) {
            chatBtn.addEventListener('click', () => this.toggleChat());
        }

        // Mission button
        const missionBtn = document.getElementById('mission-btn');
        if (missionBtn) {
            missionBtn.addEventListener('click', () => this.showMissions());
        }

        // Feed button
        const feedBtn = document.getElementById('feed-btn');
        if (feedBtn) {
            feedBtn.addEventListener('click', () => this.feedMascot());
        }

        // Send message button
        const sendBtn = document.getElementById('send-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        // Error modal close button
        const closeError = document.getElementById('close-error');
        if (closeError) {
            closeError.addEventListener('click', () => this.hideError());
        }
    }

    /**
     * Setup input event listeners
     */
    setupInputs() {
        // Chat input
        const chatInput = this.elements.get('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
            
            chatInput.addEventListener('input', (e) => {
                this.handleChatInput(e.target.value);
            });
        }
    }

    /**
     * Setup window event listeners
     */
    setupWindowEvents() {
        // Window resize
        window.addEventListener('resize', 
            PerformanceMonitor.debounce(() => this.handleResize(), 250)
        );

        // Network status
        window.addEventListener('online', () => this.updateConnectionStatus('connected'));
        window.addEventListener('offline', () => this.updateConnectionStatus('disconnected'));

        // App visibility
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.handleAppVisible();
            } else {
                this.handleAppHidden();
            }
        });
    }

    /**
     * Setup touch events for mobile
     */
    setupTouchEvents() {
        // Prevent zoom on double tap for better UX
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        });

        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    /**
     * Setup service event listeners
     */
    setupServiceListeners() {
        // Weather service listeners
        const weatherService = window.weatherService;
        if (weatherService) {
            weatherService.addEventListener('updateStarted', () => {
                this.showLoading('Updating weather...');
            });

            weatherService.addEventListener('weatherUpdated', (data) => {
                this.hideLoading();
                this.updateWeatherUI(data);
            });

            weatherService.addEventListener('updateError', (data) => {
                this.hideLoading();
                if (!data.isOffline) {
                    this.showError('Weather update failed', data.error);
                }
            });
        }

        // Mascot manager listeners
        const mascotManager = window.mascotManager;
        if (mascotManager) {
            mascotManager.addEventListener('interaction', (data) => {
                this.updateMascotUI(data);
            });

            mascotManager.addEventListener('levelUp', (data) => {
                this.showLevelUpNotification(data);
            });
        }

        // API client listeners
        const apiClient = window.apiClient;
        if (apiClient) {
            // Could add API status listeners here
        }
    }

    /**
     * Initialize UI state
     */
    async initializeUI() {
        this.showLoading('Initializing Weather Mascot...');
        
        // Initial connection status
        this.updateConnectionStatus('connecting');
        
        // Hide main app initially
        const app = this.elements.get('app');
        if (app) {
            app.style.display = 'none';
        }
        
        // Test API connection
        const connectionTest = await window.apiClient?.testConnection();
        if (connectionTest && connectionTest.success) {
            this.updateConnectionStatus('connected');
        } else {
            this.updateConnectionStatus('disconnected');
        }
        
        // Show app after brief delay for smooth loading
        setTimeout(() => {
            this.hideLoading();
            this.showApp();
        }, 1500);
    }

    /**
     * Show loading screen
     */
    showLoading(message = 'Loading...') {
        this.appState.isLoading = true;
        
        if (this.loadingScreen) {
            const loadingText = this.loadingScreen.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = message;
            }
            this.loadingScreen.classList.remove('hidden');
            this.loadingScreen.style.display = 'flex';
        }
    }

    /**
     * Hide loading screen
     */
    hideLoading() {
        this.appState.isLoading = false;
        
        if (this.loadingScreen) {
            this.loadingScreen.classList.add('hidden');
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
            }, 300); // Match CSS transition
        }
    }

    /**
     * Show main app
     */
    showApp() {
        const app = this.elements.get('app');
        if (app) {
            app.style.display = 'flex';
            app.classList.add('fade-in');
        }
    }

    /**
     * Update weather UI
     */
    updateWeatherUI(data) {
        const { weather, city } = data;
        
        if (!weather || !weather.current) return;

        // Update location
        const location = this.elements.get('current-location');
        if (location) {
            location.textContent = city || 'Unknown';
        }

        // Update weather icon
        const weatherIcon = this.elements.get('weather-icon');
        if (weatherIcon) {
            weatherIcon.textContent = window.weatherService?.getWeatherIcon(weather.current.weather);
        }

        // Update temperature
        const temperature = this.elements.get('temperature');
        if (temperature) {
            temperature.textContent = window.weatherService?.getFormattedTemperature(weather.current.temperature);
        }

        // Update description
        const description = this.elements.get('weather-description');
        if (description) {
            description.textContent = window.weatherService?.getWeatherDescription(weather.current.weather);
        }

        this.appState.currentWeather = weather;
    }

    /**
     * Update mascot UI
     */
    updateMascotUI(data) {
        // This is handled by MascotManager, but we could add additional UI updates here
        this.appState.mascotData = data.mascotData;
    }

    /**
     * Update connection status
     */
    updateConnectionStatus(status) {
        this.appState.connectionStatus = status;
        
        const statusElement = this.elements.get('connection-status');
        const statusText = this.elements.get('status-text');
        
        if (statusElement && statusText) {
            switch (status) {
                case 'connected':
                    statusElement.textContent = '🟢';
                    statusText.textContent = 'Connected';
                    break;
                case 'connecting':
                    statusElement.textContent = '🟡';
                    statusText.textContent = 'Connecting...';
                    break;
                case 'disconnected':
                    statusElement.textContent = '🔴';
                    statusText.textContent = 'Offline';
                    break;
            }
        }
    }

    /**
     * Show error modal
     */
    showError(title, message) {
        if (this.errorModal) {
            const titleElement = this.errorModal.querySelector('h3');
            const messageElement = this.errorModal.querySelector('p');
            
            if (titleElement) titleElement.textContent = title;
            if (messageElement) messageElement.textContent = message;
            
            this.errorModal.style.display = 'flex';
            this.errorModal.classList.add('fade-in');
        }
        
        this.appState.errorMessage = message;
    }

    /**
     * Hide error modal
     */
    hideError() {
        if (this.errorModal) {
            this.errorModal.style.display = 'none';
            this.errorModal.classList.remove('fade-in');
        }
        
        this.appState.errorMessage = null;
    }

    /**
     * Toggle chat section
     */
    toggleChat() {
        const chatSection = this.sections.get('chat-section');
        if (chatSection) {
            const isHidden = chatSection.classList.contains('hidden');
            
            if (isHidden) {
                chatSection.classList.remove('hidden');
                chatSection.classList.add('slide-up');
                
                // Focus chat input
                const chatInput = this.elements.get('chat-input');
                if (chatInput) {
                    setTimeout(() => chatInput.focus(), 300);
                }
            } else {
                chatSection.classList.add('hidden');
                chatSection.classList.remove('slide-up');
            }
        }
    }

    /**
     * Send chat message
     */
    async sendMessage() {
        const chatInput = this.elements.get('chat-input');
        if (!chatInput) return;

        const message = chatInput.value.trim();
        if (!message) return;

        // Clear input
        chatInput.value = '';

        // Add message to chat
        this.addChatMessage(message, 'user');

        try {
            // Send to API
            const response = await window.apiClient?.sendChatMessage(message);
            
            if (response && response.success) {
                this.addChatMessage(response.data.reply, 'mascot');
            } else {
                this.addChatMessage('Sorry, I could not understand that. 😕', 'mascot');
            }
        } catch (error) {
            this.addChatMessage('Oops! Something went wrong. Try again later. 🐾', 'mascot');
            console.error('Chat error:', error);
        }
    }

    /**
     * Add message to chat
     */
    addChatMessage(text, sender) {
        const chatMessages = this.elements.get('chat-messages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        
        const avatar = document.createElement('div');
        avatar.className = `message-avatar ${sender}`;
        avatar.textContent = sender === 'user' ? '👤' : '🐱';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = text;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * Handle chat input
     */
    handleChatInput(value) {
        // Could add typing indicators or other real-time features
        console.log('Chat input:', value);
    }

    /**
     * Refresh all data
     */
    async refreshAll() {
        console.log('🔄 Refreshing all data...');
        
        this.showLoading('Refreshing...');
        
        try {
            // Refresh weather
            if (window.weatherService) {
                await window.weatherService.forceRefresh();
            }
            
            // Refresh mascot data
            if (window.mascotManager) {
                await window.mascotManager.loadMascotData();
            }
            
            // Test connection
            const connectionTest = await window.apiClient?.testConnection();
            this.updateConnectionStatus(connectionTest?.success ? 'connected' : 'disconnected');
            
        } catch (error) {
            this.showError('Refresh Failed', 'Could not refresh data. Please try again.');
            console.error('Refresh error:', error);
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Feed mascot
     */
    async feedMascot() {
        try {
            const success = await window.mascotManager?.feed('normal');
            if (!success) {
                this.showError('Feed Failed', 'Could not feed your mascot. Please try again.');
            }
        } catch (error) {
            this.showError('Feed Failed', 'Something went wrong while feeding your mascot.');
            console.error('Feed error:', error);
        }
    }

    /**
     * Show level up notification
     */
    showLevelUpNotification(data) {
        // Could implement a fancy level up modal here
        console.log('🎉 Level up!', data);
    }

    /**
     * Show settings (placeholder)
     */
    showSettings() {
        console.log('⚙️ Settings clicked (not yet implemented)');
        // Could implement settings modal
    }

    /**
     * Show location select (placeholder)
     */
    showLocationSelect() {
        console.log('📍 Location clicked (not yet implemented)');
        // Could implement location selection
    }

    /**
     * Show missions (placeholder)
     */
    showMissions() {
        console.log('🎯 Missions clicked (not yet implemented)');
        // Could implement missions modal
    }

    /**
     * Handle resize events
     */
    handleResize() {
        console.log('📱 Window resized');
        // Could implement responsive adjustments
    }

    /**
     * Handle app becoming visible
     */
    handleAppVisible() {
        console.log('👁️ App visible - resuming activity');
        // Resume animations, check for updates, etc.
    }

    /**
     * Handle app becoming hidden
     */
    handleAppHidden() {
        console.log('🙈 App hidden - pausing activity');
        // Pause animations, save state, etc.
    }

    /**
     * Get current app state
     */
    getAppState() {
        return { ...this.appState };
    }

    /**
     * Get UI settings
     */
    getSettings() {
        return { ...this.settings };
    }
}

// Global UI manager instance
window.uiManager = new UIManager();

console.log('📱 UI Manager initialized');