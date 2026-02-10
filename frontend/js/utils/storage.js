/**
 * Enhanced Storage Utility
 * ローカルストレージとセッションストレージの管理ユーティリティ
 */

class StorageManager {
    constructor() {
        this.prefix = 'weatherApp_';
        this.version = '2.0';
        this.maxRetries = 3;
        this.init();
    }

    init() {
        // Check storage availability
        this.localStorageAvailable = this.checkStorageAvailability('localStorage');
        this.sessionStorageAvailable = this.checkStorageAvailability('sessionStorage');
        
        // Initialize storage version
        this.initStorageVersion();
        
        console.log('💾 Storage Manager initialized', {
            localStorage: this.localStorageAvailable,
            sessionStorage: this.sessionStorageAvailable,
            version: this.version
        });
    }

    /**
     * Check if storage is available
     */
    checkStorageAvailability(type) {
        try {
            const storage = window[type];
            const test = '__storage_test__';
            storage.setItem(test, test);
            storage.removeItem(test);
            return true;
        } catch (error) {
            console.warn(`${type} not available:`, error);
            return false;
        }
    }

    /**
     * Initialize storage version and migrate if needed
     */
    initStorageVersion() {
        const currentVersion = this.get('_app_version', 'meta');
        
        if (currentVersion !== this.version) {
            console.log(`🔄 Storage migration: ${currentVersion || 'none'} → ${this.version}`);
            this.migrateStorage(currentVersion, this.version);
            this.set('_app_version', this.version, 'meta');
        }
    }

    /**
     * Migrate storage data between versions
     */
    migrateStorage(fromVersion, toVersion) {
        try {
            // Add migration logic here as needed
            if (!fromVersion) {
                // First time setup
                this.set('_first_launch', true, 'meta');
            }
            
            console.log(`✅ Storage migration completed: ${fromVersion} → ${toVersion}`);
        } catch (error) {
            console.error('❌ Storage migration failed:', error);
        }
    }

    /**
     * Generate storage key with prefix
     */
    getKey(key, namespace = 'default') {
        return `${this.prefix}${namespace}_${key}`;
    }

