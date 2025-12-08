// 天気マスコットAPI - フロントエンド連携サンプルコード

// ========================
// 1. 天気情報取得
// ========================

/**
 * 緯度経度で天気情報を取得
 * @param {number} lat 緯度
 * @param {number} lon 経度  
 * @returns {Object} 天気データ
 */
async function getWeatherByCoords(lat, lon) {
  try {
    const response = await fetch(`http://localhost:3001/api/weather/${lat}/${lon}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data; // 天気データを返す
    } else {
      console.error('天気取得エラー:', data.error);
      return null;
    }
  } catch (error) {
    console.error('API通信エラー:', error);
    return null;
  }
}

/**
 * 都市名で天気情報を取得
 * @param {string} city 都市名 (tokyo, osaka, kyoto, etc.)
 * @returns {Object} 天気データ
 */
async function getWeatherByCity(city) {
  try {
    const response = await fetch(`http://localhost:3001/api/weather/city/${city}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      console.error('天気取得エラー:', data.error);
      return null;
    }
  } catch (error) {
    console.error('API通信エラー:', error);
    return null;
  }
}

// ========================
// 2. マスコット状態更新
// ========================

/**
 * 天気データに基づいてマスコット状態を更新
 * @param {Object} weatherData 天気データ
 * @returns {Object} マスコット状態
 */
async function updateMascotState(weatherData) {
  try {
    const response = await fetch('http://localhost:3001/api/mascot/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        weatherCode: weatherData.current.weatherCode,
        temperature: weatherData.current.temperature,
        humidity: weatherData.current.humidity,
        precipitation: weatherData.current.precipitation,
        windSpeed: weatherData.current.windSpeed,
        pressure: weatherData.current.pressure
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      console.error('マスコット状態更新エラー:', data.error);
      return null;
    }
  } catch (error) {
    console.error('API通信エラー:', error);
    return null;
  }
}

// ========================
// 3. AI会話機能
// ========================

/**
 * マスコットとのAI会話
 * @param {string} message ユーザーメッセージ
 * @param {string} userName ユーザー名
 * @param {Object} weatherData 天気データ（オプション）
 * @returns {Object} AI応答データ
 */
async function chatWithMascot(message, userName, weatherData = null) {
  try {
    const response = await fetch('http://localhost:3001/api/mascot/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        userName: userName,
        weatherData: weatherData,
        userId: `user_${Date.now()}` // 簡易ID生成
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      console.error('AI会話エラー:', data.error);
      return null;
    }
  } catch (error) {
    console.error('API通信エラー:', error);
    return null;
  }
}

// ========================
// 4. 使用例
// ========================

// 東京の天気を取得してマスコット状態を更新
async function initializeWeatherMascot() {
  console.log('🌤️ 天気マスコット初期化開始...');
  
  // 1. 東京の天気を取得
  const weatherData = await getWeatherByCity('tokyo');
  if (!weatherData) {
    console.error('天気データの取得に失敗しました');
    return;
  }
  
  console.log('📊 天気データ取得成功:', {
    weather: weatherData.current.weather,
    temperature: weatherData.current.temperature,
    icon: weatherData.current.icon
  });
  
  // 2. マスコット状態を更新
  const mascotState = await updateMascotState(weatherData);
  if (!mascotState) {
    console.error('マスコット状態の更新に失敗しました');
    return;
  }
  
  console.log('🎭 マスコット状態更新成功:', {
    mood: mascotState.mood,
    energy: mascotState.energy,
    reaction: mascotState.weatherReaction
  });
  
  // 3. AI会話のテスト
  const chatResponse = await chatWithMascot('今日の天気はどう？', 'ユーザー', weatherData);
  if (chatResponse) {
    console.log('💬 AI応答:', chatResponse.response);
  }
  
  return {
    weather: weatherData,
    mascot: mascotState,
    chat: chatResponse
  };
}

// ========================
// 5. DOM操作例（HTML要素への反映）
// ========================

/**
 * 天気情報をHTMLに反映
 * @param {Object} weatherData 天気データ
 */
function displayWeatherData(weatherData) {
  // 天気アイコン
  const weatherIcon = document.getElementById('weather-icon');
  if (weatherIcon) {
    weatherIcon.src = weatherData.current.icon;
    weatherIcon.alt = weatherData.current.weather;
  }
  
  // 気温
  const temperature = document.getElementById('temperature');
  if (temperature) {
    temperature.textContent = `${weatherData.current.temperature}°C`;
  }
  
  // 天気名
  const weatherName = document.getElementById('weather-name');
  if (weatherName) {
    weatherName.textContent = weatherData.current.weather;
  }
  
  // 今日の最高・最低気温
  const maxTemp = document.getElementById('max-temp');
  const minTemp = document.getElementById('min-temp');
  if (maxTemp && weatherData.today.maxTemp !== -9999) {
    maxTemp.textContent = `最高: ${weatherData.today.maxTemp}°C`;
  }
  if (minTemp && weatherData.today.minTemp !== -9999) {
    minTemp.textContent = `最低: ${weatherData.today.minTemp}°C`;
  }
}

/**
 * マスコット状態をHTMLに反映
 * @param {Object} mascotState マスコット状態データ
 */
function displayMascotState(mascotState) {
  // マスコットの気分
  const mascotMood = document.getElementById('mascot-mood');
  if (mascotMood) {
    mascotMood.textContent = `気分: ${mascotState.mood}`;
  }
  
  // エネルギーバー
  const energyBar = document.getElementById('energy-bar');
  if (energyBar) {
    energyBar.style.width = `${mascotState.energy}%`;
  }
  
  // 天気リアクション
  const weatherReaction = document.getElementById('weather-reaction');
  if (weatherReaction) {
    weatherReaction.textContent = mascotState.weatherReaction;
  }
  
  // おすすめ行動
  const recommendations = document.getElementById('recommendations');
  if (recommendations && mascotState.recommendations) {
    recommendations.innerHTML = mascotState.recommendations
      .map(rec => `<li>${rec}</li>`)
      .join('');
  }
}

// ========================
// 6. 実行例
// ========================

// ページ読み込み時に自動実行
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const result = await initializeWeatherMascot();
    
    if (result) {
      // HTMLに反映
      displayWeatherData(result.weather);
      displayMascotState(result.mascot);
      
      console.log('✅ 天気マスコットの初期化が完了しました！');
    }
  } catch (error) {
    console.error('❌ 初期化エラー:', error);
  }
});

// エクスポート（モジュールとして使用する場合）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getWeatherByCoords,
    getWeatherByCity,
    updateMascotState,
    chatWithMascot,
    displayWeatherData,
    displayMascotState,
    initializeWeatherMascot
  };
}