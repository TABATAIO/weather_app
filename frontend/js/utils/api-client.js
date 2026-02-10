/**
 * Enhanced API Client
 * REST API通信を管理する高機能クライアント
 */

class ApiClient {
    constructor() {
        // Environment detection
        this.hostname = window.location.hostname;
        this.port = window.location.port;
        this.protocol = window.location.protocol;
        this.isDocker = this.hostname !== 'localhost' && this.hostname !== '127.0.0.1';
        
        // Base URL configuration
        this.baseUrl = this.isDocker ? '' : 'http://localhost:3001';
        
        // Request configuration
        this.timeout = 30000; // 30 seconds
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second
        
        // Request queue for rate limiting
        this.requestQueue = [];
        this.maxConcurrentRequests = 5;
        this.activeRequests = 0;
        
        // Cache configuration
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        
        // Request interceptors
        this.requestInterceptors = [];
        this.responseInterceptors = [];
        
        this.init();
    }

    init() {
        // Add default request interceptors
        this.addRequestInterceptor(this.addTimestamp.bind(this));
        this.addRequestInterceptor(this.addAuth.bind(this));
        this.addRequestInterceptor(this.logRequest.bind(this));
        
        // Add default response interceptors
        this.addResponseInterceptor(this.logResponse.bind(this));
        this.addResponseInterceptor(this.handleErrors.bind(this));
        
        console.log('🌐 API Client initialized', {
            baseUrl: this.baseUrl,
            isDocker: this.isDocker,
            environment: this.isDocker ? 'production' : 'development'
        });
    }

    /**
     * Add request interceptor
     */
    addRequestInterceptor(interceptor) {
        this.requestInterceptors.push(interceptor);
    }

    /**
     * Add response interceptor
     */
    addResponseInterceptor(interceptor) {
        this.responseInterceptors.push(interceptor);
    }

    /**
     * Default request interceptors
     */
    addTimestamp(config) {
        config.timestamp = Date.now();
        return config;
    }

    addAuth(config) {
        const token = window.storage?.get('auth_token');
        if (token) {
            config.headers = {
                ...config.headers,
                'Authorization': `Bearer ${token}`
            };
        }
        return config;
    }

    logRequest(config) {
        console.log(`📤 API Request: ${config.method} ${config.url}`, config);
        return config;
    }

    /**
     * Default response interceptors
     */
    logResponse(response, config) {
        const duration = Date.now() - config.timestamp;
        console.log(`📥 API Response: ${config.method} ${config.url} (${duration}ms)`, response);
        return response;
    }

    async handleErrors(response, config) {
        if (!response.ok) {
            const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
            error.status = response.status;
            error.response = response;
            error.config = config;
            
            try {
                error.data = await response.json();
            } catch (parseError) {
                error.data = await response.text();
            }
            
            throw error;
        }
        return response;
    }

    /**
     * Generate cache key
     */
    getCacheKey(url, options = {}) {
        const { method = 'GET', body } = options;
        return `${method}:${url}:${body ? JSON.stringify(body) : ''}`;
    }

    /**
     * Check cache
     */
    checkCache(cacheKey) {
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() < cached.expiry) {
            console.log(`💾 Cache hit: ${cacheKey}`);
            return cached.data;
        }
        
