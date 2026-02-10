/**
 * Weather Service Module
 * 天気データの管理とUIとの連携を行うサービス
 */

class WeatherService {
    constructor() {
        this.currentWeather = null;
        this.currentCity = window.storage?.get('preferred_city') || 'tokyo';
        this.forecast = null;
        this.lastUpdate = null;
        this.updateInterval = 10 * 60 * 1000; // 10 minutes
        this.isUpdating = false;
        
        // Weather data cache
        this.weatherCache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        
        // Event listeners
        this.listeners = new Map();
        
        this.init();
    }

    async init() {
        console.log('🌤️ Weather Service initialized');
        
        // Load cached weather data
        this.loadCachedData();
        
        // Setup automatic updates
        this.setupPeriodicUpdates();
        
        // Listen for city changes
        this.addEventListener('cityChanged', this.handleCityChange.bind(this));
        
        // Initial weather load if no cached data
        if (!this.currentWeather) {
            await this.updateWeather();
        }
    }

    /**
     * Load cached weather data
     */
    loadCachedData() {
        const cachedWeather = window.storage?.get('current_weather');
        const cachedForecast = window.storage?.get('weather_forecast');
        const lastUpdate = window.storage?.get('weather_last_update');
        
        // Check if cached data is still valid (less than cache expiry)
        if (lastUpdate && Date.now() - lastUpdate < this.cacheExpiry) {
            if (cachedWeather) {
                this.currentWeather = cachedWeather;
                console.log('🏪 Loaded cached weather data');
            }
            
            if (cachedForecast) {
                this.forecast = cachedForecast;
                console.log('🏪 Loaded cached forecast data');
            }
            
            this.lastUpdate = lastUpdate;
        }
    }

