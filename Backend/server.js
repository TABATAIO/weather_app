const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const natural = require('natural');
const nlp = require('compromise');

// データベース関連のインポート
const { setupDatabase } = require('./database');
const { 
  saveUserProfile, 
  getUserProfile, 
  saveChatHistory, 
  getChatHistory, 
  saveWeatherLog 
} = require('./dbUtils');

// 環境変数を読み込み
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア設定
app.use(cors()); // CORS設定（フロントエンドからのアクセス許可）
app.use(express.json()); // JSONデータを受け取るための設定

// リクエストログ用ミドルウェア（デバッグ用）
app.use((req, res, next) => {
  console.log(`🔍 リクエスト受信: ${req.method} ${req.path} - ${new Date().toISOString()}`);
  console.log(`🔍 Original URL: ${req.originalUrl}`);
  next();
});

// ログ出力ミドルウェア
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ルート設定
app.get('/', (req, res) => {
  console.log('🔍 ルートエンドポイント (/) に到達しました');
  res.json({ 
    message: 'Weather Mascot App Backend',
    version: '1.0.0',
    weatherAPI: 'Weathernews Point Weather API',
    database: 'SQLite (永続化対応)',
    endpoints: [
      'GET /api/weather/:lat/:lon - 緯度経度で天気情報を取得',
      'GET /api/weather/city/:city - 都市名で天気情報を取得',
      'POST /api/mascot/update - マスコット状態を更新',
      'GET /api/mascot/:id - マスコット情報を取得',
      'POST /api/mascot/chat - マスコットとの会話（AI機能・履歴保存）',
      'POST /api/user/profile - ユーザープロフィール設定（DB保存）',
      'GET /api/user/profile/:userId - ユーザープロフィール取得（DB）',
      'GET /api/chat/history/:userId - 会話履歴取得（DB）'
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

/**
 * AIマスコットとの会話APIエンドポイント
 * 高度な自然言語処理により、ユーザーの意図と感情を分析し、
 * 天気情報と組み合わせたパーソナライズされた応答を生成する
 */
app.post('/api/mascot/chat', async (req, res) => {
  try {
    const { 
      message, 
      userName, 
      userId,
      weatherData, 
      userPreferences = {},
      conversationHistory = []
    } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'メッセージが入力されていません'
      });
    }

    // AI会話レスポンス生成
    const chatResponse = generateChatResponse({
      userMessage: message.trim(),
      userName: userName || 'あなた',
      weatherData,
      userPreferences,
      conversationHistory
    });

    // 会話履歴をデータベースに保存（userIdがある場合のみ）
    if (userId) {
      try {
        const historyResult = await saveChatHistory({
          userId: userId,
          userMessage: message.trim(),
          botResponse: chatResponse.message,
          intent: chatResponse.intent || null,
          sentiment: chatResponse.sentiment || null,
          weatherData: weatherData || null
        });
        console.log(`💾 会話履歴を保存しました - User: ${userId}, ID: ${historyResult.id}`);
      } catch (dbError) {
        console.error('会話履歴保存エラー:', dbError.message);
        // 履歴保存エラーは会話の継続を妨げない
      }
    }

    res.json({
      success: true,
      data: {
        response: chatResponse.message,
        mood: chatResponse.mood,
        suggestions: chatResponse.suggestions,
        weatherAdvice: chatResponse.weatherAdvice,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI会話エラー:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'メッセージの処理に失敗しました',
      details: error.message
    });
  }
});

// 会話履歴取得API（本格版）
app.get('/api/chat/history/:userId', async (req, res) => {
  console.log('🔍 会話履歴APIエンドポイントに到達しました');
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    console.log(`📋 会話履歴取得リクエスト - UserID: ${userId}, Limit: ${limit}`);

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'ユーザーIDが必要です'
      });
    }

    // データベースから会話履歴を取得
    const chatHistory = await getChatHistory(userId, parseInt(limit));
    
    console.log(`📋 会話履歴取得結果 - 件数: ${chatHistory.length}`);

    res.json({
      success: true,
      data: {
        userId,
        history: chatHistory,
        count: chatHistory.length
      },
      message: `${userId}の会話履歴を${chatHistory.length}件取得しました`
    });

  } catch (error) {
    console.error('会話履歴取得エラー:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: '会話履歴の取得に失敗しました',
      details: error.message,
      userId: req.params.userId,
      requestedLimit: req.query.limit
    });
  }
});

/**
 * ユーザー名を正規化する（「さん」の重複を防ぐ）
 * @param {string} userName - 元のユーザー名
 * @returns {string} 正規化されたユーザー名
 */
function normalizeUserName(userName) {
  if (!userName) return 'あなた';
  // 既に「さん」が付いている場合は除去
  return userName.replace(/さん$/, '');
}

