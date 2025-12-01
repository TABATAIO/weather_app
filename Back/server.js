const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

// 環境変数を読み込み
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア設定
app.use(cors()); // CORS設定（フロントエンドからのアクセス許可）
app.use(express.json()); // JSONデータを受け取るための設定

// ログ出力ミドルウェア
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ルート設定
app.get('/', (req, res) => {
  res.json({ 
    message: 'Weather Mascot App Backend',
    version: '1.0.0',
    weatherAPI: 'Weathernews Point Weather API',
    endpoints: [
      'GET /api/weather/:lat/:lon - 緯度経度で天気情報を取得',
      'GET /api/weather/city/:city - 都市名で天気情報を取得',
      'POST /api/mascot/update - マスコット状態を更新',
      'GET /api/mascot/:id - マスコット情報を取得'
    ],
    supportedCities: ['tokyo', 'osaka', 'kyoto', 'yokohama', 'nagoya', 'fukuoka', 'sendai', 'hiroshima']
  });
});

// 天気情報取得API（緯度経度指定）
app.get('/api/weather/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;
    const { lang = 'ja', hour } = req.query;
    
    // Weathernews API呼び出し
    const apiKey = process.env.WEATHERNEWS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Weathernews APIキーが設定されていません' 
      });
    }

    // Weathernews ポイント天気API
    const params = {
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      lang: lang
    };
    
    if (hour) {
      params.hour = parseInt(hour);
    }

    const weatherResponse = await axios.get(
      'https://wxtech.weathernews.com/api/forecast/point/v1',
      {
        params: params,
        headers: {
          'X-API-Key': apiKey
        }
      }
    );

    // レスポンスデータの構造に合わせて整形
    const forecast = weatherResponse.data.forecast[0]; // 最新の予報データ
    
    const weatherData = {
      location: weatherResponse.data.location,
      current: {
        time: forecast.time,
        weather: forecast.weather,
        temperature: forecast.temp,
        feelsLike: forecast.feels_like,
        humidity: forecast.humidity,
        precipitation: forecast.precip,
        windSpeed: forecast.wind_speed,
        windDirection: forecast.wind_dir,
        cloudCover: forecast.cloud_cover,
        uvIndex: forecast.uv_index,
        pressure: forecast.pressure
      },
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: weatherData
    });

  } catch (error) {
    console.error('Weathernews API呼び出しエラー:', error.message);
    res.status(500).json({ 
      success: false,
      error: '天気情報の取得に失敗しました',
      details: error.response?.data || error.message
    });
  }
});