        if (cached) {
            this.cache.delete(cacheKey);
        }
        return null;
    }

    /**
     * Set cache
     */
    setCache(cacheKey, data) {
        this.cache.set(cacheKey, {
            data: data,
            expiry: Date.now() + this.cacheExpiry
        });
    }

    /**
     * Wait for available request slot
     */
    async waitForSlot() {
        return new Promise((resolve) => {
            const checkSlot = () => {
                if (this.activeRequests < this.maxConcurrentRequests) {
                    this.activeRequests++;
                    resolve();
                } else {
                    setTimeout(checkSlot, 100); // Check every 100ms
                }
            };
            checkSlot();
        });
    }

    /**
     * Release request slot
     */
    releaseSlot() {
        this.activeRequests = Math.max(0, this.activeRequests - 1);
    }

    /**
     * Make HTTP request with retry logic
     */
    async makeRequest(url, options = {}) {
        const {
            method = 'GET',
            headers = {},
            body = null,
            cache = true,
            timeout = this.timeout,
            retries = this.retryAttempts
        } = options;

        // Build full URL
        const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
        
        // Create request configuration
        const config = {
            method: method.toUpperCase(),
            url: fullUrl,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body,
            cache,
            timeout,
            retries
        };

        // Apply request interceptors
        let processedConfig = config;
        for (const interceptor of this.requestInterceptors) {
            processedConfig = await interceptor(processedConfig);
        }

        // Check cache for GET requests
        const cacheKey = this.getCacheKey(fullUrl, processedConfig);
        if (method.toUpperCase() === 'GET' && cache) {
            const cachedData = this.checkCache(cacheKey);
            if (cachedData) {
                return cachedData;
            }
        }

        // Performance monitoring
        const perfStart = window.perfMonitor?.markApiStart(fullUrl) || null;

        // Wait for available request slot
        await this.waitForSlot();

        try {
            const response = await this.fetchWithTimeout(processedConfig);
            
            // Apply response interceptors
            let processedResponse = response;
            for (const interceptor of this.responseInterceptors) {
                processedResponse = await interceptor(processedResponse, processedConfig);
            }

            const data = await processedResponse.json();

            // Cache successful GET requests
            if (method.toUpperCase() === 'GET' && cache && processedResponse.ok) {
                this.setCache(cacheKey, data);
            }

            // Performance monitoring
            if (perfStart) {
                window.perfMonitor.markApiEnd(fullUrl, perfStart);
            }

            return data;

        } catch (error) {
            console.error(`❌ API Error (${method} ${fullUrl}):`, error);

            // Retry logic for specific errors
            if (retries > 0 && this.shouldRetry(error)) {
                console.log(`🔄 Retrying... (${retries} attempts remaining)`);
                await this.delay(this.retryDelay);
                return this.makeRequest(url, {
                    ...options,
                    retries: retries - 1
                });
            }

            throw this.createApiError(error, config);
        } finally {
            this.releaseSlot();
        }
    }

    /**
     * Fetch with timeout
     */
    async fetchWithTimeout(config) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);

        const fetchOptions = {
            method: config.method,
            headers: config.headers,
            signal: controller.signal
        };

        if (config.body) {
            fetchOptions.body = typeof config.body === 'string' 
                ? config.body 
                : JSON.stringify(config.body);
        }

        try {
            const response = await fetch(config.url, fetchOptions);
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error(`Request timeout: ${config.url}`);
            }
            throw error;
        }
    }

    /**
     * Determine if request should be retried
     */
    shouldRetry(error) {
        // Retry on network errors or 5xx server errors
        return !error.status || 
               error.status >= 500 || 
               error.message.includes('timeout') ||
               error.message.includes('network');
    }

    /**
     * Create standardized API error
     */
    createApiError(originalError, config) {
        const error = new Error(originalError.message || 'API request failed');
        error.name = 'ApiError';
        error.original = originalError;
        error.config = config;
        error.timestamp = Date.now();
        
        if (originalError.status) {
            error.status = originalError.status;
            error.response = originalError.response;
            error.data = originalError.data;
        }
        
        return error;
    }

    /**
     * Delay helper for retries
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // === Weather API Methods ===

    /**
     * Get current weather by city name
     */
    async getCurrentWeather(cityName = 'tokyo') {
        const url = `/api/weather/city/${encodeURIComponent(cityName)}`;
        return this.makeRequest(url, {
            method: 'GET',
            cache: true
        });
    }

    /**
     * Get weather forecast
     */
    async getWeatherForecast(cityName = 'tokyo', days = 5) {
        const url = `/api/weather/forecast/${encodeURIComponent(cityName)}?days=${days}`;
        return this.makeRequest(url, {
            method: 'GET',
            cache: true
        });
    }

    // === Mascot API Methods ===

    /**
     * Get mascot status
     */
    async getMascotStatus() {
        const url = '/api/mascot/status';
        return this.makeRequest(url, {
            method: 'GET',
            cache: false // Always get fresh status
        });
    }

    /**
     * Update mascot status
     */
    async updateMascotStatus(updates) {
        const url = '/api/mascot/status';
        return this.makeRequest(url, {
            method: 'PUT',
            body: updates,
            cache: false
        });
    }

    /**
     * Send chat message to mascot
     */
    async sendChatMessage(message, context = {}) {
        const url = '/api/mascot/chat';
        return this.makeRequest(url, {
            method: 'POST',
            body: {
                message,
                context,
                timestamp: Date.now()
            },
            cache: false
        });
    }

    /**
     * Feed mascot
     */
    async feedMascot(foodType = 'normal', amount = 1) {
        const url = '/api/mascot/feed';
        return this.makeRequest(url, {
            method: 'POST',
            body: {
                foodType,
                amount,
                timestamp: Date.now()
            },
            cache: false
        });
    }

    /**
     * Get missions
     */
    async getMissions() {
        const url = '/api/missions';
        return this.makeRequest(url, {
            method: 'GET',
            cache: true
        });
    }

    /**
     * Complete mission
     */
    async completeMission(missionId) {
        const url = `/api/missions/${missionId}/complete`;
        return this.makeRequest(url, {
            method: 'POST',
            cache: false
        });
    }

    // === Authentication Methods ===

    /**
     * Login user
     */
    async login(credentials) {
        const url = '/api/auth/login';
        const response = await this.makeRequest(url, {
            method: 'POST',
            body: credentials,
            cache: false
        });
        
        // Store auth token
        if (response.token) {
            window.storage?.set('auth_token', response.token);
        }
        
        return response;
    }

    /**
     * Logout user
     */
    async logout() {
        const url = '/api/auth/logout';
        try {
            await this.makeRequest(url, {
                method: 'POST',
                cache: false
            });
        } finally {
            // Always clear local auth data
            window.storage?.remove('auth_token');
        }
    }

    // === Utility Methods ===

    /**
     * Test API connection
     */
    async testConnection() {
        try {
            const url = '/api/health';
            const response = await this.makeRequest(url, {
                method: 'GET',
                timeout: 5000, // Shorter timeout for health check
                retries: 1
            });
            
            console.log('✅ API connection test successful', response);
            return { success: true, data: response };
        } catch (error) {
            console.error('❌ API connection test failed', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ API cache cleared');
    }

    /**
     * Get cache info
     */
    getCacheInfo() {
        const now = Date.now();
        let validEntries = 0;
        let expiredEntries = 0;

        for (const [key, value] of this.cache.entries()) {
            if (now < value.expiry) {
                validEntries++;
            } else {
                expiredEntries++;
            }
        }

        return {
            totalEntries: this.cache.size,
            validEntries,
            expiredEntries,
            size: this.cache.size
        };
    }
}

// Global API client instance
window.apiClient = new ApiClient();

console.log('🌐 API Client initialized');