// AI会話レスポンス生成関数
function generateChatResponse({ userMessage, userName, weatherData, userPreferences, conversationHistory }) {
  const message = userMessage.toLowerCase();
  const normalizedUserName = normalizeUserName(userName);
  
  // 自然言語解析
  const doc = nlp(userMessage);
  const sentiment = analyzeSentiment(userMessage);
  const intent = analyzeIntent(doc, message);
  const entities = extractEntities(doc);
  
  // 基本的な挨拶パターン
  const greetings = ['こんにちは', 'おはよう', 'こんばんは', 'はじめまして', 'やあ', 'hello', 'hi'];
  const farewells = ['さようなら', 'また今度', 'バイバイ', 'また明日', 'おつかれ', 'bye', 'see you'];
  
  // 天気関連のキーワード
  const weatherKeywords = ['天気', '気温', '暑い', '寒い', '雨', '晴れ', '曇り', '雪', '風', '湿度'];
  
  // 服装関連のキーワード
  const clothingKeywords = ['服装', '着る', '洋服', 'ファッション', 'コーデ', '何着る', '服', '何を着', '着れば', '服選び'];
  
  // 活動関連のキーワード
  const activityKeywords = ['何する', '遊び', '出かける', '家にいる', 'おすすめ', 'プラン', '予定'];
  
  // 感謝・褒め言葉のキーワード
  const appreciationKeywords = ['ありがとう', 'すごい', 'いいね', '素敵', 'かわいい', '助かる'];
  
  // ユーザー設定による個性化
  const isOutdoorLover = userPreferences?.activities === 'outdoor';
  const isIndoorLover = userPreferences?.activities === 'indoor';
  const isColdSensitive = userPreferences?.weatherSensitivity === 'high';
  const stylePreference = userPreferences?.style || 'casual';
  
  let response = '';
  let mood = 'friendly';
  let suggestions = [];
  let weatherAdvice = null;

  // 高度な自然言語処理を使用した応答生成
  const advancedResponse = generateAdvancedResponse(
    userMessage, intent, sentiment, entities, normalizedUserName, weatherData, userPreferences
  );
  
  response = advancedResponse.response;
  mood = advancedResponse.mood;
  suggestions = advancedResponse.suggestions || suggestions;
  weatherAdvice = advancedResponse.weatherAdvice;

  return {
    message: response,
    mood: mood,
    suggestions: suggestions,
    weatherAdvice: weatherAdvice,
    intent: intent,
    sentiment: sentiment,
    confidence: Math.random() * 0.3 + 0.7 // 0.7-1.0の信頼度
  };
}

/**
 * 天気情報に基づいてカジュアルなコメントを生成する
 * @param {Object} currentWeather - 天気データ（温度、天気など）
 * @returns {string} 天気に合ったカジュアルなコメント
 */
function getWeatherComment(currentWeather) {
  const { weather, temperature } = currentWeather;
  
  switch (weather?.toLowerCase()) {
    case 'sunny':
      return temperature > 25 ? 
        '今日は暑くなりそうですね！水分補給を忘れずに🌞' : 
        '今日はいい天気ですね！お出かけ日和です☀️';
    case 'rainy':
      return '今日は雨模様ですね。傘を忘れずに！☔';
    case 'cloudy':
      return '曇り空ですが、過ごしやすそうな気温ですね☁️';
    case 'snow':
      return '雪が降っているんですね！暖かくしてくださいね❄️';
    default:
      return '今日もよろしくお願いします！';
  }
}

// 天気レスポンス生成
function generateWeatherResponse(currentWeather, userName) {
  const { weather, temperature, humidity, windSpeed } = currentWeather;
  
  let response = `${userName}さん、今日の天気についてお話ししますね！\n\n`;
  
  // 基本天気情報
  response += `現在の気温は${temperature}度で、`;
  
  switch (weather?.toLowerCase()) {
    case 'sunny':
      response += temperature > 30 ? 
        '暑い晴れの日ですね🌞 熱中症に気をつけてください！' :
        'いい天気ですね☀️ お散歩にぴったりです！';
      break;
    case 'rainy':
      response += '雨が降っていますね☔ 濡れないように気をつけてください';
      break;
    case 'cloudy':
      response += '曇り空ですね☁️ 過ごしやすい気温だと思います';
      break;
    case 'snow':
      response += '雪が降っているんですね❄️ 足元に気をつけてくださいね';
      break;
    default:
      response += '今日もいい一日になりそうですね';
  }
  
  // 追加情報
  if (humidity > 70) {
    response += '\n湿度が高めなので、じめじめしているかもしれませんね💧';
  }
  
  if (windSpeed > 8) {
    response += '\n風が強いので、帽子や軽いものが飛ばされないよう注意してくださいね💨';
  }
  
  return response;
}

/**
 * 現在の天気情報に基づいて服装アドバイスを生成する
 * @param {Object} currentWeather - 現在の天気データ（温度、天気、湿度など）
 * @returns {Object} 服装アドバイスオブジェクト（advice, items, reasons）
 */