// 都市名での天気取得（緯度経度変換付き）
app.get('/api/weather/city/:city', async (req, res) => {
  try {
    const city = req.params.city;
    const { lang = 'ja', hour } = req.query;
    
    // 主要都市の緯度経度マッピング
    const cityCoordinates = {
      'tokyo': { lat: 35.681236, lon: 139.767125, name: '東京' },
      'osaka': { lat: 34.693738, lon: 135.502165, name: '大阪' },
      'kyoto': { lat: 35.011636, lon: 135.768029, name: '京都' },
      'yokohama': { lat: 35.447753, lon: 139.642514, name: '横浜' },
      'nagoya': { lat: 35.181446, lon: 136.906398, name: '名古屋' },
      'fukuoka': { lat: 33.590355, lon: 130.401716, name: '福岡' },
      'sendai': { lat: 38.268215, lon: 140.869356, name: '仙台' },
      'hiroshima': { lat: 34.385295, lon: 132.455293, name: '広島' }
    };

    const coords = cityCoordinates[city.toLowerCase()];
    if (!coords) {
      return res.status(400).json({
        success: false,
        error: `都市 '${city}' はサポートされていません`,
        supportedCities: Object.keys(cityCoordinates).map(key => ({
          key: key,
          name: cityCoordinates[key].name
        }))
      });
    }

    // Weathernews API直接呼び出し
    const apiKey = process.env.WEATHERNEWS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Weathernews APIキーが設定されていません' 
      });
    }

    const params = {
      lat: coords.lat,
      lon: coords.lon,
      lang: lang
    };
    
    if (hour) {
      params.hour = parseInt(hour);
    }

    const weatherResponse = await axios.get(
      'https://wxtech.weathernews.com/api/forecast/point/v1',
      {
        params: params,
        headers: {
          'X-API-Key': apiKey
        }
      }
    );

    const forecast = weatherResponse.data.forecast[0];
    
    res.json({
      success: true,
      data: {
        city: {
          key: city,
          name: coords.name,
          coordinates: {
            lat: coords.lat,
            lon: coords.lon
          }
        },
        location: weatherResponse.data.location,
        current: {
          time: forecast.time,
          weather: forecast.weather,
          temperature: forecast.temp,
          feelsLike: forecast.feels_like,
          humidity: forecast.humidity,
          precipitation: forecast.precip,
          windSpeed: forecast.wind_speed,
          windDirection: forecast.wind_dir,
          cloudCover: forecast.cloud_cover,
          uvIndex: forecast.uv_index,
          pressure: forecast.pressure
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('都市名天気取得エラー:', error.message);
    res.status(500).json({ 
      success: false,
      error: '天気情報の取得に失敗しました',
      details: error.response?.data || error.message
    });
  }
});

// マスコット状態更新API
app.post('/api/mascot/update', (req, res) => {
  try {
    const { 
      weather, 
      temperature, 
      feelsLike, 
      humidity, 
      precipitation, 
      windSpeed, 
      cloudCover, 
      uvIndex 
    } = req.body;
    
    // マスコットの状態を計算（拡張された天気データ対応）
    const mascotState = calculateMascotState({
      weather,
      temperature,
      feelsLike,
      humidity,
      precipitation,
      windSpeed,
      cloudCover,
      uvIndex
    });
    
    res.json({
      success: true,
      data: mascotState
    });

  } catch (error) {
    console.error('マスコット状態更新エラー:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'マスコット状態の更新に失敗しました' 
    });
  }
});

// マスコット情報取得API
app.get('/api/mascot/:id', (req, res) => {
  try {
    const mascotId = req.params.id;
    
    // 仮のマスコット情報（後でデータベース連携）
    const mascotInfo = {
      id: mascotId,
      name: 'ウェザーちゃん',
      level: 5,
      experience: 150,
      mood: 'happy',
      lastUpdate: new Date().toISOString()
    };

    res.json({
      success: true,
      data: mascotInfo
    });

  } catch (error) {
    console.error('マスコット情報取得エラー:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'マスコット情報の取得に失敗しました' 
    });
  }
});

// マスコット状態計算関数（拡張版）
function calculateMascotState(weatherData) {
  const {
    weather,
    temperature,
    feelsLike,
    humidity,
    precipitation,
    windSpeed,
    cloudCover,
    uvIndex
  } = weatherData;

  let mood = 'neutral';
  let energy = 50;
  let happiness = 50;
  let comfort = 50;

  // 天気による基本状態変化
  switch (weather?.toLowerCase()) {
    case 'sunny':
    case 'clear':
      mood = 'happy';
      energy += 25;
      happiness += 35;
      break;
    case 'rainy':
    case 'rain':
      mood = 'sad';
      energy -= 15;
      happiness -= 25;
      break;
    case 'snow':
      mood = 'excited';
      energy += 15;
      happiness += 20;
      break;
    case 'cloudy':
    case 'clouds':
      mood = 'calm';
      energy += 5;
      happiness += 5;
      break;
    default:
      mood = 'neutral';
  }

  // 体感温度による調整
  const tempToUse = feelsLike || temperature;
  if (tempToUse < 0) {
    energy -= 20;
    comfort -= 30;
    mood = 'freezing';
  } else if (tempToUse < 10) {
    energy -= 10;
    comfort -= 15;
    if (mood === 'neutral') mood = 'cold';
  } else if (tempToUse > 35) {
    energy -= 15;
    comfort -= 25;
    mood = 'hot';
  } else if (tempToUse > 28) {
    energy -= 5;
    comfort -= 10;
  }

  // 湿度による調整
  if (humidity > 80) {
    comfort -= 20;
    energy -= 10;
  } else if (humidity < 30) {
    comfort -= 10;
  }

  // 降水量による調整
  if (precipitation > 10) {
    happiness -= 15;
    energy -= 10;
  } else if (precipitation > 0) {
    happiness -= 5;
  }

  // 風速による調整
  if (windSpeed > 10) {
    energy -= 5;
    comfort -= 10;
  } else if (windSpeed > 5) {
    energy += 5; // 適度な風は気持ちいい
  }

  // 雲量による調整
  if (cloudCover > 80) {
    energy -= 5;
  } else if (cloudCover < 20) {
    happiness += 10;
  }

  // UV指数による調整
  if (uvIndex > 8) {
    comfort -= 15; // 強すぎる紫外線
  }

  // 値の範囲制限
  energy = Math.max(0, Math.min(100, energy));
  happiness = Math.max(0, Math.min(100, happiness));
  comfort = Math.max(0, Math.min(100, comfort));

  return {
    mood,
    energy,
    happiness,
    comfort,
    weatherReaction: getWeatherReaction(weatherData),
    recommendations: getRecommendations(weatherData),
    timestamp: new Date().toISOString()
  };
}

