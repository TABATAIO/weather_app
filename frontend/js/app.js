/**
 * Main Application Entry Point
 * Weather Mascot App - Enhanced Frontend
 */

// PWA Service Worker 登録
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

class WeatherMascotApp {
    constructor() {
        this.version = '2.0.0';
        this.isInitialized = false;
        this.isReady = false;
        this.startTime = Date.now();
        
        // Core services (initialized by their respective modules)
        this.perfMonitor = null;
        this.storage = null;
        this.apiClient = null;
        this.weatherService = null;
        this.mascotManager = null;
        this.backgroundController = null;
        this.uiManager = null;
        this.notificationService = null;
        
        // App state
        this.state = {
            isOnline: navigator.onLine,
            isVisible: document.visibilityState === 'visible',
            hasError: false,
            errorMessage: null
        };
        
        // Configuration
        this.config = {
            enableDebugMode: this.isDebugMode(),
            enablePerformanceMonitoring: true,
            enableOfflineMode: true,
            autoSave: true,
            autoSaveInterval: 30000 // 30 seconds
        };
        
        this.init();
    }

    /**
     * Check if debug mode is enabled
     */
    isDebugMode() {
        return location.search.includes('debug=true') || 
               location.hostname === 'localhost' ||
               window.localStorage.getItem('weather-app-debug') === 'true';
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log(`🚀 Weather Mascot App v${this.version} starting...`);
            
            // Set global app reference
            window.app = this;
            
            // Setup error handling
            this.setupErrorHandling();
            
            // Setup service references (services initialize themselves)
            this.setupServiceReferences();
            
            // Wait for DOM to be ready
            await this.waitForDOM();
            
            // Initialize application
            await this.initializeApp();
            
            // Setup global event listeners
            this.setupGlobalListeners();
            
            // Start auto-save if enabled
            if (this.config.autoSave) {
                this.startAutoSave();
            }
            
            // Mark as initialized
            this.isInitialized = true;
            
            // Run post-initialization tasks
            await this.postInitialization();
            
            // Mark as ready
            this.isReady = true;
            
            const loadTime = Date.now() - this.startTime;
            console.log(`✅ Weather Mascot App ready! (${loadTime}ms)`);
            
            // Log performance summary in debug mode
            if (this.config.enableDebugMode) {
                this.logPerformanceSummary();
            }
            
        } catch (error) {
            console.error('❌ Fatal error during app initialization:', error);
            this.handleFatalError(error);
        }
    }

    /**
     * Wait for DOM to be ready
     */
    async waitForDOM() {
        if (document.readyState === 'loading') {
            return new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve, { once: true });
            });
        }
    }

    /**
     * Setup service references
     */
    setupServiceReferences() {
        // Services initialize themselves and set global references
        // Wait a bit for them to initialize
        setTimeout(() => {
            this.perfMonitor = window.perfMonitor;
            this.storage = window.storage;
            this.apiClient = window.apiClient;
            this.weatherService = window.weatherService;
            this.mascotManager = window.mascotManager;
            this.backgroundController = window.backgroundController;
            this.uiManager = window.uiManager;
            this.notificationService = window.notificationService;
        }, 100);
    }

    /**
     * Initialize application services
     */
    async initializeApp() {
        console.log('🔧 Initializing app services...');
        
        // Test API connection
        await this.testApiConnection();
        
        // Load user preferences
        this.loadUserPreferences();
        
        // Initialize PWA features
        this.initializePWA();
        
        // Setup periodic tasks
        this.setupPeriodicTasks();
        
        console.log('✅ App services initialized');
    }

    /**
     * Test API connection and handle offline mode
     */
    async testApiConnection() {
        if (this.apiClient) {
            try {
                const result = await this.apiClient.testConnection();
                if (!result.success) {
                    console.warn('⚠️ API connection failed, enabling offline mode');
                    this.enableOfflineMode();
                }
            } catch (error) {
                console.warn('⚠️ API test failed, enabling offline mode:', error);
                this.enableOfflineMode();
            }
        }
    }

    /**
     * Load user preferences
     */
    loadUserPreferences() {
        const prefs = this.storage?.get('user_preferences') || {};
        
        // Apply theme preference
        if (prefs.theme) {
            this.setTheme(prefs.theme);
        }
        
        // Apply language preference
        if (prefs.language) {
            this.setLanguage(prefs.language);
        }
        
        // Apply other preferences
        this.applyPreferences(prefs);
    }

    /**
     * Initialize PWA features
     */
    initializePWA() {
        // Register service worker (if available)
        if ('serviceWorker' in navigator) {
            this.registerServiceWorker();
        }
        
        // Setup install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            this.handleInstallPrompt(e);
        });
        
        // Track installation
        window.addEventListener('appinstalled', () => {
            console.log('📱 App installed as PWA');
            this.notificationService?.showAppNotification(
                'App Installed!',
                'Weather Mascot is now available offline',
                'success'
            );
        });
    }

    /**
     * Register service worker
     */
    async registerServiceWorker() {
        try {
            // Service worker file would need to be created
            // const registration = await navigator.serviceWorker.register('/sw.js');
            // console.log('📡 Service worker registered:', registration);
        } catch (error) {
            console.warn('⚠️ Service worker registration failed:', error);
        }
    }

    /**
     * Handle PWA install prompt
     */
    handleInstallPrompt(event) {
        // Prevent the mini-infobar from appearing on mobile
        event.preventDefault();
        
        // Store the event for later use
        this.installPrompt = event;
        
        // Show custom install button/prompt
        this.showInstallOption();
    }

    /**
     * Show install option
     */
    showInstallOption() {
        // Could show custom install button in UI
        console.log('📱 PWA install available');
    }

    /**
     * Setup global event listeners
     */
    setupGlobalListeners() {
        // Network status
        window.addEventListener('online', () => {
            this.state.isOnline = true;
            this.handleOnline();
        });
        
        window.addEventListener('offline', () => {
            this.state.isOnline = false;
            this.handleOffline();
        });
        
        // Page visibility
        document.addEventListener('visibilitychange', () => {
            this.state.isVisible = document.visibilityState === 'visible';
            this.handleVisibilityChange();
        });
        
        // Unload handling
        window.addEventListener('beforeunload', (e) => {
            this.handleBeforeUnload(e);
        });
        
        // Error handling
        window.addEventListener('error', (e) => {
            this.handleGlobalError(e);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            this.handleUnhandledRejection(e);
        });
    }

    /**
     * Setup error handling
     */
    setupErrorHandling() {
        // Console error override for debugging
        if (this.config.enableDebugMode) {
            const originalError = console.error;
            console.error = (...args) => {
                originalError.apply(console, args);
                this.logError('Console Error', args.join(' '));
            };
        }
    }

    /**
     * Setup periodic tasks
     */
    setupPeriodicTasks() {
        // Periodic cleanup every 5 minutes
        setInterval(() => {
            this.performMaintenance();
        }, 5 * 60 * 1000);
        
        // Performance monitoring every minute
        if (this.config.enablePerformanceMonitoring) {
            setInterval(() => {
                this.checkPerformance();
            }, 60 * 1000);
        }
    }

    /**
     * Start auto-save
     */
    startAutoSave() {
        setInterval(() => {
            this.autoSave();
        }, this.config.autoSaveInterval);
    }

    /**
     * Auto-save application state
     */
    autoSave() {
        try {
            // Save mascot data
            this.mascotManager?.saveMascotData();
            
            // Save user preferences
            this.saveUserPreferences();
            
            // Clean up storage
            this.storage?.cleanup();
            
        } catch (error) {
            console.warn('⚠️ Auto-save failed:', error);
        }
    }

    /**
     * Handle online event
     */
    handleOnline() {
        console.log('🌐 App came online');
        
        // Re-enable online features
        this.disableOfflineMode();
        
        // Sync pending data
        this.syncPendingData();
        
        // Update UI
        this.uiManager?.updateConnectionStatus('connected');
        
        // Show notification
        this.notificationService?.showAppNotification(
            'Back Online!',
            'Syncing your data...',
            'success',
            3000
        );
    }

    /**
     * Handle offline event
     */
    handleOffline() {
        console.log('🔌 App went offline');
        
        // Enable offline mode
        this.enableOfflineMode();
        
        // Update UI
        this.uiManager?.updateConnectionStatus('disconnected');
        
        // Show notification
        this.notificationService?.showAppNotification(
            'Offline Mode',
            'Some features may be limited',
            'warning',
            5000
        );
    }

    /**
     * Enable offline mode
     */
    enableOfflineMode() {
        document.body.classList.add('offline-mode');
        // Disable features that require internet
        // Cache current data more aggressively
    }

    /**
     * Disable offline mode
     */
    disableOfflineMode() {
        document.body.classList.remove('offline-mode');
        // Re-enable online features
    }

    /**
     * Sync pending data when online
     */
    async syncPendingData() {
        // Sync mascot data
        if (this.mascotManager) {
            await this.mascotManager.saveMascotData();
        }
        
        // Refresh weather data
        if (this.weatherService) {
            await this.weatherService.updateWeather();
        }
    }

    /**
     * Handle visibility change
     */
    handleVisibilityChange() {
        if (this.state.isVisible) {
            console.log('👁️ App became visible');
            // Resume activities
            this.resumeApp();
        } else {
            console.log('🙈 App hidden');
            // Pause activities to save battery
            this.pauseApp();
        }
    }

    /**
     * Resume app activities
     */
    resumeApp() {
        // Resume animations
        this.backgroundController?.resumeAnimations();
        
        // Check for updates if been away for a while
        const lastUpdate = this.storage?.get('last_app_update') || 0;
        if (Date.now() - lastUpdate > 5 * 60 * 1000) { // 5 minutes
            this.refreshData();
        }
    }

    /**
     * Pause app activities
     */
    pauseApp() {
        // Pause animations to save battery
        this.backgroundController?.pauseAnimations();
        
        // Save current state
        this.storage?.set('last_app_update', Date.now());
    }

    /**
     * Refresh all data
     */
    async refreshData() {
        try {
            if (this.state.isOnline && this.weatherService) {
                await this.weatherService.forceRefresh();
            }
            
            if (this.mascotManager) {
                await this.mascotManager.loadMascotData();
            }
        } catch (error) {
            console.warn('⚠️ Data refresh failed:', error);
        }
    }

    /**
     * Handle before unload
     */
    handleBeforeUnload(event) {
        // Save critical data
        this.autoSave();
        
        // No confirmation needed for this app
        // event.preventDefault();
        // event.returnValue = '';
    }

    /**
     * Handle global errors
     */
    handleGlobalError(event) {
        const error = event.error;
        console.error('❌ Global error:', error);
        this.logError('Global Error', error?.message || 'Unknown error', error);
    }

    /**
     * Handle unhandled promise rejections
     */
    handleUnhandledRejection(event) {
        console.error('❌ Unhandled promise rejection:', event.reason);
        this.logError('Unhandled Promise', event.reason?.message || 'Promise rejected', event.reason);
        
        // Prevent the default browser error handling
        event.preventDefault();
    }

    /**
     * Handle fatal errors
     */
    handleFatalError(error) {
        this.state.hasError = true;
        this.state.errorMessage = error.message;
        
        // Show error UI
        this.showFatalErrorUI(error);
        
        // Log error
        this.logError('Fatal Error', error.message, error);
    }

    /**
     * Show fatal error UI
     */
    showFatalErrorUI(error) {
        // Create error screen if app won't start
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
            text-align: center;
            background: #f3f4f6;
            font-family: system-ui, sans-serif;
        `;
        
        const errorCard = document.createElement('div');
        errorCard.style.cssText = `
            max-width: 500px;
            padding: 40px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        `;
        
        // Emoji
        const emoji = document.createElement('div');
        emoji.style.cssText = 'font-size: 4rem; margin-bottom: 20px;';
        emoji.textContent = '😿';
        
        // Title
        const title = document.createElement('h1');
        title.style.cssText = 'color: #ef4444; margin-bottom: 16px;';
        title.textContent = 'Something went wrong';
        
        // Description
        const description = document.createElement('p');
        description.style.cssText = 'color: #6b7280; margin-bottom: 24px;';
        description.textContent = 'Weather Mascot encountered an error and can\'t start properly.';
        
        // Reload button
        const reloadBtn = document.createElement('button');
        reloadBtn.style.cssText = `
            padding: 12px 24px;
            background: #4f46e5;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
        `;
        reloadBtn.textContent = 'Reload App';
        reloadBtn.addEventListener('click', () => window.location.reload());
        
        // Error details
        const details = document.createElement('details');
        details.style.cssText = 'margin-top: 20px; text-align: left;';
        
        const summary = document.createElement('summary');
        summary.style.cssText = 'cursor: pointer; color: #6b7280;';
        summary.textContent = 'Error Details';
        
        const errorText = document.createElement('pre');
        errorText.style.cssText = `
            margin-top: 10px;
            padding: 10px;
            background: #f3f4f6;
            border-radius: 8px;
            overflow: auto;
            font-size: 12px;
            color: #374151;
        `;
        // Safely set error text (no HTML injection possible)
        errorText.textContent = error.stack || error.message || 'Unknown error';
        
        // Assemble DOM
        details.appendChild(summary);
        details.appendChild(errorText);
        
        errorCard.appendChild(emoji);
        errorCard.appendChild(title);
        errorCard.appendChild(description);
        errorCard.appendChild(reloadBtn);
        errorCard.appendChild(details);
        
        container.appendChild(errorCard);
        
        // Clear body and add error screen
        document.body.innerHTML = '';
        document.body.appendChild(container);
    }

    /**
     * Log error for debugging
     */
    logError(type, message, error = null) {
        const errorData = {
            type,
            message,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            stack: error?.stack
        };
        
        // Log to console (安全なログ出力)
        const safeType = String(type).replace(/%[sdioOjc%]/g, '');
        console.error('[ERROR_TYPE]', safeType, 'Error Data:', errorData);
        
        // Store locally for debugging
        try {
            const errors = this.storage?.get('error_log') || [];
            errors.push(errorData);
            
            // Keep only last 10 errors
            if (errors.length > 10) {
                errors.splice(0, errors.length - 10);
            }
            
            this.storage?.set('error_log', errors);
        } catch (storageError) {
            console.warn('⚠️ Could not save error log:', storageError);
        }
    }

    /**
     * Perform periodic maintenance
     */
    performMaintenance() {
        console.log('🧹 Performing maintenance...');
        
        // Clean up expired cache entries
        this.apiClient?.clearCache?.();
        
        // Clean up old notifications
        this.notificationService?.clearAllNotifications?.();
        
        // Clean up storage
        this.storage?.cleanup?.();
        
        // Check memory usage
        this.checkMemoryUsage();
    }

    /**
     * Check performance metrics
     */
    checkPerformance() {
        if (!this.perfMonitor) return;
        
        const summary = this.perfMonitor.getPerformanceSummary();
        
        // Warn about performance issues
        if (summary.averageApiTime > 3000) {
            console.warn('⚠️ Slow API performance detected');
        }
        
        if (summary.averageRenderTime > 16) {
            console.warn('⚠️ Slow rendering detected');
        }
    }

    /**
     * Check memory usage
     */
    checkMemoryUsage() {
        if ('memory' in performance) {
            const memory = performance.memory;
            const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
            const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);
            
            if (usedMB > limitMB * 0.9) {
                console.warn(`⚠️ High memory usage: ${usedMB}MB / ${limitMB}MB`);
                // Could trigger cleanup or memory optimization
            }
        }
    }

    /**
     * Apply user preferences
     */
    applyPreferences(prefs) {
        // Apply animation preferences
        if (prefs.enableAnimations !== undefined) {
            this.backgroundController?.toggleAnimations(prefs.enableAnimations);
        }
        
        // Apply notification preferences
        if (prefs.enableNotifications !== undefined) {
            this.notificationService?.updateSettings({ 
                enableAppNotifications: prefs.enableNotifications 
            });
        }
    }

    /**
     * Save user preferences
     */
    saveUserPreferences() {
        const prefs = {
            theme: this.getCurrentTheme(),
            language: this.getCurrentLanguage(),
            enableAnimations: this.backgroundController?.getCurrentBackground()?.animationsEnabled,
            enableNotifications: this.notificationService?.getStatus()?.settings?.enableAppNotifications,
            lastSaved: Date.now()
        };
        
        this.storage?.set('user_preferences', prefs);
    }

    /**
     * Post initialization tasks
     */
    async postInitialization() {
        // Show welcome message for first-time users
        if (this.storage?.get('_first_launch')) {
            this.showWelcome();
            this.storage?.set('_first_launch', false);
        }
        
        // Check for app updates
        this.checkForUpdates();
    }

    /**
     * Show welcome message
     */
    showWelcome() {
        this.notificationService?.showAppNotification(
            'Welcome! 🎉',
            'Meet your new weather mascot companion!',
            'success',
            8000
        );
    }

    /**
     * Check for app updates
     */
    checkForUpdates() {
        // Could implement update checking logic here
        const lastVersion = this.storage?.get('app_version');
        if (lastVersion && lastVersion !== this.version) {
            console.log(`📦 App updated: ${lastVersion} → ${this.version}`);
            this.storage?.set('app_version', this.version);
        }
    }

    /**
     * Set theme
     */
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'auto';
    }

    /**
     * Set language
     */
    setLanguage(language) {
        document.documentElement.setAttribute('lang', language);
    }

    /**
     * Get current language
     */
    getCurrentLanguage() {
        return document.documentElement.getAttribute('lang') || 'ja';
    }

    /**
     * Log performance summary
     */
    logPerformanceSummary() {
        if (this.perfMonitor) {
            console.log('📊 Performance Summary:', this.perfMonitor.getPerformanceSummary());
        }
        
        if (this.storage) {
            console.log('💾 Storage Usage:', this.storage.getUsageInfo());
        }
        
        console.log('🚀 App State:', {
            version: this.version,
            isInitialized: this.isInitialized,
            isReady: this.isReady,
            loadTime: Date.now() - this.startTime,
            ...this.state
        });
    }

    /**
     * Get app info for debugging
     */
    getAppInfo() {
        return {
            version: this.version,
            isInitialized: this.isInitialized,
            isReady: this.isReady,
            state: this.state,
            config: this.config,
            services: {
                perfMonitor: !!this.perfMonitor,
                storage: !!this.storage,
                apiClient: !!this.apiClient,
                weatherService: !!this.weatherService,
                mascotManager: !!this.mascotManager,
                backgroundController: !!this.backgroundController,
                uiManager: !!this.uiManager,
                notificationService: !!this.notificationService
            }
        };
    }
}

// Initialize the application
console.log('🔧 Starting Weather Mascot App...');
window.weatherMascotApp = new WeatherMascotApp();

// Export for debugging
window.app = window.weatherMascotApp;