function generateClothingAdvice(currentWeather) {
  const { weather, temperature, feelsLike } = currentWeather;
  const temp = feelsLike || temperature;
  
  let advice = '';
  let items = [];
  
  // 温度による基本アドバイス
  if (temp >= 30) {
    advice = '暑いので、涼しい服装がおすすめです！';
    items = ['薄手のTシャツ', '短パン・スカート', 'サンダル', '帽子', '日傘'];
  } else if (temp >= 25) {
    advice = '暖かいので、軽めの服装で大丈夫そうです';
    items = ['半袖', '薄手の長袖', 'ジーンズ', 'スニーカー'];
  } else if (temp >= 20) {
    advice = '過ごしやすい気温ですね！';
    items = ['長袖シャツ', 'カーディガン', 'チノパン', '軽めのジャケット'];
  } else if (temp >= 15) {
    advice = '少し涼しいので、重ね着がおすすめです';
    items = ['セーター', 'ジャケット', 'ロングパンツ', 'スニーカー'];
  } else if (temp >= 10) {
    advice = '寒いので、暖かい格好でお出かけくださいね';
    items = ['厚手のセーター', 'コート', 'マフラー', 'ブーツ'];
  } else {
    advice = 'とても寒いので、しっかり防寒してください！';
    items = ['ダウンジャケット', 'マフラー', '手袋', 'ニット帽', 'ブーツ'];
  }
  
  // 天気による追加アドバイス
  switch (weather?.toLowerCase()) {
    case 'rainy':
      advice += ' 雨なので防水対策も忘れずに！';
      items.push('レインコート', '傘', 'レインブーツ');
      break;
    case 'sunny':
      if (temp > 25) {
        advice += ' 日差しが強いので紫外線対策も大切です';
        items.push('日焼け止め', 'サングラス', '帽子');
      }
      break;
    case 'snow':
      advice += ' 雪なので滑りにくい靴がおすすめです';
      items.push('スノーブーツ', '防水ジャケット', '手袋');
      break;
  }
  
  return { advice, items };
}

// 天気に応じた提案
function getWeatherSuggestions(currentWeather) {
  const { weather, temperature } = currentWeather;
  const suggestions = [];
  
  switch (weather?.toLowerCase()) {
    case 'sunny':
      if (temperature > 25) {
        suggestions.push('カフェでアイスドリンク', '日陰で休憩', '室内で涼む');
      } else {
        suggestions.push('公園でお散歩', 'ピクニック', '屋外スポーツ');
      }
      break;
    case 'rainy':
      suggestions.push('映画鑑賞', '読書タイム', '室内カフェ', 'ゲーム');
      break;
    case 'cloudy':
      suggestions.push('ショッピング', '美術館巡り', 'カフェ巡り');
      break;
    case 'snow':
      suggestions.push('雪景色を楽しむ', '温かい飲み物', '室内で過ごす');
      break;
  }
  
  return suggestions;
}

/**
 * ユーザーの設定と天気情報に基づいてパーソナライズされた活動提案を生成する
 * @param {Object} currentWeather - 現在の天気データ
 * @param {Object} userPreferences - ユーザーの活動設定（outdoor/indoor/etc）
 * @returns {Object} 提案される活動のリスト（main, options, reason）
 */
function generatePersonalizedActivitySuggestions(currentWeather, userPreferences) {
  const { weather, temperature } = currentWeather;
  const isOutdoorLover = userPreferences?.activities === 'outdoor';
  const isIndoorLover = userPreferences?.activities === 'indoor';
  
  let main = '';
  let options = [];
  
  // 天気と個人設定を組み合わせた提案
  if (weather?.toLowerCase() === 'sunny') {
    if (isIndoorLover) {
      main = '晴れてますが、室内で快適に過ごす';
      options = ['美術館巡り', 'ショッピングモール', 'カフェでまったり', '映画鑑賞'];
    } else {
      main = '晴天なのでアウトドア活動';
      options = temperature > 25 ? 
        ['水族館', '涼しいカフェ', 'エアコンの効いた施設'] : 
        ['公園散歩', 'ピクニック', '屋外スポーツ', 'サイクリング'];
    }
  } else if (weather?.toLowerCase() === 'rainy') {
    main = '雨なので室内でゆっくり';
    options = isOutdoorLover ? 
      ['室内クライミング', '温泉', 'スポーツジム'] :
      ['読書', '映画', 'ゲーム', 'お料理', 'オンラインショッピング'];
  } else {
    main = '今日は何でもできそうな天気';
    options = ['カフェ巡り', 'ウィンドウショッピング', '友達と会う', '新しい場所探索'];
  }
  
  return { main, options };
}

