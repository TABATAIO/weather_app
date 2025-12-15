const { GoogleGenerativeAI } = require('@google/generative-ai');
const nlpService = require('./nlpService');
const responseGenerator = require('./responseGenerator');

// Gemini API設定
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemma-3-1b-it" }) : null;

/**
 * ユーザー名を正規化する（「さん」の重複を防ぐ）
 */
function normalizeUserName(userName) {
  if (!userName) return 'あなた';
  return userName.replace(/さん$/, '');
}

/**
 * Gemini APIを使用した高度なAI会話レスポンス生成
 */
async function generateChatResponse({ userMessage, userName, weatherData, userPreferences, conversationHistory }) {
  try {
    const normalizedUserName = normalizeUserName(userName);
    
    // Gemini APIが利用できない場合はローカル処理にフォールバック
    if (!model) {
      console.log('Gemini APIが設定されていないため、ローカル処理を使用します');
      return generateLocalChatResponse({ userMessage, userName, weatherData, userPreferences, conversationHistory });
    }
    
    // システムプロンプト - 天気マスコットのペルソナと機能を定義
    let prompt = `あなたは「そらちゃん」という名前の天気マスコットAIです。以下の特徴を持ちます：

【キャラクター設定】
- 明るく親しみやすい性格で、ユーザーの天気や生活に関する相談に乗る
- 日本語で自然に会話し、適度に絵文字を使う（🌞☔🌈等）
- ユーザーの感情に共感し、寄り添うような応答をする
- 専門的すぎず、親しみやすい口調で話す

【主な機能】
1. 天気情報の提供と解説
2. 天気情報に基づく服装アドバイス
3. 天気に応じた活動提案
4. ユーザーの気分や疲労への共感とサポート
5. 日常会話とパーソナライズされた応答

【応答形式】
必ず以下のJSON形式で応答してください（JSON以外は含めない）：
{
  "message": "メイン応答メッセージ",
  "mood": "happy|friendly|caring|excited|sad|worried",
  "suggestions": ["具体的な提案1", "提案2", "提案3"],
  "weatherAdvice": {
    "advice": "天気に関するアドバイス",
    "items": ["おすすめアイテム1", "アイテム2"]
  },
  "intent": "weather_inquiry|weather_clothing|weather_general|fatigue_support|activity_suggestion|appreciation|greeting|farewell|general",
  "sentiment": "positive|negative|neutral"
}

【現在の状況】
ユーザー名: ${normalizedUserName}さん
メッセージ: ${userMessage}
`;

    // 天気データがある場合は詳細情報を含める
    if (weatherData && weatherData.current) {
      const weather = weatherData.current;
      prompt += `
【現在の天気情報】
気温: ${weather.temperature}℃
体感温度: ${weather.feelsLike || weather.temperature}℃
天気: ${weather.weather || 'データなし'}
湿度: ${weather.humidity}%
降水量: ${weather.precipitation}mm
風速: ${weather.windSpeed}m/s
`;
    }

    // ユーザー設定がある場合は含める
    if (userPreferences) {
      prompt += `
【ユーザー設定】
活動設定: ${userPreferences.activities || 'なし'}
スタイル: ${userPreferences.style || 'カジュアル'}
天気感受性: ${userPreferences.weatherSensitivity || '普通'}
`;
    }

    // 会話履歴がある場合は最新の数件を含める
    if (conversationHistory && conversationHistory.length > 0) {
      prompt += `
【最近の会話履歴】
`;
      const recentHistory = conversationHistory.slice(-3);
      recentHistory.forEach((chat, index) => {
        prompt += `${index + 1}. ユーザー: "${chat.userMessage}" → AI: "${chat.response}"\n`;
      });
    }

    // 現在の時間帯を考慮
    const currentHour = new Date().getHours();
    let timeContext = '';
    if (currentHour < 10) timeContext = '朝の時間帯';
    else if (currentHour < 18) timeContext = '昼の時間帯';
    else timeContext = '夜の時間帯';
    
    prompt += `
現在は${timeContext}です。

上記の情報を考慮して、${normalizedUserName}さんに適切な応答をJSON形式で生成してください。`;

    // Gemini APIを呼び出し
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // JSON部分を抽出
    let jsonString = responseText;
    if (responseText.includes('```json')) {
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1];
      }
    } else if (responseText.includes('{')) {
      // JSONの開始位置を探す
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}') + 1;
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        jsonString = responseText.substring(jsonStart, jsonEnd);
      }
    }

    const parsedResponse = JSON.parse(jsonString);

    // 安全チェック - 必須フィールドの補完
    return {
      message: parsedResponse.message || `${normalizedUserName}さん、こんにちは！何かお手伝いできることはありますか？`,
      mood: parsedResponse.mood || 'friendly',
      suggestions: parsedResponse.suggestions || [],
      weatherAdvice: parsedResponse.weatherAdvice || null,
      intent: parsedResponse.intent || 'general',
      sentiment: parsedResponse.sentiment || 'neutral',
      confidence: 0.95 // Gemini APIなので高い信頼度
    };

  } catch (error) {
    console.error('Gemini API呼び出しエラー:', error.message);
    
    // フォールバック - エラー時はローカル処理を使用
    console.log('Gemini APIエラーのため、ローカル処理にフォールバックします');
    return generateLocalChatResponse({ userMessage, userName, weatherData, userPreferences, conversationHistory });
  }
}

