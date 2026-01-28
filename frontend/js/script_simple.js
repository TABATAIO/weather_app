// メインアプリケーション - フロントとバックの統合

console.log('🚀 script.js が読み込まれました');
console.log('現在の時刻:', new Date().toISOString());

// 文法チェック用の最小限クラス
try {
    console.log('🔧 WeatherApp クラス定義開始');
    
    class WeatherApp {
        constructor() {
            console.log('📱 WeatherApp constructor 開始');
            this.currentCity = 'tokyo';
            this.weatherData = null;
            this.isLoading = false;
            this.init();
        }

        async init() {
            try {
                console.log('🔄 init() 開始');
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => this.initializeApp());
                } else {
                    this.initializeApp();
                }
            } catch (error) {
                console.error('❌ init() エラー:', error);
            }
        }

        async initializeApp() {
            console.log('=== アプリ初期化開始 ===');
            
            try {
                // API接続テスト
                await this.testApiConnection();
                
                this.setupEventListeners();
                this.setupLocationButton();
                await this.loadInitialWeatherData();
            } catch (error) {
                console.error('❌ initializeApp エラー:', error);
            }
        }

        async testApiConnection() {
            console.log('API接続テスト中...');
            try {
                if (typeof apiClient !== 'undefined') {
                    const isConnected = await apiClient.testConnection();
                    if (isConnected) {
                        console.log('✅ API接続成功');
                    } else {
                        console.error('❌ API接続失敗');
                        this.showError('APIサーバーに接続できません。');
                    }
                } else {
                    console.warn('⚠️ apiClient が未定義');
                }
            } catch (error) {
                console.error('❌ API接続テストでエラー:', error);
            }
        }

        setupEventListeners() {
            console.log('🔧 setupEventListeners 開始');
            // 最小限の実装
        }

        setupLocationButton() {
            console.log('🔧 setupLocationButton 開始');
            // 最小限の実装
        }

        async loadInitialWeatherData() {
            console.log('=== 初期天気データ読み込み開始 ===');
            this.showLoading(true);
            try {
                // デモデータで表示
                this.showDemoWeatherData();
                console.log('✅ 初期天気データ読み込み完了（デモモード）');
            } catch (error) {
                console.error('❌ 初期天気データ読み込みエラー:', error);
                this.showError(`初期天気データの取得に失敗しました: ${error.message}`);
            } finally {
                this.showLoading(false);
            }
        }

        showDemoWeatherData() {
            console.log('デモデータで表示します');
            const demoData = {
                current: {
                    weather: '晴れ',
                    weatherCode: 100,
                    temperature: 23,
                    humidity: 65,
                    windSpeed: 3.2,
                    pressure: 1013,
                    icon: null
                },
                today: {
                    maxTemp: 28,
                    minTemp: 18
                }
            };
            
            this.updateWeatherDisplay(demoData);
        }

        updateWeatherDisplay(data) {
            console.log('📊 天気表示更新:', data);
            
            // 現在気温を更新
            const currentTempElement = document.querySelector('.current-temp');
            if (currentTempElement) {
                currentTempElement.textContent = `${Math.round(data.current.temperature)}°`;
            }

            // 天気名を更新
            const weatherNameElement = document.querySelector('.weather-name');
            if (weatherNameElement) {
                weatherNameElement.textContent = data.current.weather;
            }

            // 詳細情報も更新
            this.updateWeatherInfo(data.current);
        }

        updateWeatherInfo(current) {
            const humidityElement = document.querySelector('.humidity-value');
            if (humidityElement && current.humidity !== undefined) {
                humidityElement.textContent = `${current.humidity}%`;
            }

            const windElement = document.querySelector('.wind-value');
            if (windElement && current.windSpeed !== undefined) {
                windElement.textContent = `${current.windSpeed}m/s`;
            }

            const pressureElement = document.querySelector('.pressure-value');
            if (pressureElement && current.pressure !== undefined) {
                pressureElement.textContent = `${current.pressure}hPa`;
            }
        }

        showLoading(show) {
            console.log('🔄 ローディング表示:', show);
            // 最小限の実装
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
    }

    console.log('✅ WeatherApp クラス定義完了');
    
    // アプリケーションの初期化
    console.log('🎯 WeatherApp インスタンス作成中...');
    const weatherApp = new WeatherApp();
    console.log('✅ WeatherApp インスタンス作成完了');
    
} catch (error) {
    console.error('💥 script.js で致命的エラー:', error);
    console.error('エラー詳細:', error.stack);
}