// パーソナライズされた一般会話レスポンス
function generatePersonalizedResponse(message, userName, userPreferences) {
  const stylePreference = userPreferences?.style || 'casual';
  const isWeatherSensitive = userPreferences?.weatherSensitivity === 'high';
  
  let responses = [
    `${userName}さん、興味深いお話ですね！もう少し詳しく教えてください`,
    `${userName}さんとお話ししていると、いつも新しい発見があります！`,
    `それは面白いですね、${userName}さん！私も同じように感じることがあります`
  ];
  
  // スタイル設定による個性化
  if (stylePreference === 'elegant') {
    responses.push(`${userName}さんの上品な感性、とても素敵だと思います✨`);
  } else if (stylePreference === 'sporty') {
    responses.push(`${userName}さんのアクティブな感じ、エネルギーをもらえます！`);
  } else if (stylePreference === 'cute') {
    responses.push(`${userName}さん、とってもキュートですね💕`);
  }
  
  // 天気敏感性による配慮
  if (isWeatherSensitive) {
    responses.push(`${userName}さんは天気の変化に敏感でいらっしゃるので、体調にはお気をつけくださいね`);
  }
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// 高度な自然言語処理関数群

/**
 * テキストの感情分析を行う（ローカル実装）
 * @param {string} text - 分析対象のテキスト
 * @returns {string} 感情の種類（positive, negative, neutral）
 */
function analyzeSentiment(text) {
  // Naturalライブラリの代わりに独自の感情分析を使用
  
  // 感情的な単語辞書（くだけた表現も含む）
  const positiveWords = [
    '嬉しい', '楽しい', 'ハッピー', '良い', 'いいね', '素敵', '最高', '好き', 
    'ありがとう', 'すごい', 'やったー', 'わーい', 'うれしー', 'たのしー',
    'いい感じ', 'めっちゃ', 'マジ', '神', 'やばい', 'かっこいい', 'かわいい'
  ];
  
  const negativeWords = [
    '悲しい', 'つらい', '疲れた', '嫌', '辛い', '困った', '大変', '心配', '不安', '寂しい',
    'つかれた', 'つかれ', '疲れ', 'だるい', 'しんどい', 'きつい', 'やばい', 
    'むかつく', 'いやだ', 'めんどい', 'めんどくさい', 'やだ', 'つまんない',
    'ダメ', 'だめ', '最悪', 'ひどい', 'むり', '無理', 'やってられない'
  ];
  
  const neutralWords = ['普通', 'まあまあ', 'そこそこ', 'いつも通り', 'ふつう'];
  
  // 文末の感情表現パターンも考慮
  const emotionalEndings = {
    negative: ['なー', 'なあ', 'よー', 'よお', 'はあ', '...', '。。。', '、、、'],
    positive: ['♪', '！', '!', '✨', '😊', '😄', '🎉']
  };
  
  const words = text.split(/\s+/);
  let score = 0;
  
  // 単語による感情判定
  words.forEach(word => {
    if (positiveWords.some(pw => word.includes(pw))) score += 1;
    if (negativeWords.some(nw => word.includes(nw))) score -= 1;
  });
  
  // 文末表現による感情判定
  emotionalEndings.negative.forEach(ending => {
    if (text.endsWith(ending)) score -= 0.5;
  });
  emotionalEndings.positive.forEach(ending => {
    if (text.includes(ending)) score += 0.5;
  });
  
  // 疲労系の特別判定（「なー」「よー」などが付くと更にネガティブ）
  if ((text.includes('疲れ') || text.includes('つかれ') || text.includes('だるい')) && 
      (text.includes('なー') || text.includes('よー') || text.includes('はあ'))) {
    score -= 1;
  }
  
  // 強い否定表現の検出
  const strongNegativePatterns = [
    /最悪|ひどい|むかつく|イライラ/,
    /もう.*だめ|限界|無理.*す[ぎぎ]/,
    /やってられない|うんざり/
  ];
  
  strongNegativePatterns.forEach(pattern => {
    if (pattern.test(text)) score -= 1.5;
  });
  
  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
}

// 意図分析（改良版）
/**
 * ユーザーのメッセージからインテント（意図）を分析する
 * @param {Object} doc - compromise.jsで解析されたドキュメントオブジェクト
 * @param {string} message - ユーザーの入力メッセージ
 * @returns {string} 検出されたインテント（fatigue_support, weather_clothing, greeting, etc.）
 */
function analyzeIntent(doc, message) {
  // 優先度順で判定（より具体的なものを先に判定）
  
  // 疲労・体調関連（最優先）
  const fatigueKeywords = [
    '疲れ', 'つかれ', 'だる', 'しんど', 'きつ', 'ばて', 
    'へとへと', 'くたくた', 'げんなり', 'ぐったり', '眠い',
    'やばい', '限界', '無理', 'もうだめ', 'たまらん', 'しんどすぎ'
  ];
  
  // 疲労関連の文脈パターンも検出
  const fatiguePatterns = [
    /疲れ.*な[ーあ]/,
    /だる.*よ[ーお]/,
    /しんど.*は[ーあ]/,
    /きつ.*な[ーあ]/
  ];
  
  if (fatigueKeywords.some(keyword => message.includes(keyword)) ||
      fatiguePatterns.some(pattern => pattern.test(message))) {
    return 'fatigue_support';
  }
  
  // 天気・服装関連（高優先）
  const weatherKeywords = [
    '天気', '気温', '寒い', '暑い', '涼しい', '暖かい', 
    '雨', '晴れ', '曇り', '雪', '風', '湿度', '気候'
  ];
  const clothingKeywords = [
    '服', '着る', '洋服', 'ファッション', 'コーデ', 
    '何着る', '服装', '何を着', '着れば', '服選び'
  ];
  
  if (weatherKeywords.some(keyword => message.includes(keyword)) ||
      clothingKeywords.some(keyword => message.includes(keyword))) {
    return 'weather_clothing';
  }
  
  // 挨拶の検出
  const greetingKeywords = [
    'おはよう', 'こんにちは', 'こんばんは', 'はじめまして', 
    'やあ', 'hello', 'hi', 'ハロー'
  ];
  if (greetingKeywords.some(keyword => message.includes(keyword))) {
    return 'greeting';
  }
  
  // お別れの検出
  const farewellKeywords = [
    'さよなら', 'また今度', 'バイバイ', 'また明日', 
    'おつかれ', 'bye', 'see you'
  ];
  if (farewellKeywords.some(keyword => message.includes(keyword))) {
    return 'farewell';
  }
  
  // 活動・提案関連
  const activityKeywords = [
    '何する', '遊び', '出かける', '家にいる', 'おすすめ', 
    'プラン', '予定', '行く', '何しよう', 'どこ行く'
  ];
  if (activityKeywords.some(keyword => message.includes(keyword))) {
    return 'activity_suggestion';
  }
  
  // 感謝・褒め言葉
  const appreciationKeywords = [
    'ありがとう', 'すごい', 'いいね', '素敵', 'かわいい', 
    '助かる', '感謝', 'よかった'
  ];
  if (appreciationKeywords.some(keyword => message.includes(keyword))) {
    return 'appreciation';
  }
  
  // リクエスト・依頼の検出
  const requestKeywords = [
    '教えて', 'してください', 'お願い', 'できる', 'して', 
    'やって', 'どうすれば', 'どうしたら'
  ];
  if (requestKeywords.some(keyword => message.includes(keyword))) {
    return 'request';
  }
  
  // 質問の検出（一般的な疑問詞）
  const questionKeywords = [
    'どう', 'なに', 'なん', 'いつ', 'どこ', 'なんで', 'どれ', 
    'どちら', 'どの', 'いくら', 'どのくらい'
  ];
  if (message.includes('？') || message.includes('?') || 
      questionKeywords.some(keyword => message.includes(keyword))) {
    
    // 天気関連の質問かどうか再チェック
    if (weatherKeywords.some(keyword => message.includes(keyword))) {
      return 'weather_clothing';
    }
    return 'question';
  }
  
  return 'general';
}

// エンティティ抽出
function extractEntities(doc) {
  const entities = {
    places: [],
    people: [],
    organizations: [],
    dates: [],
    times: [],
    numbers: []
  };
  
  // 基本的なエンティティ抽出（簡易版）
  try {
    if (doc.places) entities.places = doc.places().out('array');
    if (doc.people) entities.people = doc.people().out('array');
    if (doc.organizations) entities.organizations = doc.organizations().out('array');
    if (doc.values) entities.numbers = doc.values().out('array');
  } catch (error) {
    // エラーが発生した場合は空配列を返す
    console.log('Entity extraction error:', error.message);
  }
  
  return entities;
}

// 音声入力対応のテキスト正規化
function normalizeForSpeech(text) {
  // 音声認識でよくある誤変換を修正
  const corrections = {
    '気候': '天気',
    '服そう': '服装',
    '何きる': '何着る',
    'つかれた': '疲れた',
    'うれしい': '嬉しい',
    'かなしい': '悲しい'
  };
  
  let normalized = text;
  Object.entries(corrections).forEach(([wrong, correct]) => {
    normalized = normalized.replace(new RegExp(wrong, 'g'), correct);
  });
  
  return normalized;
}

// コンテキスト理解を強化した応答生成
/**
 * インテント、感情、エンティティを基に高度な応答を生成する
 * @param {string} userMessage - ユーザーの入力メッセージ
 * @param {string} intent - 検出されたインテント
 * @param {string} sentiment - 検出された感情（positive/negative/neutral）
 * @param {Object} entities - 抽出されたエンティティ情報
 * @param {string} userName - ユーザー名
 * @param {Object} weatherData - 天気データ
 * @param {Object} userPreferences - ユーザーの設定情報
 * @returns {Object} 応答オブジェクト（response, mood, suggestions, weatherAdvice）
 */
function generateAdvancedResponse(userMessage, intent, sentiment, entities, userName, weatherData, userPreferences) {
  let response = '';
  let mood = 'friendly';
  let suggestions = [];
  let weatherAdvice = null;
  
  // 正規化
  const normalizedMessage = normalizeForSpeech(userMessage);
  
  switch (intent) {
    case 'greeting':
      response = generateContextualGreeting(userName, weatherData, sentiment);
      break;
      
    case 'weather_clothing':
      if (weatherData && weatherData.current) {
        weatherAdvice = generateClothingAdvice(weatherData.current);
        response = generateWeatherClothingResponse(userName, weatherData.current, weatherAdvice, sentiment);
        suggestions = weatherAdvice.items;
      } else {
        // 天気データがない場合でも天気に関する一般的な応答
        response = generateWeatherResponseWithoutData(userName, userMessage, sentiment);
      }
      break;
      
    case 'fatigue_support':
      response = generateFatigueResponse(userName, userMessage, weatherData, sentiment);
      mood = 'caring';
      suggestions = ['ゆっくり休む', '温かい飲み物', '軽いストレッチ', '好きな音楽を聴く'];
      break;
      
    case 'appreciation':
      const thankfulResponses = [
        `${userName}さん、そう言ってもらえて嬉しいです！💕`,
        `${userName}さんのお役に立てて良かったです✨`,
        `ありがとうございます、${userName}さん！もっと頑張りますね`,
        `${userName}さんに喜んでもらえることが私の一番の幸せです♪`
      ];
      response = thankfulResponses[Math.floor(Math.random() * thankfulResponses.length)];
      mood = 'happy';
      break;
      
    case 'activity_suggestion':
      if (weatherData && weatherData.current) {
        const activities = generatePersonalizedActivitySuggestions(weatherData.current, userPreferences);
        response = generateActivityResponse(userName, activities, sentiment);
        suggestions = activities.options;
      } else {
        response = generateNoWeatherDataResponse(userName, 'activity');
      }
      break;
      
    case 'question':
      response = generateQuestionResponse(normalizedMessage, userName, weatherData, sentiment);
      break;
      
    case 'farewell':
      response = generateFarewellResponse(userName, sentiment);
      mood = 'sad';
      break;
      
    case 'request':
      response = generateHelpfulResponse(normalizedMessage, userName, sentiment);
      break;
      
    default:
      response = generateContextualGeneral(normalizedMessage, userName, sentiment, entities);
  }
  
  // 感情に応じてムード調整
  if (sentiment === 'negative') {
    mood = 'caring';
    if (!suggestions.length) {
      suggestions = ['深呼吸する', 'お茶を飲む', '好きな音楽を聴く'];
    }
  } else if (sentiment === 'positive') {
    mood = 'happy';
  }
  
  return { response, mood, suggestions, weatherAdvice };
}

// コンテキスト別応答生成関数群
/**
 * 時間帯と天気情報を考慮したコンテキスト型挨拶を生成する
 * @param {string} userName - ユーザー名
 * @param {Object} weatherData - 天気データ
 * @param {string} sentiment - ユーザーの感情状態
 * @returns {string} パーソナライズされた挨拶メッセージ
 */
function generateContextualGreeting(userName, weatherData, sentiment) {
  const timeOfDay = new Date().getHours();
  let timeGreeting = '';
  
  if (timeOfDay < 10) timeGreeting = 'おはようございます';
  else if (timeOfDay < 18) timeGreeting = 'こんにちは';
  else timeGreeting = 'こんばんは';
  
  let baseResponse = `${timeGreeting}、${userName}さん！`;
  
  if (sentiment === 'positive') {
    baseResponse += ' 元気そうで何よりです♪';
  } else if (sentiment === 'negative') {
    baseResponse += ' 何かお困りのことがあれば、お話し聞きますよ。';
  }
  
  if (weatherData && weatherData.current) {
    baseResponse += ` ${getWeatherComment(weatherData.current)}`;
  }
  
  return baseResponse;
}

/**
 * 天気情報に基づいた服装アドバイス応答を生成する
 * @param {string} userName - ユーザー名
 * @param {Object} weather - 現在の天気情報
 * @param {Object} advice - 生成された服装アドバイス
 * @param {string} sentiment - ユーザーの感情状態
 * @returns {string} 天気に応じた服装アドバイスメッセージ
 */
function generateWeatherClothingResponse(userName, weather, advice, sentiment) {
  let response = `${userName}さん、今日の服装についてですね！`;
  
  if (sentiment === 'negative') {
    response = `${userName}さん、体調に合わせた服装選びが大切ですね。`;
  }
  
  response += ` ${advice.advice}`;
  
  // 具体的なアドバイス追加
  if (weather.temperature < 10) {
    response += ' 冷え込むので、重ね着で調整できるようにしてくださいね。';
  } else if (weather.temperature > 25) {
    response += ' 暑くなりそうなので、涼しい素材がおすすめです。';
  }
  
  return response;
}

/**
 * ユーザーの感情状態に応じた活動提案応答を生成する
 * @param {string} userName - ユーザー名
 * @param {Object} activities - 提案する活動リスト
 * @param {string} sentiment - ユーザーの感情状態
 * @returns {string} パーソナライズされた活動提案メッセージ
 */
function generateActivityResponse(userName, activities, sentiment) {
  let response = `${userName}さん、`;
  
  if (sentiment === 'negative') {
    response += 'リフレッシュできる活動はいかがでしょうか？';
  } else {
    response += `今日は${activities.main}はいかがですか？`;
  }
  
  return response;
}

/**
 * ユーザーの質問内容を分析して適切な応答を生成する
 * @param {string} message - ユーザーの質問メッセージ
 * @param {string} userName - ユーザー名
 * @param {Object} weatherData - 天気データ
 * @param {string} sentiment - ユーザーの感情状態
 * @returns {string} 質問に対する応答メッセージ
 */
function generateQuestionResponse(message, userName, weatherData, sentiment) {
  // 質問の内容を分析して適切な応答
  if (message.includes('なぜ') || message.includes('どうして')) {
    return `${userName}さん、いい質問ですね！それについて考えてみましょう。`;
  } else if (message.includes('いつ') || message.includes('時間')) {
    return `${userName}さん、タイミングは大切ですよね。状況を見て判断しましょう。`;
  } else {
    return `${userName}さんの質問、興味深いです！一緒に考えてみましょう。`;
  }
}

/**
 * 天気データがない場合の応答を生成する
 * @param {string} userName - ユーザー名
 * @param {string} type - リクエストの種類（clothing/activity）
 * @returns {string} 天気データなしの場合の応答メッセージ
 */
function generateNoWeatherDataResponse(userName, type) {
  if (type === 'clothing') {
    return `${userName}さん、服装アドバイスをしたいのですが、今日の天気情報があるともっと具体的にお話しできます！`;
  } else {
    return `${userName}さん、活動提案をしたいのですが、天気情報があるとより良い提案ができますよ。`;
  }
}

/**
 * 疲労を表現するメッセージに対する共感的な応答を生成する
 * @param {string} userName - ユーザー名
 * @param {string} message - 疲労を表現するメッセージ
 * @param {Object} weatherData - 天気データ（体調アドバイスに使用）
 * @param {string} sentiment - 感情の種類
 * @returns {string} 共感的で励ましの応答メッセージ
 */
function generateFatigueResponse(userName, message, weatherData, sentiment) {
  // メッセージの内容によって応答を調整
  let response = `${userName}さん、`;
  
  // くだけた表現の検出
  if (message.includes('なー') || message.includes('よー') || message.includes('はあ')) {
    response += 'お疲れ様です...本当にお疲れですね😔';
  } else if (message.includes('つかれた') || message.includes('疲れた')) {
    response += 'お疲れ様でした。今日も頑張りましたね';
  } else if (message.includes('だるい') || message.includes('しんどい')) {
    response += '体調が優れないようですね。無理は禁物ですよ';
  } else {
    response += 'なんだかお疲れのようですね';
  }
  
  // 天気情報があれば体調に関するアドバイスを追加
  if (weatherData && weatherData.current) {
    const temp = weatherData.current.temperature;
    const weather = weatherData.current.weather;
    
    if (temp < 15) {
      response += '。寒いので体を温めて、ゆっくり休んでくださいね🧥';
    } else if (temp > 25) {
      response += '。暑いので水分補給を忘れずに、涼しい場所で休憩してください💧';
    } else if (weather === 'rain') {
      response += '。雨の日は気分も沈みがちですよね。温かい飲み物でも飲んでリラックスしましょう☔';
    } else {
      response += '。少し外の空気を吸うのもいいかもしれませんね🌸';
    }
  } else {
    response += '。温かい飲み物を飲んで、少し休憩してみてはいかがでしょう？';
  }
  
  // 激励の言葉を追加
  const encouragements = [
    '明日はきっといい日になりますよ',
    'あまり頑張りすぎず、自分を大切にしてくださいね',
    '疲れた時は休むのも大切です',
    'ゆっくり休んで、また元気になりましょう'
  ];
  
  response += ` ${encouragements[Math.floor(Math.random() * encouragements.length)]}✨`;
  
  return response;
}

/**
 * お別れの挨拶メッセージを生成する
 * @param {string} userName - ユーザー名
 * @param {string} sentiment - ユーザーの感情状態
 * @returns {string} お別れの挨拶メッセージ
 */
function generateFarewellResponse(userName, sentiment) {
  const farewells = [
    `${userName}さん、またお話ししましょうね！`,
    `${userName}さん、素敵な時間をありがとうございました。`,
    `${userName}さん、お疲れ様でした！ゆっくり休んでくださいね。`
  ];
  
  return farewells[Math.floor(Math.random() * farewells.length)];
}

/**
 * ユーザーからのリクエストに対するサポート的な応答を生成する
 * @param {string} message - ユーザーのリクエストメッセージ
 * @param {string} userName - ユーザー名
 * @param {string} sentiment - ユーザーの感情状態
 * @returns {string} サポート的な応答メッセージ
 */
function generateHelpfulResponse(message, userName, sentiment) {
  return `${userName}さん、もちろんお手伝いします！何についてお話ししたいですか？`;
}

/**
 * 一般的な会話のためのコンテキスト型応答を生成する
 * @param {string} message - ユーザーのメッセージ
 * @param {string} userName - ユーザー名
 * @param {string} sentiment - ユーザーの感情状態
 * @param {Object} entities - 抽出されたエンティティ情報
 * @returns {string} コンテキストに応じた一般的な応答
 */
function generateContextualGeneral(message, userName, sentiment, entities) {
  // エンティティに基づいた応答
  if (entities.places.length > 0) {
    return `${userName}さん、${entities.places[0]}のお話ですね！興味深いです。`;
  } else if (entities.times.length > 0) {
    return `${userName}さん、時間に関するお話ですね。タイミングは大切ですよね。`;
  } else {
    const responses = [
      `${userName}さんのお話、とても興味深いです！`,
      `${userName}さん、もう少し詳しく教えてください。`,
      `${userName}さんとこうしてお話しできて嬉しいです。`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

/**
 * 天気データがない状態で天気関連の質問に応答する
 * @param {string} userName - ユーザー名
 * @param {string} message - ユーザーの天気関連メッセージ
 * @param {string} sentiment - ユーザーの感情状態
 * @returns {string} 天気データなしでも役立つ応答メッセージ
 */
function generateWeatherResponseWithoutData(userName, message, sentiment) {
  const message_lower = message.toLowerCase();
  
  // 寒さ・暑さの質問
  if (message_lower.includes('寒い') || message_lower.includes('寒く')) {
    return `${userName}さん、今日は寒そうですね。暖かい格好でお出かけくださいね🧥 具体的な天気情報があれば、もっと詳しくアドバイスできますよ！`;
  } else if (message_lower.includes('暑い') || message_lower.includes('暑く')) {
    return `${userName}さん、今日は暑そうですね。涼しい服装と水分補給を忘れずに☀️ 詳しい天気情報があれば、より具体的なアドバイスができます！`;
  } 
  // 天気の質問全般
  else if (message_lower.includes('天気') || message_lower.includes('気温')) {
    return `${userName}さん、天気が気になりますよね！現在の天気データがあれば、詳しい情報やおすすめの服装をお教えできるのですが...🌤️ お住まいの地域の天気はいかがですか？`;
  }
  // 服装の質問
  else if (message_lower.includes('着る') || message_lower.includes('服')) {
    return `${userName}さん、服装選びですね！天気に合わせた服装が一番ですが、現在の気温や天候が分かればもっと具体的にアドバイスできます👔 今日の天気はどんな感じですか？`;
  }
  // 一般的な天気関連
  else {
    return `${userName}さん、お天気のことですね！☁️ 天気によって一日の気分も変わりますよね。現在の天気情報があれば、服装や活動のアドバイスもできますよ`;
  }
}

// ユーザープロフィール設定API
app.post('/api/user/profile', async (req, res) => {
  try {
    const {
      userId,
      userName,
      preferences = {},
      favoriteActivities = [],
      clothingStyle = 'casual'
    } = req.body;

    if (!userId || !userName) {
      return res.status(400).json({
        success: false,
        error: 'ユーザーIDと名前は必須です'
      });
    }

    // データベースにプロフィールを保存
    const userProfile = {
      userId,
      userName,
      preferences: {
        temperature: preferences.temperature || 'moderate',
        activities: preferences.activities || 'both',
        style: preferences.style || clothingStyle,
        weatherSensitivity: preferences.weatherSensitivity || 'normal'
      },
      favoriteActivities
    };

    const result = await saveUserProfile(userProfile);

    if (result.success) {
      res.json({
        success: true,
        data: userProfile,
        message: `${userName}さんのプロフィールをデータベースに保存しました！`,
        dbResult: result
      });
    } else {
      throw new Error('データベース保存に失敗しました');
    }

  } catch (error) {
    console.error('プロフィール設定エラー:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'プロフィールの設定に失敗しました',
      details: error.message
    });
  }
});

// ユーザープロフィール取得API
app.get('/api/user/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'ユーザーIDが必要です'
      });
    }

    // データベースからプロフィールを取得
    const userProfile = await getUserProfile(userId);

    if (userProfile) {
      res.json({
        success: true,
        data: userProfile,
        message: 'プロフィール情報をデータベースから取得しました'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'ユーザープロフィールが見つかりません',
        message: `ユーザーID: ${userId} のプロフィールは登録されていません`
      });
    }

  } catch (error) {
    console.error('プロフィール取得エラー:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'プロフィールの取得に失敗しました',
      details: error.message
    });
  }
});