    /**
     * Setup periodic weather updates
     */
    setupPeriodicUpdates() {
        // Update weather every interval
        setInterval(async () => {
            if (!this.isUpdating && document.visibilityState === 'visible') {
                await this.updateWeather();
            }
        }, this.updateInterval);

        // Update when page becomes visible
        document.addEventListener('visibilitychange', async () => {
            if (document.visibilityState === 'visible' && 
                this.lastUpdate && 
                Date.now() - this.lastUpdate > this.updateInterval / 2) {
                await this.updateWeather();
            }
        });

        // Update on network reconnection
        window.addEventListener('online', async () => {
            console.log('🌐 Network reconnected, updating weather...');
            await this.updateWeather();
        });
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
     * Remove event listener
     */
    removeEventListener(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
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
                    console.error(`Error in weather service listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Update weather data
     */
    async updateWeather(city = this.currentCity) {
        if (this.isUpdating) {
            console.log('⏳ Weather update already in progress...');
            return this.currentWeather;
        }

        this.isUpdating = true;
        const perfStart = window.perfMonitor?.markRenderStart('weather-update');

        try {
            console.log(`🌤️ Updating weather for ${city}...`);
            this.emit('updateStarted', { city });

            // Get current weather
            const weatherData = await window.apiClient.getCurrentWeather(city);
            
            if (weatherData && weatherData.success) {
                const oldWeather = this.currentWeather;
                this.currentWeather = weatherData.data;
                this.currentCity = city;
                this.lastUpdate = Date.now();

                // Save to storage
                this.saveToStorage();

                // Check for significant weather changes
                this.checkWeatherChanges(oldWeather, this.currentWeather);

                // Emit weather updated event
                this.emit('weatherUpdated', {
                    weather: this.currentWeather,
                    city: this.currentCity,
                    isSignificantChange: this.isSignificantChange(oldWeather, this.currentWeather)
                });

                console.log('✅ Weather updated successfully', this.currentWeather);
                
                // Update forecast if needed
                await this.updateForecastIfNeeded();

                return this.currentWeather;
            } else {
                throw new Error(weatherData?.error || 'Weather data retrieval failed');
            }

        } catch (error) {
            console.error('❌ Weather update failed:', error);
            this.emit('updateError', { 
                error: error.message, 
                city,
                isOffline: !navigator.onLine 
            });

            // Return cached data if available
            if (this.currentWeather) {
                console.log('📦 Returning cached weather data');
                return this.currentWeather;
            }

            throw error;

        } finally {
            this.isUpdating = false;
            if (perfStart) {
                window.perfMonitor?.markRenderEnd('weather-update', perfStart);
            }
        }
    }

    /**
     * Update forecast if needed
     */
    async updateForecastIfNeeded() {
        const forecastCacheKey = `forecast_${this.currentCity}`;
        const cachedForecast = this.weatherCache.get(forecastCacheKey);
        
        // Check if forecast needs update
        if (!cachedForecast || Date.now() - cachedForecast.timestamp > this.cacheExpiry) {
            try {
                const forecastData = await window.apiClient.getWeatherForecast(this.currentCity);
                
                if (forecastData && forecastData.success) {
                    this.forecast = forecastData.data;
                    
                    // Cache forecast
                    this.weatherCache.set(forecastCacheKey, {
                        data: this.forecast,
                        timestamp: Date.now()
                    });

                    // Save to storage
                    window.storage?.set('weather_forecast', this.forecast);

                    this.emit('forecastUpdated', this.forecast);
                    console.log('📅 Weather forecast updated');
                }
            } catch (error) {
                console.warn('⚠️ Forecast update failed:', error);
            }
        }
    }

    /**
     * Change current city
     */
    async changeCity(newCity) {
        if (newCity === this.currentCity) {
            return this.currentWeather;
        }

        console.log(`🏙️ Changing city from ${this.currentCity} to ${newCity}`);
        
        // Save preference
        window.storage?.set('preferred_city', newCity);
        
        // Update weather for new city
        const weather = await this.updateWeather(newCity);
        
        this.emit('cityChanged', {
            oldCity: this.currentCity,
            newCity: newCity,
            weather: weather
        });

        return weather;
    }

    /**
     * Handle city change event
     */
    handleCityChange(data) {
        console.log(`📍 City changed: ${data.oldCity} → ${data.newCity}`);
    }

    /**
     * Check for significant weather changes
     */
    checkWeatherChanges(oldWeather, newWeather) {
        if (!oldWeather || !newWeather) return;

        const changes = [];

        // Check temperature change (>5°C difference)
        const tempDiff = Math.abs(newWeather.current.temperature - oldWeather.current.temperature);
        if (tempDiff >= 5) {
            changes.push({
                type: 'temperature',
                old: oldWeather.current.temperature,
                new: newWeather.current.temperature,
                difference: tempDiff
            });
        }

        // Check weather condition change
        if (oldWeather.current.weather !== newWeather.current.weather) {
            changes.push({
                type: 'condition',
                old: oldWeather.current.weather,
                new: newWeather.current.weather
            });
        }

        // Check significant humidity change (>20% difference)
        const humidityDiff = Math.abs(newWeather.current.humidity - oldWeather.current.humidity);
        if (humidityDiff >= 20) {
            changes.push({
                type: 'humidity',
                old: oldWeather.current.humidity,
                new: newWeather.current.humidity,
                difference: humidityDiff
            });
        }

        if (changes.length > 0) {
            this.emit('significantWeatherChange', {
                changes,
                weather: newWeather
            });
            console.log('🌦️ Significant weather changes detected:', changes);
        }
    }

    /**
     * Check if weather change is significant
     */
    isSignificantChange(oldWeather, newWeather) {
        if (!oldWeather || !newWeather) return true;

        const tempDiff = Math.abs(newWeather.current.temperature - oldWeather.current.temperature);
        const conditionChanged = oldWeather.current.weather !== newWeather.current.weather;
        
        return tempDiff >= 3 || conditionChanged;
    }

    /**
     * Save weather data to storage
     */
    saveToStorage() {
        window.storage?.set('current_weather', this.currentWeather);
        window.storage?.set('weather_last_update', this.lastUpdate);
        window.storage?.set('preferred_city', this.currentCity);
    }

    /**
     * Get weather icon for current conditions
     */
    getWeatherIcon(weather = this.currentWeather?.current?.weather) {
        if (!weather) return '❓';

        const iconMap = {
            '晴れ': '☀️',
            '曇り': '☁️',
            '雨': '🌧️',
            '雪': '🌨️',
            '嵐': '⛈️',
            '霧': '🌫️',
            'sunny': '☀️',
            'cloudy': '☁️',
            'rainy': '🌧️',
            'snowy': '🌨️',
            'stormy': '⛈️',
            'foggy': '🌫️'
        };

        return iconMap[weather?.toLowerCase()] || '🌤️';
    }

    /**
     * Get weather background class
     */
    getWeatherBackgroundClass(weather = this.currentWeather?.current?.weather) {
        if (!weather) return 'default';

        const classMap = {
            '晴れ': 'sunny',
            '曇り': 'cloudy',
            '雨': 'rainy',
            '雪': 'snowy',
            '嵐': 'stormy',
            'sunny': 'sunny',
            'cloudy': 'cloudy',
            'rainy': 'rainy',
            'snowy': 'snowy',
            'stormy': 'stormy'
        };

        const baseClass = classMap[weather?.toLowerCase()] || 'default';
        
        // Add night modifier if it's nighttime
        if (this.isNightTime()) {
            return `${baseClass} night`;
        }
        
        return baseClass;
    }

    /**
     * Check if it's nighttime
     */
    isNightTime() {
        const hour = new Date().getHours();
        return hour < 6 || hour > 18;
    }

    /**
     * Get formatted temperature
     */
    getFormattedTemperature(temp = this.currentWeather?.current?.temperature) {
        if (temp === undefined || temp === null) return '--°C';
        return `${Math.round(temp)}°C`;
    }

    /**
     * Get weather description
     */
    getWeatherDescription(weather = this.currentWeather?.current?.weather) {
        if (!weather) return 'Loading...';
        
        // Capitalize first letter
        return weather.charAt(0).toUpperCase() + weather.slice(1);
    }

    /**
     * Get current city
     */
    getCurrentCity() {
        return this.currentCity;
    }

    /**
     * Get current weather data
     */
    getCurrentWeather() {
        return this.currentWeather;
    }

    /**
     * Get forecast data
     */
    getForecast() {
        return this.forecast;
    }

    /**
     * Force refresh weather data
     */
    async forceRefresh() {
        console.log('🔄 Force refreshing weather data...');
        this.lastUpdate = 0; // Force update
        return this.updateWeather();
    }

    /**
     * Get weather status for debugging
     */
    getStatus() {
        return {
            currentCity: this.currentCity,
            hasCurrentWeather: !!this.currentWeather,
            hasForecast: !!this.forecast,
            lastUpdate: this.lastUpdate,
            isUpdating: this.isUpdating,
            cacheSize: this.weatherCache.size,
            nextUpdate: this.lastUpdate ? this.lastUpdate + this.updateInterval : null
        };
    }
}

// Global weather service instance
window.weatherService = new WeatherService();

console.log('🌤️ Weather Service initialized');