/**
 * Notification Service Module
 * ブラウザ通知とアプリ内通知の管理
 */

class NotificationService {
    constructor() {
        this.isSupported = 'Notification' in window;
        this.permission = this.isSupported ? Notification.permission : 'denied';
        this.isEnabled = false;
        this.settings = {
            enableBrowserNotifications: false,
            enableAppNotifications: true,
            notifyOnWeatherChange: true,
            notifyOnLevelUp: true,
            notifyOnLowStats: true,
            quietHours: {
                enabled: true,
                start: 22, // 22:00
                end: 8     // 08:00
            }
        };
        
        // Queue for app notifications
        this.notificationQueue = [];
        this.maxQueueSize = 10;
        
        // Active notifications
        this.activeNotifications = new Map();
        this.notificationId = 0;
        
        this.init();
    }

    async init() {
        console.log('🔔 Notification Service initialized');
        
        // Load settings
        this.loadSettings();
        
        // Check notification support and request permission if enabled
        if (this.settings.enableBrowserNotifications) {
            await this.requestPermission();
        }
        
        // Setup service workers for background notifications (if supported)
        this.setupServiceWorker();
        
        // Setup app notification container
        this.setupNotificationContainer();
        
        // Setup service listeners
        this.setupServiceListeners();
        
        // Enable service if supported and permitted
        this.isEnabled = this.isSupported && this.permission === 'granted';
        
        console.log(`🔔 Notifications ${this.isEnabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Load notification settings
     */
    loadSettings() {
        const saved = window.storage?.get('notification_settings');
        if (saved) {
            this.settings = { ...this.settings, ...saved };
        }
    }

    /**
     * Save notification settings
     */
    saveSettings() {
        window.storage?.set('notification_settings', this.settings);
    }

    /**
     * Request notification permission
     */
    async requestPermission() {
        if (!this.isSupported) {
            console.warn('⚠️ Browser notifications not supported');
            return false;
        }

        if (this.permission === 'granted') {
            return true;
        }

        if (this.permission === 'default') {
            try {
                this.permission = await Notification.requestPermission();
                console.log(`🔔 Notification permission: ${this.permission}`);
                
                return this.permission === 'granted';
            } catch (error) {
                console.error('❌ Failed to request notification permission:', error);
                return false;
            }
        }

        return false;
    }

    /**
     * Setup service worker for background notifications
     */
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            // Register service worker for notifications (placeholder)
            // In a real app, you'd create a service worker file
            console.log('📡 Service worker support detected');
        }
    }

    /**
     * Setup app notification container
     */
    setupNotificationContainer() {
        // Create notification container if it doesn't exist
        let container = document.getElementById('app-notifications');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'app-notifications';
            container.className = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                max-width: 350px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }

        this.notificationContainer = container;
        this.addNotificationStyles();
    }

    /**
     * Add notification styles
     */
    addNotificationStyles() {
        if (document.getElementById('notification-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .app-notification {
                background: rgba(255, 255, 255, 0.95);
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 12px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(20px);
                pointer-events: auto;
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.3s ease-out;
                cursor: pointer;
                max-width: 350px;
                word-wrap: break-word;
            }

            .app-notification.show {
                transform: translateX(0);
                opacity: 1;
            }

            .app-notification.hide {
                transform: translateX(100%);
                opacity: 0;
            }

            .notification-icon {
                font-size: 24px;
                margin-right: 12px;
                float: left;
                line-height: 1;
            }

            .notification-content {
                margin-left: 36px;
            }

            .notification-title {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 4px;
            }

            .notification-message {
                font-size: 14px;
                color: #6b7280;
                line-height: 1.4;
            }

            .notification-time {
                font-size: 12px;
                color: #9ca3af;
                margin-top: 8px;
            }

            .app-notification.success {
                border-left: 4px solid #10b981;
            }

            .app-notification.warning {
                border-left: 4px solid #f59e0b;
            }

            .app-notification.error {
                border-left: 4px solid #ef4444;
            }

            .app-notification.info {
                border-left: 4px solid #3b82f6;
            }

            @media (max-width: 768px) {
                .notification-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
                
                .app-notification {
                    max-width: none;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Setup service event listeners
     */
    setupServiceListeners() {
        // Weather service listeners
        window.weatherService?.addEventListener('significantWeatherChange', (data) => {
            if (this.settings.notifyOnWeatherChange && !this.isQuietHours()) {
                this.notifyWeatherChange(data);
            }
        });

        // Mascot manager listeners
        window.mascotManager?.addEventListener('levelUp', (data) => {
            if (this.settings.notifyOnLevelUp) {
                this.notifyLevelUp(data);
            }
        });

        // Check for low mascot stats
        window.mascotManager?.addEventListener('interaction', (data) => {
            if (this.settings.notifyOnLowStats) {
                this.checkLowStats(data.mascotData);
            }
        });
    }

    /**
     * Check if current time is in quiet hours
     */
    isQuietHours() {
        if (!this.settings.quietHours.enabled) return false;

        const now = new Date();
        const hour = now.getHours();
        const { start, end } = this.settings.quietHours;

        if (start > end) {
            // Crosses midnight (e.g., 22:00 to 08:00)
            return hour >= start || hour < end;
        } else {
            // Same day (e.g., 14:00 to 18:00)
            return hour >= start && hour < end;
        }
    }

    /**
     * Show browser notification
     */
    showBrowserNotification(title, options = {}) {
        if (!this.isEnabled || !this.settings.enableBrowserNotifications || this.isQuietHours()) {
            return null;
        }

        try {
            const notification = new Notification(title, {
                icon: '/img/mascot-icon.png', // Add your app icon
                badge: '/img/mascot-badge.png', // Add badge icon
                tag: options.tag || 'weather-app', // Prevent duplicate notifications
                requireInteraction: false,
                silent: false,
                ...options
            });

            // Auto-close after 5 seconds
            setTimeout(() => {
                notification.close();
            }, 5000);

            return notification;
        } catch (error) {
            console.error('❌ Failed to show browser notification:', error);
            return null;
        }
    }

    /**
     * Show app notification
     */
    showAppNotification(title, message, type = 'info', duration = 5000) {
        if (!this.settings.enableAppNotifications) return;

        const notification = {
            id: ++this.notificationId,
            title,
            message,
            type,
            time: new Date(),
            duration
        };

        // Add to queue if container not ready
        if (!this.notificationContainer) {
            this.notificationQueue.push(notification);
            
            // Limit queue size
            if (this.notificationQueue.length > this.maxQueueSize) {
                this.notificationQueue.shift();
            }
            return;
        }

        this.displayAppNotification(notification);
    }

    /**
     * Display app notification in UI
     */
    displayAppNotification(notification) {
        const { id, title, message, type, time, duration } = notification;

        // Create notification element
        const notificationEl = document.createElement('div');
        notificationEl.className = `app-notification ${type}`;
        notificationEl.setAttribute('data-id', id);

        const iconMap = {
            success: '✅',
            warning: '⚠️',
            error: '❌',
            info: 'ℹ️'
        };

        // Create notification icon
        const iconDiv = document.createElement('div');
        iconDiv.className = 'notification-icon';
        iconDiv.textContent = iconMap[type] || 'ℹ️';
        
        // Create notification content container
        const contentDiv = document.createElement('div');
        contentDiv.className = 'notification-content';
        
        // Create title element
        const titleDiv = document.createElement('div');
        titleDiv.className = 'notification-title';
        titleDiv.textContent = title; // Safe - no HTML injection possible
        
        // Create message element  
        const messageDiv = document.createElement('div');
        messageDiv.className = 'notification-message';
        messageDiv.textContent = message; // Safe - no HTML injection possible
        
        // Create time element
        const timeDiv = document.createElement('div');
        timeDiv.className = 'notification-time';
        timeDiv.textContent = this.formatTime(time);
        
        // Assemble notification
        contentDiv.appendChild(titleDiv);
        contentDiv.appendChild(messageDiv);
        contentDiv.appendChild(timeDiv);
        
        notificationEl.appendChild(iconDiv);
        notificationEl.appendChild(contentDiv);

        // Handle click to dismiss
        notificationEl.addEventListener('click', () => {
            this.dismissAppNotification(id);
        });

        // Add to container
        this.notificationContainer.appendChild(notificationEl);

        // Trigger show animation
        setTimeout(() => {
            notificationEl.classList.add('show');
        }, 100);

        // Store reference
        this.activeNotifications.set(id, {
            element: notificationEl,
            timeout: setTimeout(() => {
                this.dismissAppNotification(id);
            }, duration)
        });

        console.log(`🔔 App notification: ${title}`);
    }

    /**
     * Dismiss app notification
     */
    dismissAppNotification(id) {
        const notification = this.activeNotifications.get(id);
        if (!notification) return;

        const { element, timeout } = notification;

        // Clear timeout
        clearTimeout(timeout);

        // Hide animation
        element.classList.add('hide');

        // Remove from DOM after animation
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 300);

        // Remove from active notifications
        this.activeNotifications.delete(id);
    }

    /**
     * Weather change notification
     */
    notifyWeatherChange(data) {
        const changes = data.changes;
        let message = 'Weather has changed!';

        if (changes.length > 0) {
            const change = changes[0];
            if (change.type === 'condition') {
                message = `Weather changed from ${change.old} to ${change.new}`;
            } else if (change.type === 'temperature') {
                message = `Temperature changed by ${Math.round(change.difference)}°C`;
            }
        }

        // App notification
        this.showAppNotification('Weather Update', message, 'info');

        // Browser notification
        this.showBrowserNotification('Weather Update', {
            body: message,
            tag: 'weather-change'
        });
    }

    /**
     * Level up notification
     */
    notifyLevelUp(data) {
        const message = `Your mascot reached level ${data.newLevel}! 🎉`;

        // App notification
        this.showAppNotification('Level Up!', message, 'success', 8000);

        // Browser notification
        this.showBrowserNotification('Level Up!', {
            body: message,
            tag: 'level-up'
        });
    }

    /**
     * Check and notify low stats
     */
    checkLowStats(mascotData) {
        const { happiness, hunger, health } = mascotData;

        if (hunger < 20) {
            this.showAppNotification(
                'Mascot is Hungry!',
                'Your mascot needs food. Feed them to keep them happy!',
                'warning'
            );
        } else if (happiness < 30) {
            this.showAppNotification(
                'Mascot is Sad',
                'Spend some time with your mascot to cheer them up!',
                'warning'
            );
        } else if (health < 20) {
            this.showAppNotification(
                'Mascot Needs Care',
                'Your mascot\'s health is low. Take good care of them!',
                'error'
            );
        }
    }

    /**
     * Format time for display
     */
    formatTime(date) {
        return date.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Enable notifications
     */
    async enableNotifications(browserNotifications = true, appNotifications = true) {
        this.settings.enableAppNotifications = appNotifications;
        this.settings.enableBrowserNotifications = browserNotifications;

        if (browserNotifications) {
            await this.requestPermission();
            this.isEnabled = this.permission === 'granted';
        }

        this.saveSettings();
        console.log('🔔 Notifications enabled');
    }

    /**
     * Disable notifications
     */
    disableNotifications() {
        this.settings.enableBrowserNotifications = false;
        this.settings.enableAppNotifications = false;
        this.isEnabled = false;

        // Clear active notifications
        this.clearAllNotifications();

        this.saveSettings();
        console.log('🔕 Notifications disabled');
    }

    /**
     * Clear all active notifications
     */
    clearAllNotifications() {
        // Clear app notifications
        for (const [id] of this.activeNotifications) {
            this.dismissAppNotification(id);
        }

        // Clear notification queue
        this.notificationQueue = [];
    }

    /**
     * Update notification settings
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        console.log('🔔 Notification settings updated');
    }

    /**
     * Get notification status for debugging
     */
    getStatus() {
        return {
            isSupported: this.isSupported,
            permission: this.permission,
            isEnabled: this.isEnabled,
            settings: this.settings,
            activeNotifications: this.activeNotifications.size,
            queuedNotifications: this.notificationQueue.length,
            isQuietHours: this.isQuietHours()
        };
    }
}

// Global notification service instance
window.notificationService = new NotificationService();

console.log('🔔 Notification Service initialized');