// 404エラーハンドリング
app.use((req, res) => {
  res.status(404).json({ 
    error: 'エンドポイントが見つかりません' 
  });
});

// 診断用シンプルエンドポイント
app.get('/ping', (req, res) => {
  console.log('🔍 Pingエンドポイントに到達しました');
  res.send('pong');
});

// 会話履歴テスト用API（デバッグ）
app.get('/api/chat/test', (req, res) => {
  console.log('🔍 テストAPIエンドポイントに到達しました');
  res.json({
    success: true,
    message: '会話履歴APIテスト成功',
    timestamp: new Date().toISOString()
  });
});

// 会話履歴取得API（元のバージョン - 一時的にコメントアウト）
/*
app.get('/api/chat/history/:userId', async (req, res) => {
  console.log('🔍 会話履歴APIエンドポイントに到達しました');
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    console.log(`📋 会話履歴取得リクエスト - UserID: ${userId}, Limit: ${limit}`);

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'ユーザーIDが必要です'
      });
    }

    // データベースから会話履歴を取得
    const chatHistory = await getChatHistory(userId, parseInt(limit));
    
    console.log(`📋 会話履歴取得結果 - 件数: ${chatHistory.length}`);

    res.json({
      success: true,
      data: {
        userId,
        history: chatHistory,
        count: chatHistory.length
      },
      message: `${userId}の会話履歴を${chatHistory.length}件取得しました`
    });

  } catch (error) {
    console.error('会話履歴取得エラー:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: '会話履歴の取得に失敗しました',
      details: error.message,
      userId: req.params.userId,
      requestedLimit: req.query.limit
    });
  }
});
*/

// 404エラーハンドリング
app.use((req, res) => {
  console.log(`❌ 404 - エンドポイントが見つかりません: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: 'エンドポイントが見つかりません',
    method: req.method,
    path: req.originalUrl,
    availableEndpoints: [
      'GET /',
      'GET /api/weather/:lat/:lon',
      'POST /api/mascot/chat',
      'POST /api/user/profile', 
      'GET /api/user/profile/:userId',
      'GET /api/chat/history/:userId'
    ]
  });
});

// サーバー起動とデータベース初期化
async function startServer() {
  try {
    // データベースを初期化
    console.log('🔄 データベースを初期化中...');
    await setupDatabase();
    console.log('✅ データベース初期化完了');

    // サーバー起動
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 API documentation: http://localhost:${PORT}`);
      console.log('💾 SQLiteデータベース接続済み');
    });
  } catch (error) {
    console.error('❌ サーバー起動エラー:', error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;