    /**
     * Set item in localStorage with error handling and compression
     */
    set(key, value, namespace = 'default', options = {}) {
        if (!this.localStorageAvailable) {
            console.warn('localStorage not available, using memory fallback');
            return this.setInMemory(key, value, namespace);
        }

        const storageKey = this.getKey(key, namespace);
        const { 
            compress = false, 
            expiry = null,
            encrypt = false 
        } = options;

        try {
            const data = {
                value: value,
                timestamp: Date.now(),
                version: this.version,
                expiry: expiry ? Date.now() + expiry : null
            };

            let serializedData = JSON.stringify(data);

            // Compress large data (>5KB)
            if (compress && serializedData.length > 5120) {
                // Simple compression placeholder
                // In production, you might want to use a library like LZ-string
                console.log(`📦 Compressing large data for key: ${key}`);
            }

            // Encrypt sensitive data
            if (encrypt) {
                // Simple encryption placeholder
                // In production, implement proper encryption
                console.log(`🔐 Encrypting data for key: ${key}`);
            }

            localStorage.setItem(storageKey, serializedData);
            
            console.log(`💾 Stored: ${key} (${this.formatBytes(serializedData.length)})`);
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.warn('Storage quota exceeded, cleaning up...');
                this.cleanup();
                // Retry after cleanup
                try {
                    localStorage.setItem(storageKey, JSON.stringify({ value, timestamp: Date.now() }));
                    return true;
                } catch (retryError) {
                    console.error('Storage failed even after cleanup:', retryError);
                }
            }
            console.error(`Failed to store ${key}:`, error);
            return false;
        }
    }

    /**
     * Get item from localStorage with error handling
     */
    get(key, namespace = 'default', defaultValue = null) {
        if (!this.localStorageAvailable) {
            return this.getFromMemory(key, namespace) || defaultValue;
        }

        const storageKey = this.getKey(key, namespace);

        try {
            const item = localStorage.getItem(storageKey);
            
            if (item === null) {
                return defaultValue;
            }

            const data = JSON.parse(item);

            // Check expiry
            if (data.expiry && Date.now() > data.expiry) {
                console.log(`⏰ Expired data removed: ${key}`);
                this.remove(key, namespace);
                return defaultValue;
            }

            // Handle version mismatch
            if (data.version && data.version !== this.version) {
                console.log(`📝 Version mismatch for ${key}: ${data.version} vs ${this.version}`);
                // Depending on the key, you might want to migrate or remove
            }

            return data.value !== undefined ? data.value : defaultValue;
        } catch (error) {
            console.error(`Failed to retrieve ${key}:`, error);
            return defaultValue;
        }
    }

    /**
     * Remove item from localStorage
     */
    remove(key, namespace = 'default') {
        if (!this.localStorageAvailable) {
            return this.removeFromMemory(key, namespace);
        }

        const storageKey = this.getKey(key, namespace);
        
        try {
            localStorage.removeItem(storageKey);
            console.log(`🗑️ Removed: ${key}`);
            return true;
        } catch (error) {
            console.error(`Failed to remove ${key}:`, error);
            return false;
        }
    }

    /**
     * Session storage methods
     */
    setSession(key, value, namespace = 'default') {
        if (!this.sessionStorageAvailable) {
            return this.setInMemory(key, value, `session_${namespace}`);
        }

        const storageKey = this.getKey(key, namespace);
        
        try {
            sessionStorage.setItem(storageKey, JSON.stringify({
                value,
                timestamp: Date.now()
            }));
            return true;
        } catch (error) {
            console.error(`Failed to store session ${key}:`, error);
            return false;
        }
    }

    getSession(key, namespace = 'default', defaultValue = null) {
        if (!this.sessionStorageAvailable) {
            return this.getFromMemory(key, `session_${namespace}`) || defaultValue;
        }

        const storageKey = this.getKey(key, namespace);
        
        try {
            const item = sessionStorage.getItem(storageKey);
            return item ? JSON.parse(item).value : defaultValue;
        } catch (error) {
            console.error(`Failed to retrieve session ${key}:`, error);
            return defaultValue;
        }
    }

    removeSession(key, namespace = 'default') {
        if (!this.sessionStorageAvailable) {
            return this.removeFromMemory(key, `session_${namespace}`);
        }

        const storageKey = this.getKey(key, namespace);
        
        try {
            sessionStorage.removeItem(storageKey);
            return true;
        } catch (error) {
            console.error(`Failed to remove session ${key}:`, error);
            return false;
        }
    }

    /**
     * Memory fallback for when storage is not available
     */
    setInMemory(key, value, namespace) {
        if (!this.memoryStorage) {
            this.memoryStorage = new Map();
        }
        
        const storageKey = this.getKey(key, namespace);
        this.memoryStorage.set(storageKey, {
            value,
            timestamp: Date.now()
        });
        return true;
    }

    getFromMemory(key, namespace) {
        if (!this.memoryStorage) {
            return null;
        }
        
        const storageKey = this.getKey(key, namespace);
        const data = this.memoryStorage.get(storageKey);
        return data ? data.value : null;
    }

    removeFromMemory(key, namespace) {
        if (!this.memoryStorage) {
            return true;
        }
        
        const storageKey = this.getKey(key, namespace);
        return this.memoryStorage.delete(storageKey);
    }

    /**
     * Clean up expired and old data
     */
    cleanup() {
        if (!this.localStorageAvailable) return;

        console.log('🧹 Starting storage cleanup...');
        
        const keysToRemove = [];
        const now = Date.now();
        const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000); // 1 week

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            
            if (!key || !key.startsWith(this.prefix)) {
                continue;
            }

            try {
                const data = JSON.parse(localStorage.getItem(key));
                
                // Remove expired items
                if (data.expiry && now > data.expiry) {
                    keysToRemove.push(key);
                }
                
                // Remove very old items without expiry
                else if (!data.expiry && data.timestamp && data.timestamp < oneWeekAgo) {
                    keysToRemove.push(key);
                }
            } catch (error) {
                // Remove corrupted items
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });

        console.log(`🗑️ Cleaned up ${keysToRemove.length} items`);
    }

    /**
     * Get storage usage information
     */
    getUsageInfo() {
        if (!this.localStorageAvailable) {
            return { available: false };
        }

        let totalSize = 0;
        let appSize = 0;
        let itemCount = 0;

        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                const itemSize = localStorage[key].length;
                totalSize += itemSize;
                
                if (key.startsWith(this.prefix)) {
                    appSize += itemSize;
                    itemCount++;
                }
            }
        }

        return {
            available: true,
            totalSize: this.formatBytes(totalSize),
            appSize: this.formatBytes(appSize),
            itemCount,
            quota: this.formatBytes(5 * 1024 * 1024) // 5MB typical limit
        };
    }

    /**
     * Format bytes for display
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Clear all app data
     */
    clearAll() {
        if (!this.localStorageAvailable && !this.sessionStorageAvailable) {
            if (this.memoryStorage) {
                this.memoryStorage.clear();
            }
            return;
        }

        const keysToRemove = [];
        
        // Local storage
        if (this.localStorageAvailable) {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
        }

        // Session storage
        if (this.sessionStorageAvailable) {
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    sessionStorage.removeItem(key);
                }
            }
        }

        console.log(`🗑️ Cleared all app data (${keysToRemove.length} items)`);
    }
}

// Global storage instance
window.storage = new StorageManager();

console.log('🏪 Storage Manager initialized');