/**
 * 天気に基づく背景管理クラス
 */
class WeatherBackground {
    constructor() {
        this.currentWeather = null;
        this.backgroundElement = null;
        this.init();
    }

    init() {
        // 背景コンテナを作成
        this.createBackgroundContainer();
    }

    createBackgroundContainer() {
        this.backgroundElement = document.createElement('div');
        this.backgroundElement.className = 'weather-background';
        this.backgroundElement.id = 'weatherBackground';
        
        // bodyの最初の子要素として挿入
        document.body.insertBefore(this.backgroundElement, document.body.firstChild);
    }

    /**
     * 天気データに基づいて背景を更新
     * @param {Object} weatherData - 天気データ
     */
    updateBackground(weatherData) {
        if (!weatherData || !weatherData.current) {
            this.setDefaultBackground();
            return;
        }

        this.currentWeather = weatherData.current;
        const weather = weatherData.current.weather;
        const temperature = weatherData.current.temperature;
        
        // 天気に応じた背景クラスを設定
        this.setBackgroundByWeather(weather, temperature);
    }

    /**
     * 天気に応じた背景を設定
     * @param {string} weather - 天気（晴れ、曇り、雨、雪など）
     * @param {number} temperature - 気温
     */
    setBackgroundByWeather(weather, temperature) {
        // 既存のクラスをクリア
        this.backgroundElement.className = 'weather-background';
        
        let weatherClass = '';
        
        // 天気による分類
        if (weather.includes('晴') || weather.includes('快晴')) {
            weatherClass = 'sunny';
        } else if (weather.includes('曇')) {
            weatherClass = 'cloudy';
        } else if (weather.includes('雨') || weather.includes('雷')) {
            weatherClass = 'rainy';
        } else if (weather.includes('雪')) {
            weatherClass = 'snowy';
        } else {
            weatherClass = 'default';
        }

        // 気温による修飾
        let temperatureClass = '';
        if (temperature < 5) {
            temperatureClass = 'very-cold';
        } else if (temperature < 15) {
            temperatureClass = 'cold';
        } else if (temperature < 25) {
            temperatureClass = 'mild';
        } else if (temperature < 30) {
            temperatureClass = 'warm';
        } else {
            temperatureClass = 'hot';
        }

        this.backgroundElement.classList.add(weatherClass, temperatureClass);
        
        // アニメーション効果を追加
        this.addWeatherEffects(weatherClass);
    }

    /**
     * 天気エフェクトを追加
     * @param {string} weatherType - 天気タイプ
     */
    addWeatherEffects(weatherType) {
        // 既存のエフェクトをクリア
        this.clearEffects();

        switch (weatherType) {
            case 'rainy':
                this.createRainEffect();
                break;
            case 'snowy':
                this.createSnowEffect();
                break;
            case 'sunny':
                this.createSunEffect();
                break;
        }
    }

    /**
     * 雨エフェクトを作成
     */
    createRainEffect() {
        const rainContainer = document.createElement('div');
        rainContainer.className = 'rain-effect';
        
        for (let i = 0; i < 50; i++) {
            const raindrop = document.createElement('div');
            raindrop.className = 'raindrop';
            raindrop.style.left = Math.random() * 100 + '%';
            raindrop.style.animationDuration = (Math.random() * 1 + 0.5) + 's';
            raindrop.style.animationDelay = Math.random() * 2 + 's';
            rainContainer.appendChild(raindrop);
        }
        
        this.backgroundElement.appendChild(rainContainer);
    }

    /**
     * 雪エフェクトを作成
     */
    createSnowEffect() {
        const snowContainer = document.createElement('div');
        snowContainer.className = 'snow-effect';
        
        for (let i = 0; i < 30; i++) {
            const snowflake = document.createElement('div');
            snowflake.className = 'snowflake';
            snowflake.style.left = Math.random() * 100 + '%';
            snowflake.style.animationDuration = (Math.random() * 2 + 2) + 's';
            snowflake.style.animationDelay = Math.random() * 2 + 's';
            snowflake.textContent = '❄';
            snowContainer.appendChild(snowflake);
        }
        
        this.backgroundElement.appendChild(snowContainer);
    }

    /**
     * 太陽エフェクトを作成
     */
    createSunEffect() {
        const sunContainer = document.createElement('div');
        sunContainer.className = 'sun-effect';
        
        const sun = document.createElement('div');
        sun.className = 'sun';
        sun.innerHTML = '☀️';
        
        sunContainer.appendChild(sun);
        this.backgroundElement.appendChild(sunContainer);
    }

    /**
     * エフェクトをクリア
     */
    clearEffects() {
        const effects = this.backgroundElement.querySelectorAll('.rain-effect, .snow-effect, .sun-effect');
        effects.forEach(effect => effect.remove());
    }

    /**
     * デフォルト背景を設定
     */
    setDefaultBackground() {
        this.backgroundElement.className = 'weather-background default mild';
        this.clearEffects();
    }
}

// グローバルインスタンス
const weatherBackground = new WeatherBackground();