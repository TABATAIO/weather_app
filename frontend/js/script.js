// メインアプリケーション - フロントとバックの統合

console.log('🚀 WeatherApp メイン起動');
console.log('現在の時刻:', new Date().toISOString());

class WeatherApp {
    constructor() {
        console.log('📱 WeatherApp constructor');
        this.currentCity = 'tokyo';
        this.weatherData = null;
        this.isLoading = false;
        this.authManager = null;
        this.init();
    }

    async init() {
        try {
            console.log('🔄 WeatherApp init 開始');
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeApp());
            } else {
                this.initializeApp();
            }
        } catch (error) {
            console.error('❌ init エラー:', error);
        }
    }

    async initializeApp() {
        console.log('=== WeatherApp 初期化開始 ===');
        console.log('🔍 DOM要素確認:');
        console.log('- weatherBackground要素:', document.getElementById('weatherBackground'));
        console.log('- body要素:', document.body);
        
        try {
            // 認証マネージャーの初期化
            this.authManager = window.authManager;
            this.initializeAuth();
            
            // API接続テスト
            await this.testApiConnection();
            
            // イベントリスナー設定
            this.setupEventListeners();
            this.setupLocationButton();
            this.setupAuthEventListeners();
            
            // 初期天気データ読み込み
            await this.loadInitialWeatherData();
        } catch (error) {
            console.error('❌ initializeApp エラー:', error);
        }
    }

    /**
     * 認証機能の初期化
     */
    initializeAuth() {
        console.log('🔐 認証機能初期化');
        this.updateAuthUI();
    }

    /**
     * 認証UIの更新
     */
    updateAuthUI() {
        const loginBtn = document.getElementById('login-btn');
        const userMenu = document.getElementById('user-menu');
        const usernameDisplay = document.getElementById('username-display');

        if (this.authManager.isAuthenticated()) {
            // ログイン状態
            const user = this.authManager.getUser();
            if (user) {
                loginBtn.style.display = 'none';
                userMenu.style.display = 'flex';
                usernameDisplay.textContent = user.username;
            }
        } else {
            // ログアウト状態
            loginBtn.style.display = 'block';
            userMenu.style.display = 'none';
        }
    }

    /**
     * 認証関連のイベントリスナー設定
     */
    setupAuthEventListeners() {
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');

        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                window.location.href = 'auth.html';
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('ログアウトしますか？')) {
                    this.authManager.logout();
                }
            });
        }
    }

    async testApiConnection() {
        console.log('API接続テスト中...');
        try {
            if (typeof apiClient !== 'undefined') {
                const isConnected = await apiClient.testConnection();
                if (isConnected) {
                    console.log('✅ API接続成功');
                    return true;
                } else {
                    console.error('❌ API接続失敗');
                    this.showError('APIサーバーに接続できません。');
                    return false;
                }
            } else {
                console.warn('⚠️ apiClient が未定義');
                this.showError('APIクライアントが利用できません。');
                return false;
            }
        } catch (error) {
            console.error('❌ API接続テストでエラー:', error);
            this.showError('APIサーバーとの通信でエラーが発生しました。');
            return false;
        }
    }

    setupEventListeners() {
        console.log('🔧 イベントリスナー設定');
        
        // キャラクタークリック
        const characterImg = document.querySelector('.character-img img');
        if (characterImg) {
            characterImg.addEventListener('click', () => {
                window.location.href = 'mascot_page.html';
            });
        }

        // 検索ボタン
        const searchBtn = document.querySelector('.header-buttons .app-btn:first-child');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.showCitySearchDialog());
        }  
    }

    setupLocationButton() {
        console.log('🔧 位置情報ボタン設定');
        const locationBtn = document.querySelector('.header-buttons .app-btn:last-child');
        if (locationBtn) {
            locationBtn.addEventListener('click', () => this.getCurrentLocationWeather());
        }
    }

    async loadInitialWeatherData() {
        console.log('=== 初期天気データ読み込み開始 ===');
        this.showLoading(true);
        try {
            await this.fetchAndUpdateWeather(this.currentCity);
            console.log('✅ 初期天気データ読み込み完了');
        } catch (error) {
            console.error('❌ 初期天気データ読み込みエラー:', error);
            this.showError(`初期天気データの取得に失敗しました: ${error.message}`);
            this.showDemoWeatherData();
        } finally {
            this.showLoading(false);
        }
    }

    async fetchAndUpdateWeather(cityName) {
        try {
            console.log(`🌤️ 天気データ取得開始: ${cityName}`);
            const response = await apiClient.getWeatherData(cityName);
            
            // レスポンス構造の確認とデータ抽出
            const weatherData = response.data ? response.data : response;
            console.log('📊 取得した天気データ:', weatherData);
            
            if (weatherData && weatherData.current) {
                console.log('🎯 天気データ構造確認:');
                console.log('- current:', weatherData.current);
                console.log('- current.weather:', weatherData.current.weather);
                console.log('- today:', weatherData.today);
                
                this.weatherData = weatherData;
                this.updateWeatherDisplay(weatherData);
                
                // 背景更新
                console.log('🎨 背景更新開始...');
                this.updateWeatherBackground(weatherData);
                console.log('🎨 背景更新完了');
                
                this.currentCity = cityName;
                console.log('✅ 天気表示更新完了');
            } else {
                throw new Error('取得したデータが無効です');
            }
        } catch (error) {
            console.error('❌ 天気データ取得エラー:', error);
            throw error;
        }
    }

    updateWeatherDisplay(data) {
        console.log('🎨 天気表示更新開始:', data);
        
        try {
            const current = data.current;
            const today = data.today;
            
            // 現在気温
            this.updateCurrentTemperature(current.temperature);
            
            // 天気名
            this.updateWeatherName(current.weather);
            
            // 最高・最低気温
            if (today) {
                this.updateTemperatureRange(today.maxTemp, today.minTemp);
            }
            
            // 詳細情報（湿度・風速・気圧）
            this.updateWeatherDetails(current);
            
            // WeatherNewsアイコン
            this.updateWeatherIcon(current);

            if (data.forecast && data.forecast.mediumTerm) {
                this.updateWeeklyForecast(data.forecast.mediumTerm);
            }
            
            console.log('🎉 天気表示更新完了');
        } catch (error) {
            console.error('💥 天気表示更新エラー:', error);
        }
    }

    updateWeeklyForecast(mediumTermData) {
        console.log('📅 週間天気予報更新開始:', mediumTermData);

        this.updateWeeklyDatas(mediumTermData);
        this.updateWeeklyWeather(mediumTermData);
        this.updateWeeklyMaxTemp(mediumTermData);
        this.updateWeeklyMinTemp(mediumTermData);

        console.log('✅ 週間天気予報更新完了');
    }

    updateWeeklyDatas(mediumTermData) {
        console.log('📅 週間日付更新開始:', mediumTermData);
        
        const dateSpans = document.querySelectorAll('.weekly-row:first-child span:not(.city-name)');
        console.log('🔍 日付span要素数:', dateSpans.length);
        
        for (let i = 0; i < Math.min(dateSpans.length, mediumTermData.length); i++) {
            const forecastData = mediumTermData[i];
            if (forecastData && forecastData.date) {
                // 日付をMM/DD形式に変換
                const date = new Date(forecastData.date);
                const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
                
                dateSpans[i].textContent = formattedDate;
                console.log(`✅ 日付更新 [${i}]:`, formattedDate);
            }
        }
        
        console.log('✅ 週間日付更新完了');
    }

    updateWeeklyWeather(mediumTermData) {
        console.log('🌤️ 週間天気アイコン更新開始:', mediumTermData);
        
        const weatherSpans = document.querySelectorAll('.weekly-row:nth-child(2) span:not(.city-name)');
        console.log('🔍 天気span要素数:', weatherSpans.length);
        
        for (let i = 0; i < Math.min(weatherSpans.length, mediumTermData.length); i++) {
            const forecastData = mediumTermData[i];
            if (forecastData && forecastData.wx) {
                // WeatherNewsアイコンURLを直接構築（APIと同じパターン）
                const iconUrl = `https://tpf.weathernews.jp/wxicon/152/${forecastData.wx}.png`;
                
                // img要素を作成
                const iconImg = document.createElement('img');
                iconImg.src = iconUrl;
                iconImg.alt = `天気コード${forecastData.wx}`;
                iconImg.style.width = '24px';
                iconImg.style.height = '24px';
                iconImg.style.objectFit = 'contain';
                
                // エラー時は代替テキスト表示
                iconImg.onerror = () => {
                    console.log(`⚠️ WeatherNewsアイコン読み込み失敗 [${i}]:`, forecastData.wx);
                    weatherSpans[i].innerHTML = `<span style="font-size: 20px;">❓</span>`;
                };
                
                iconImg.onload = () => {
                    console.log(`✅ WeatherNewsアイコン読み込み成功 [${i}]:`, forecastData.wx);
                };
                
                // span要素をクリアしてアイコンを挿入
                weatherSpans[i].innerHTML = '';
                weatherSpans[i].appendChild(iconImg);
                
                console.log(`✅ 天気アイコン更新 [${i}]:`, forecastData.wx);
            }
        }
        
        console.log('✅ 週間天気アイコン更新完了');
    }

    updateWeeklyMaxTemp(mediumTermData) {
        console.log('🌡️ 週間最高気温更新開始:', mediumTermData);
        
        const maxTempSpans = document.querySelectorAll('.weekly-row:nth-child(3) span:not(.city-name)');
        console.log('🔍 最高気温span要素数:', maxTempSpans.length);
        
        for (let i = 0; i < Math.min(maxTempSpans.length, mediumTermData.length); i++) {
            const forecastData = mediumTermData[i];
            if (forecastData && forecastData.maxtemp !== undefined) {
                maxTempSpans[i].textContent = `${Math.round(forecastData.maxtemp)}°`;
                console.log(`✅ 最高気温更新 [${i}]:`, forecastData.maxtemp);
            }
        }
        
        console.log('✅ 週間最高気温更新完了');
    }

    updateWeeklyMinTemp(mediumTermData) {
        console.log('🌡️ 週間最低気温更新開始:', mediumTermData);
        
        const minTempSpans = document.querySelectorAll('.weekly-row:nth-child(4) span:not(.city-name)');
        console.log('🔍 最低気温span要素数:', minTempSpans.length);
        
        for (let i = 0; i < Math.min(minTempSpans.length, mediumTermData.length); i++) {
            const forecastData = mediumTermData[i];
            if (forecastData && forecastData.mintemp !== undefined) {
                minTempSpans[i].textContent = `${Math.round(forecastData.mintemp)}°`;
                console.log(`✅ 最低気温更新 [${i}]:`, forecastData.mintemp);
            }
        }
        
        console.log('✅ 週間最低気温更新完了');
    }

    updateCurrentTemperature(temperature) {
        const tempElement = document.querySelector('.current-temp');
        if (tempElement) {
            tempElement.textContent = `${Math.round(temperature)}°`;
            console.log('✅ 現在気温更新:', temperature);
        }
    }

    updateWeatherName(weather) {
        const weatherElement = document.querySelector('.weather-name');
        if (weatherElement) {
            weatherElement.textContent = weather;
            console.log('✅ 天気名更新:', weather);
        }
    }

    updateTemperatureRange(maxTemp, minTemp) {
        const maxElement = document.querySelector('.max-temp');
        const minElement = document.querySelector('.min-temp');
        
        if (maxElement && maxTemp !== undefined) {
            maxElement.textContent = `${Math.round(maxTemp)}°`;
            console.log('✅ 最高気温更新:', maxTemp);
        }
        
        if (minElement && minTemp !== undefined) {
            minElement.textContent = `${Math.round(minTemp)}°`;
            console.log('✅ 最低気温更新:', minTemp);
        }
    }

    updateWeatherDetails(current) {
        const details = [
            { selector: '.humidity-value', value: current.humidity, unit: '%', name: '湿度' },
            { selector: '.wind-value', value: current.windSpeed, unit: 'm/s', name: '風速' },
            { selector: '.pressure-value', value: current.pressure, unit: 'hPa', name: '気圧' }
        ];
        
        details.forEach(detail => {
            const element = document.querySelector(detail.selector);
            if (element && detail.value !== undefined) {
                element.textContent = `${detail.value}${detail.unit}`;
                console.log(`✅ ${detail.name}更新:`, detail.value);
            }
        });
    }

    updateWeatherIcon(current) {
        console.log('🎨 アイコン更新開始:', current.weather, current.icon);
        
        const iconContainer = document.querySelector('.weather-illustration');
        if (iconContainer) {
            iconContainer.innerHTML = '';
            
            if (current.icon) {
                console.log('📷 WeatherNewsアイコン使用:', current.icon);
                
                const iconImg = document.createElement('img');
                iconImg.src = current.icon;
                iconImg.alt = current.weather;
                iconImg.className = 'weather-icon-img';
                iconImg.style.width = '80px';
                iconImg.style.height = '80px';
                iconImg.style.objectFit = 'contain';
                iconImg.style.display = 'block';
                iconImg.style.margin = '0 auto';
                
                iconImg.onload = () => {
                    console.log('✅ WeatherNewsアイコン読み込み成功');
                };
                
                iconImg.onerror = () => {
                    console.log('❌ WeatherNewsアイコン読み込み失敗、絵文字にフォールバック');
                    iconContainer.innerHTML = this.getWeatherEmoji(current.weather);
                };
                
                iconContainer.appendChild(iconImg);
            } else {
                console.log('🎭 絵文字アイコン使用');
                iconContainer.innerHTML = this.getWeatherEmoji(current.weather);
            }
        }
    }

    getWeatherEmoji(weather) {
        const emojiMap = {
            '晴': '☀️',
            '快晴': '☀️',
            '曇': '☁️',
            '雨': '🌧️',
            '雪': '❄️',
            '雷': '⛈️'
        };
        
        for (const [key, emoji] of Object.entries(emojiMap)) {
            if (weather.includes(key)) {
                return `<span style="font-size: 60px; display: block; text-align: center;">${emoji}</span>`;
            }
        }
        
        return '<span style="font-size: 60px; display: block; text-align: center;">☀️</span>';
    }



    showDemoWeatherData() {
        console.log('🎭 === デモデータ表示開始 ===');
        const demoData = {
            current: {
                weather: 'デモ晴れ',
                temperature: 25,
                humidity: 60,
                windSpeed: 2.5,
                pressure: 1015,
                icon: null
            },
            today: {
                maxTemp: 28,
                minTemp: 18
            }
        };
        
        console.log('📊 デモデータ:', demoData);
        this.updateWeatherDisplay(demoData);
        
        console.log('🎨 デモデータでの背景更新開始...');
        this.updateWeatherBackground(demoData);
        console.log('🎭 === デモデータ表示完了 ===');
    }

    async getCurrentLocationWeather() {
        if (!navigator.geolocation) {
            this.showError('お使いのブラウザでは位置情報がサポートされていません。');
            return;
        }

        this.showLoading(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    const city = await this.getCityFromCoordinates(lat, lon);
                    await this.fetchAndUpdateWeather(city);
                } catch (error) {
                    console.error('位置情報天気取得エラー:', error);
                    this.showError('位置情報から天気データの取得に失敗しました');
                } finally {
                    this.showLoading(false);
                }
            },
            (error) => {
                console.error('位置情報取得エラー:', error);
                this.showError('位置情報の取得に失敗しました');
                this.showLoading(false);
            }
        );
    }

    async getCityFromCoordinates(lat, lon) {
        const cities = [
            { name: 'tokyo', lat: 35.6762, lon: 139.6503 },
            { name: 'osaka', lat: 34.6937, lon: 135.5023 },
            { name: 'nagoya', lat: 35.1815, lon: 136.9066 },
            { name: 'fukuoka', lat: 33.5904, lon: 130.4017 },
            { name: 'sapporo', lat: 43.0642, lon: 141.3469 }
        ];

        let nearestCity = cities[0];
        let minDistance = this.calculateDistance(lat, lon, cities[0].lat, cities[0].lon);

        for (const city of cities) {
            const distance = this.calculateDistance(lat, lon, city.lat, city.lon);
            if (distance < minDistance) {
                minDistance = distance;
                nearestCity = city;
            }
        }

        return nearestCity.name;
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    showCitySearchDialog() {
        const city = prompt('都市名を入力してください（例: tokyo, osaka, nagoya）:');
        if (city && city.trim()) {
            this.fetchAndUpdateWeather(city.trim().toLowerCase())
                .catch(error => {
                    console.error('都市検索エラー:', error);
                    this.showError(`都市「${city}」の天気データが見つかりませんでした`);
                });
        }
    }

    showLoading(show) {
        this.isLoading = show;
        let loadingElement = document.querySelector('.loading-overlay');
        
        if (show && !loadingElement) {
            loadingElement = document.createElement('div');
            loadingElement.className = 'loading-overlay';
            loadingElement.innerHTML = '<div class="loading-spinner">🌀 読み込み中...</div>';
            document.body.appendChild(loadingElement);
        } else if (!show && loadingElement) {
            loadingElement.remove();
        }
    }

    showError(message) {
        console.log('❌ エラー表示:', message);
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        document.body.appendChild(errorElement);
        
        setTimeout(() => {
            errorElement.remove();
        }, 5000);
    }

    updateWeatherBackground(weatherData) {
        console.log('🎨 === 背景更新デバッグ開始 ===');
        console.log('📊 受信した天気データ:', weatherData);
        console.log('🌤️ 天気情報:', weatherData.current?.weather);
        
        const weatherBg = document.getElementById('weatherBackground');
        console.log('🔍 weatherBackground要素:', weatherBg);
        
        if (!weatherBg) {
            console.error('❌ weatherBackground要素が見つかりません');
            console.log('🔍 DOM内の要素確認:');
            console.log('- document.body.innerHTML:', document.body.innerHTML.substring(0, 500));
            return;
        }

        // 天気タイプを判定
        const weather = weatherData.current?.weather || 'unknown';
        const weatherType = this.getWeatherType(weather);
        console.log('🌈 天気タイプ判定:', { weather, weatherType });
        
        // 現在のクラス状態を確認
        console.log('🔍 適用前のクラス:', weatherBg.className);
        console.log('🔍 適用前のスタイル:', weatherBg.style.cssText);
        
        // 背景クラスをリセット
        weatherBg.className = 'weather-background';
        console.log('🔄 クラスリセット完了');
        
        // 新しい背景クラスを追加
        weatherBg.classList.add(`bg-${weatherType}`);
        console.log('➕ 新クラス追加:', `bg-${weatherType}`);
        
        // 直接スタイルも設定
        this.setBackgroundStyle(weatherBg, weatherType);
        
        // キャラクターエリア背景画像設定
        this.setCharacterAreaBackground(weatherType);
        
        // 適用後の状態を確認
        console.log('✅ 適用後のクラス:', weatherBg.className);
        console.log('✅ 適用後のスタイル:', weatherBg.style.cssText);
        console.log('✅ 計算されたスタイル:', window.getComputedStyle(weatherBg).background);
        
        console.log('🎨 === 背景更新デバッグ終了 ===');
    }

    getWeatherType(weather) {
        console.log('🔍 天気タイプ判定開始:', weather);
        
        if (weather.includes('晴') || weather.includes('快晴')) {
            console.log('☀️ 晴れタイプと判定');
            return 'sunny';
        } else if (weather.includes('曇') || weather.includes('くもり')) {
            console.log('☁️ 曇りタイプと判定');
            return 'cloudy';
        } else if (weather.includes('雨') || weather.includes('あめ')) {
            console.log('🌧️ 雨タイプと判定');
            return 'rainy';
        } else if (weather.includes('雪') || weather.includes('ゆき')) {
            console.log('❄️ 雪タイプと判定');
            return 'snowy';
        } else {
            console.log('🤔 不明な天気、デフォルト（晴れ）に設定');
            return 'sunny'; // デフォルト
        }
    }

    setBackgroundStyle(element, weatherType) {
        console.log('🎨 スタイル設定開始:', weatherType);
        
        const backgrounds = {
            sunny: {
                background: 'linear-gradient(135deg, #87CEEB 0%, #FFD700 100%)',
                opacity: '0.8'
            },
            cloudy: {
                background: 'linear-gradient(135deg, #B0C4DE 0%, #708090 100%)',
                opacity: '0.7'
            },
            rainy: {
                background: 'linear-gradient(135deg, #4682B4 0%, #2F4F4F 100%)',
                opacity: '0.8'
            },
            snowy: {
                background: 'linear-gradient(135deg, #F0F8FF 0%, #E6E6FA 100%)',
                opacity: '0.8'
            }
        };

        const bgStyle = backgrounds[weatherType] || backgrounds.sunny;
        console.log('🎨 選択された背景スタイル:', bgStyle);
        
        element.style.position = 'fixed';
        element.style.top = '0';
        element.style.left = '0';
        element.style.width = '100%';
        element.style.height = '100%';
        element.style.background = bgStyle.background;
        element.style.opacity = bgStyle.opacity;
        element.style.zIndex = '-1';
        element.style.pointerEvents = 'none';
        
        console.log('✅ スタイル適用完了:');
        console.log('- background:', element.style.background);
        console.log('- opacity:', element.style.opacity);
        console.log('- zIndex:', element.style.zIndex);
        console.log('- position:', element.style.position);
    }

    setCharacterAreaBackground(weatherType) {
        console.log('🖼️ === キャラクターエリア背景設定開始 ===');
        console.log('🌤️ 天気タイプ:', weatherType);
        
        const characterArea = document.querySelector('.character-area');
        if (!characterArea) {
            console.warn('⚠️ character-area要素が見つかりません');
            return;
        }

        // 天気タイプに基づいて画像を選択
        const imageMap = {
            'sunny': 'main_sunny.png',
            'cloudy': 'main_cloudy.png',
            'rainy': 'main_rain.png',
            'snowy': 'main_cloudy.png' // 雪用画像がないため曇りを使用
        };

        const imageName = imageMap[weatherType] || imageMap.sunny;
        // バックエンドAPI経由で画像を取得
        const imageUrl = `http://localhost:3001/api/images/${imageName}`;
        
        console.log('🖼️ 設定する画像URL:', imageUrl);

        // 背景画像を設定
        characterArea.style.backgroundImage = `url('${imageUrl}')`;
        characterArea.style.backgroundSize = 'cover';
        characterArea.style.backgroundPosition = 'center';
        characterArea.style.backgroundRepeat = 'no-repeat';
        characterArea.style.overflow = 'hidden';
        
        console.log('✅ キャラクターエリア背景設定完了');
        console.log('🎨 適用されたスタイル:', characterArea.style.cssText);
        console.log('🖼️ === キャラクターエリア背景設定終了 ===');
    }
}

// WeatherApp初期化
console.log('🎯 WeatherApp インスタンス作成中...');
console.log('📋 DOM準備状態:', document.readyState);
console.log('🔍 weatherBackground要素チェック:', document.getElementById('weatherBackground'));
console.log('🔍 body要素:', document.body);

const weatherApp = new WeatherApp();
console.log('✅ WeatherApp 起動完了');

// 追加のDOM確認
window.addEventListener('load', () => {
    console.log('🚀 === ページ完全読み込み完了 ===');
    console.log('🔍 weatherBackground要素再チェック:', document.getElementById('weatherBackground'));
    const bg = document.getElementById('weatherBackground');
    if (bg) {
        console.log('✅ weatherBackground要素が存在します');
        console.log('📐 要素の位置とサイズ:', bg.getBoundingClientRect());
    } else {
        console.error('❌ weatherBackground要素が見つかりません');
        console.log('🔍 body内容の最初の500文字:', document.body.innerHTML.substring(0, 500));
    }
});

// 既存のspan要素取得コードは削除（メソッド内で直接取得するため）
