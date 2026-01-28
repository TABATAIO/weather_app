// 本格的な天気アプリテスト
console.log('🌟 天気アプリ統合テスト開始');
console.log('🌟 現在時刻 =', new Date().toLocaleString());

// DOM確認
console.log('🌟 DOM要素確認 =', document.querySelector('body'));

try {
    console.log('🚀 APIClientテスト開始');
    
    // APIClient確認
    if (typeof apiClient !== 'undefined') {
        console.log('✅ apiClient は利用可能');
        console.log('📡 API接続テスト実行中...');
        
        // API接続テスト
        apiClient.testConnection()
            .then(result => {
                console.log('📡 API接続結果:', result);
                if (result) {
                    console.log('🎯 天気データ取得テスト開始...');
                    
                    // 天気データ取得テスト
                    return apiClient.getWeatherData('tokyo');
                } else {
                    console.error('❌ API接続失敗');
                }
            })
            .then(weatherData => {
                if (weatherData) {
                    console.log('🌤️ 天気データ取得成功:', weatherData);
                    
                    // UIに天気データを反映
                    updateUI(weatherData);
                } else {
                    console.log('⚠️ 天気データが空');
                }
            })
            .catch(error => {
                console.error('💥 API取得エラー:', error);
                
                // デモデータで表示
                showDemoData();
            });
    } else {
        console.error('❌ apiClient が利用不可');
        showDemoData();
    }
    
} catch (error) {
    console.error('💥 致命的エラー:', error);
    showDemoData();
}

// UI更新関数
function updateUI(data) {
    console.log('🎨 UI更新開始:', data);
    
    try {
        // data.dataがある場合の処理
        const weatherData = data.data ? data.data : data;
        console.log('📊 実際の天気データ:', weatherData);
        
        if (weatherData && weatherData.current) {
            console.log('📋 current データ:', weatherData.current);
            
            // 現在気温
            const tempEl = document.querySelector('.current-temp');
            if (tempEl) {
                tempEl.textContent = `${Math.round(weatherData.current.temperature)}°`;
                console.log('✅ 気温更新:', weatherData.current.temperature);
            } else {
                console.log('❌ .current-temp が見つかりません');
            }
            
            // 天気名
            const weatherEl = document.querySelector('.weather-name');
            if (weatherEl) {
                weatherEl.textContent = weatherData.current.weather;
                console.log('✅ 天気名更新:', weatherData.current.weather);
            } else {
                console.log('❌ .weather-name が見つかりません');
            }
            
            // 最高・最低気温
            if (weatherData.today) {
                console.log('📊 today データ:', weatherData.today);
                
                const maxTempEl = document.querySelector('.max-temp');
                if (maxTempEl && weatherData.today.maxTemp) {
                    maxTempEl.textContent = `${Math.round(weatherData.today.maxTemp)}°`;
                    console.log('✅ 最高気温更新:', weatherData.today.maxTemp);
                }
                
                const minTempEl = document.querySelector('.min-temp');
                if (minTempEl && weatherData.today.minTemp) {
                    minTempEl.textContent = `${Math.round(weatherData.today.minTemp)}°`;
                    console.log('✅ 最低気温更新:', weatherData.today.minTemp);
                }
            }
            
            // 詳細情報
            updateDetailInfo(weatherData.current);
            
            // WeatherNewsアイコン表示
            updateWeatherIcon(weatherData.current);
            
            console.log('🎉 UI更新完了');
        } else {
            console.log('❌ current データが見つかりません');
            console.log('データ構造:', Object.keys(weatherData || {}));
        }
    } catch (error) {
        console.error('💥 UI更新エラー:', error);
        console.error('エラー詳細:', error.stack);
    }
}

// 詳細情報更新
function updateDetailInfo(current) {
    console.log('📊 詳細情報更新開始:', current);
    
    const details = [
        { selector: '.humidity-value', value: current.humidity, unit: '%' },
        { selector: '.wind-value', value: current.windSpeed, unit: 'm/s' },
        { selector: '.pressure-value', value: current.pressure, unit: 'hPa' }
    ];
    
    details.forEach(detail => {
        try {
            const el = document.querySelector(detail.selector);
            if (el && detail.value !== undefined) {
                el.textContent = `${detail.value}${detail.unit}`;
                console.log(`✅ ${detail.selector} 更新:`, detail.value);
            } else if (!el) {
                console.log(`❌ ${detail.selector} 要素が見つかりません`);
            } else {
                console.log(`⚠️ ${detail.selector} 値が未定義`);
            }
        } catch (error) {
            console.error(`💥 ${detail.selector} 更新エラー:`, error);
        }
    });
}

// WeatherNewsアイコン表示
function updateWeatherIcon(current) {
    console.log('🎨 アイコン更新開始:', current);
    
    try {
        const iconContainer = document.querySelector('.weather-illustration');
        if (iconContainer) {
            // 既存のアイコンをクリア
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
                    iconContainer.innerHTML = getWeatherEmoji(current.weather);
                };
                
                iconContainer.appendChild(iconImg);
            } else {
                console.log('🎭 絵文字アイコン使用');
                iconContainer.innerHTML = getWeatherEmoji(current.weather);
            }
            
            console.log('✅ アイコン更新完了');
        } else {
            console.log('❌ .weather-illustration が見つかりません');
        }
    } catch (error) {
        console.error('💥 アイコン更新エラー:', error);
    }
}

// 絵文字取得
function getWeatherEmoji(weather) {
    if (weather.includes('晴') || weather.includes('快晴')) {
        return '<span style="font-size: 60px; display: block; text-align: center;">☀️</span>';
    } else if (weather.includes('曇')) {
        return '<span style="font-size: 60px; display: block; text-align: center;">☁️</span>';
    } else if (weather.includes('雨')) {
        return '<span style="font-size: 60px; display: block; text-align: center;">🌧️</span>';
    } else if (weather.includes('雪')) {
        return '<span style="font-size: 60px; display: block; text-align: center;">❄️</span>';
    }
    return '<span style="font-size: 60px; display: block; text-align: center;">☀️</span>';
}

// デモデータ表示
function showDemoData() {
    console.log('🎭 デモデータで表示');
    
    const demoData = {
        current: {
            weather: 'テスト晴れ',
            temperature: 25,
            humidity: 60,
            windSpeed: 2.5,
            pressure: 1015
        }
    };
    
    updateUI(demoData);
}

console.log('✅ テスト初期化完了');