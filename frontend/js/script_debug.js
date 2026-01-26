// デバッグ専用アプリケーション v2

console.log('✨ DEBUG: script_debug.js が読み込まれました');
console.log('✨ DEBUG: 現在時刻 =', new Date().toLocaleString());

try {
    console.log('🏗️ WeatherApp DEBUG版 開始');
    
    class WeatherAppDebug {
        constructor() {
            console.log('🎯 WeatherAppDebug constructor');
            this.init();
        }
        
        init() {
            console.log('🔧 DEBUG init 開始');
            this.updateWeatherDisplay();
        }
        
        updateWeatherDisplay() {
            console.log('📊 DEBUG 天気表示更新');
            
            // 現在気温を更新
            const currentTempElement = document.querySelector('.current-temp');
            if (currentTempElement) {
                currentTempElement.textContent = '23°';
                console.log('✅ 気温更新成功');
            } else {
                console.log('❌ .current-temp が見つかりません');
            }

            // 天気名を更新
            const weatherNameElement = document.querySelector('.weather-name');
            if (weatherNameElement) {
                weatherNameElement.textContent = 'デバッグ晴れ';
                console.log('✅ 天気名更新成功');
            } else {
                console.log('❌ .weather-name が見つかりません');
            }
            
            // 詳細情報更新
            const humidityElement = document.querySelector('.humidity-value');
            if (humidityElement) {
                humidityElement.textContent = '65%';
                console.log('✅ 湿度更新成功');
            }
            
            const windElement = document.querySelector('.wind-value');
            if (windElement) {
                windElement.textContent = '3.2m/s';
                console.log('✅ 風速更新成功');
            }
            
            const pressureElement = document.querySelector('.pressure-value');
            if (pressureElement) {
                pressureElement.textContent = '1013hPa';
                console.log('✅ 気圧更新成功');
            }
        }
    }
    
    console.log('🚀 WeatherAppDebug インスタンス作成中...');
    const app = new WeatherAppDebug();
    console.log('🎉 WeatherAppDebug 初期化完了!');
    
} catch (error) {
    console.error('💥 FATAL ERROR:', error);
}