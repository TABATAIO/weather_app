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
    
    // シンプルで自然な会話プロンプト
    let prompt = `あなたは「そらちゃん」という親しみやすい天気アシスタントです。

${normalizedUserName}さんとの自然な会話を心がけてください。

現在の状況：
`;

    // 天気データがある場合は詳細情報を含める
    if (weatherData && weatherData.current) {
      const weather = weatherData.current;
      
      prompt += `
天気情報：
- 現在の天気: ${weather.weather}
- 気温: ${weather.temperature}℃
- 降水量: ${weather.precipitation}mm`;

      if (weather.precipitationProbability || weatherData.today?.precipitationProbability) {
        const precipitationProbability = weatherData.today?.precipitationProbability || weather.precipitationProbability || 0;
        prompt += `\n- 降水確率: ${precipitationProbability}%`;
      }
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

    // 会話履歴がある場合は自然に含める
    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-3); // 最新3件まで
      prompt += `

これまでの会話：`;
      recentHistory.forEach((chat, index) => {
        prompt += `
${normalizedUserName}さん: 「${chat.userMessage}」
そらちゃん: 「${chat.response}」`;
      });
      
      prompt += `

この会話の流れを踏まえて、自然に続く返答をしてください。`;
    }

    prompt += `

${normalizedUserName}さん: 「${userMessage}」

前の会話の文脈を理解し、自然な継続的会話として応答してください。天気について聞かれた場合は上記の天気情報を参考にしてください。

以下のJSONフォーマットで応答してください（JSONのみ）：
{
  "message": "自然で親しみやすく、会話の流れを汲んだ応答メッセージ"
}`;

    console.log('\n🤖 ===== GEMINI API デバック情報 =====');
    console.log('📩送信プロンプト');
    console.log('-'.repeat(40));
    console.log(prompt);
    console.log('-'.repeat(40));
    console.log(`📊プロンプト長: ${prompt.length} 文字`);
    console.log('🤖 ===============================\n');

    // Gemini APIを呼び出し
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    console.log('\n🤖 ===== GEMINI API レスポンス =====');
    console.log('-'.repeat(40));
    console.log(responseText);
    console.log('-'.repeat(40));
    console.log(`📊レスポンス長: ${responseText.length} 文字 \n`);
    
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

    // シンプルな応答形式に変更
    return {
      message: parsedResponse.message || `${normalizedUserName}さん、こんにちは！何かお手伝いできることはありますか？`,
      mood: 'friendly',
      suggestions: [], // シンプルに
      weatherAdvice: null,
      intent: 'general',
      sentiment: 'positive',
      confidence: 0.95
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