// 天気リアクション取得関数（拡張版）
function getWeatherReaction(weatherData) {
  const { weather, temperature, feelsLike, precipitation, windSpeed, uvIndex } = weatherData;
  
  const reactions = {
    sunny: [
      '今日はいい天気だね！☀️',
      'お散歩日和だよ♪',
      '太陽が気持ちいい～',
      '洗濯物がよく乾きそう！'
    ],
    rainy: [
      '雨の音って落ち着くよね☔',
      '傘を忘れずにね！',
      '雨上がりが楽しみ',
      'お家でのんびりしよう'
    ],
    snow: [
      '雪だ！雪だ！❄️',
      '雪遊びしたいな～',
      '真っ白できれい！',
      '雪だるま作ろう⛄'
    ],
    cloudy: [
      '曇り空も悪くないね☁️',
      'ちょっと涼しいかな',
      'のんびりした天気だね',
      '過ごしやすい気温だね'
    ]
  };

  let selectedReactions = reactions[weather?.toLowerCase()] || ['今日も一日がんばろう！'];
  
  // 特殊条件での追加リアクション
  const tempToUse = feelsLike || temperature;
  if (tempToUse > 30) {
    selectedReactions.push('暑いから水分補給を忘れずに！🥤');
  } else if (tempToUse < 5) {
    selectedReactions.push('寒いから暖かくしてね🧣');
  }
  
  if (precipitation > 5) {
    selectedReactions.push('雨が強いから気をつけてね！');
  }
  
  if (windSpeed > 8) {
    selectedReactions.push('風が強いから飛ばされないように！💨');
  }
  
  if (uvIndex > 7) {
    selectedReactions.push('紫外線が強いから日焼け止めを！🧴');
  }
  
  return selectedReactions[Math.floor(Math.random() * selectedReactions.length)];
}

// おすすめ行動取得関数
function getRecommendations(weatherData) {
  const { weather, temperature, feelsLike, precipitation, uvIndex, windSpeed } = weatherData;
  const recommendations = [];
  
  const tempToUse = feelsLike || temperature;
  
  // 服装アドバイス
  if (tempToUse > 25) {
    recommendations.push('軽装で涼しく過ごそう');
  } else if (tempToUse < 15) {
    recommendations.push('暖かい服装がおすすめ');
  }
  
  // 持ち物アドバイス
  if (precipitation > 0) {
    recommendations.push('傘を持参しよう');
  }
  
  if (uvIndex > 6) {
    recommendations.push('日焼け止めと帽子を忘れずに');
  }
  
  // 活動アドバイス
  if (weather === 'sunny' && tempToUse < 25) {
    recommendations.push('お出かけに最適な天気');
  } else if (weather === 'rainy') {
    recommendations.push('室内活動がおすすめ');
  }
  
  return recommendations;
}

// 404エラーハンドリング
app.use((req, res) => {
  res.status(404).json({ 
    error: 'エンドポイントが見つかりません' 
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 API documentation: http://localhost:${PORT}`);
});

module.exports = app;