/**
 * ローカル処理版のチャット応答生成（フォールバック用）
 */
function generateLocalChatResponse({ userMessage, userName, weatherData, userPreferences, conversationHistory }) {
  const message = userMessage.toLowerCase();
  const normalizedUserName = normalizeUserName(userName);
  
  // 自然言語解析
  const sentiment = nlpService.analyzeSentiment(userMessage);
  const intent = nlpService.analyzeIntent(message);
  const entities = nlpService.extractEntities(userMessage);

  // 高度な自然言語処理を使用した応答生成
  const advancedResponse = responseGenerator.generateAdvancedResponse(
    userMessage, intent, sentiment, entities, normalizedUserName, weatherData, userPreferences
  );

  return {
    message: advancedResponse.response,
    mood: advancedResponse.mood,
    suggestions: advancedResponse.suggestions || [],
    weatherAdvice: advancedResponse.weatherAdvice,
    intent: intent,
    sentiment: sentiment,
    confidence: 0.7 // ローカル処理なので中程度の信頼度
  };
}

/**
 * チャット履歴APIハンドラー
 * @param {Object} options - 要求オプション
 * @param {string} options.userId - ユーザーID
 * @param {number} options.limit - 取得件数
 * @param {Function} options.getChatHistory - DBから履歴を取得する関数
 * @returns {Object} APIレスポンス
 */
async function handleChatHistoryAPI({ userId, limit = 10, getChatHistory }) {
  console.log(`📋 会話履歴取得リクエスト - UserID: ${userId}, Limit: ${limit}`);

  if (!userId) {
    return {
      success: false,
      error: 'ユーザーIDが必要です',
      status: 400
    };
  }

  try {
    // データベースから会話履歴を取得
    const chatHistory = await getChatHistory(userId, parseInt(limit));
    
    console.log(`📋 会話履歴取得結果 - 件数: ${chatHistory.length}`);

    return {
      success: true,
      data: {
        userId,
        history: chatHistory,
        count: chatHistory.length
      },
      message: `${userId}の会話履歴を${chatHistory.length}件取得しました`,
      status: 200
    };

  } catch (error) {
    console.error('会話履歴取得エラー:', error.message);
    console.error('Error stack:', error.stack);
    return {
      success: false,
      error: '会話履歴の取得に失敗しました',
      details: error.message,
      status: 500
    };
  }
}

/**
 * チャットAPIハンドラー
 * @param {Object} options - 要求オプション
 * @param {Object} options.requestBody - リクエストボディ
 * @param {Function} options.saveChatHistory - DBに履歴を保存する関数
 * @returns {Object} APIレスポンス
 */
async function handleChatAPI({ requestBody, saveChatHistory }) {
  try {
    const { 
      message, 
      userName, 
      userId,
      weatherData, 
      userPreferences = {},
      conversationHistory = []
    } = requestBody;

    if (!message || message.trim() === '') {
      return {
        success: false,
        error: 'メッセージが入力されていません',
        status: 400
      };
    }

    // AI会話レスポンス生成（Gemini API使用）
    const chatResponse = await generateChatResponse({
      userMessage: message.trim(),
      userName: userName || 'あなた',
      weatherData,
      userPreferences,
      conversationHistory
    });

    // 会話履歴をデータベースに保存（userIdがある場合のみ）
    if (userId && saveChatHistory) {
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

    return {
      success: true,
      data: {
        response: chatResponse.message,
        mood: chatResponse.mood,
        suggestions: chatResponse.suggestions,
        weatherAdvice: chatResponse.weatherAdvice,
        timestamp: new Date().toISOString()
      },
      status: 200
    };

  } catch (error) {
    console.error('AI会話エラー:', error.message);
    return {
      success: false,
      error: 'メッセージの処理に失敗しました',
      details: error.message,
      status: 500
    };
  }
}

module.exports = {
  generateChatResponse,
  normalizeUserName,
  handleChatAPI,
  handleChatHistoryAPI
};