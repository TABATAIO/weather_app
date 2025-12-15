const { analyzeSentiment, normalizeForSpeech } = require('./nlpService');

/**
 * Response Generator Module
 * 様々な種類の応答生成機能を統合管理するモジュール
 */

/**
 * 現在の天気情報に基づいて天気レスポンスを生成する
 * @param {Object} currentWeather - 現在の天気データ（temperature, weather, humidity, windSpeed）
 * @param {string} userName - ユーザー名
 * @returns {string} 天気情報の応答メッセージ
 */
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

/**
 * 天気に応じた提案を生成する
 * @param {Object} currentWeather - 現在の天気情報
 * @returns {Array} 提案リスト
 */
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
 * 天気情報に基づいた簡単なコメントを生成する
 * @param {Object} currentWeather - 現在の天気情報
 * @returns {string} 簡潔な天気コメント
 */
function getWeatherComment(currentWeather) {
  const { weather, temperature } = currentWeather;
  
  switch (weather?.toLowerCase()) {
    case 'sunny':
      return temperature > 30 ? 
        'とても暑いですね！熱中症に気をつけてくださいね🌞' :
        'いい天気ですね☀️';
    case 'rainy':
      return '雨模様ですね☔ 濡れないようにお気をつけください';
    case 'cloudy':
      return '曇り空ですが過ごしやすそうですね☁️';
    case 'snow':
      return '雪ですね❄️ 足元にお気をつけください';
    default:
      return '今日もよい一日をお過ごしください！';
  }
}

/**
 * 高度な応答を統合的に生成する（メイン関数）
 * @param {string} userMessage - ユーザーメッセージ
 * @param {string} intent - 分析された意図
 * @param {string} sentiment - 感情分析結果
 * @param {Object} entities - 抽出されたエンティティ
 * @param {string} userName - ユーザー名
 * @param {Object} weatherData - 天気データ
 * @param {Object} userPreferences - ユーザー設定
 * @returns {Object} 生成された応答オブジェクト（response, mood, suggestions, weatherAdvice）
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
      
    case 'weather_inquiry':
      if (weatherData && weatherData.current) {
        response = generateWeatherResponse(weatherData.current, userName);
        suggestions = getWeatherSuggestions(weatherData.current);
        mood = weatherData.current.weather === 'sunny' ? 'happy' : 'friendly';
      } else {
        response = `${userName}さん、天気情報をお調べしますね！現在の位置情報があれば詳しい天気をお教えできますが、天気データの取得ボタンを押していただけますか？🌤️`;
        suggestions = ['天気データを取得', '位置情報を許可', '手動で地域を入力'];
      }
      break;
      
    case 'weather_clothing':
      if (weatherData && weatherData.current) {
        weatherAdvice = generateClothingAdvice(weatherData.current);
        response = generateWeatherClothingResponse(userName, weatherData.current, weatherAdvice, sentiment);
        suggestions = weatherAdvice.items;
      } else {
        response = `${userName}さん、服装アドバイスをしたいのですが、今日の天気情報があるともっと具体的にお話しできます！先に天気データを取得してみてくださいね👔`;
        suggestions = ['天気データを取得', '一般的な服装のコツ'];
      }
      break;
      
    case 'weather_general':
      if (weatherData && weatherData.current) {
        response = generateWeatherResponse(weatherData.current, userName);
        suggestions = getWeatherSuggestions(weatherData.current);
      } else {
        response = `${userName}さん、お天気のことですね！☁️ 天気によって一日の気分も変わりますよね。現在の天気情報があれば、詳しくお教えできますよ`;
        suggestions = ['天気データを取得', '天気について相談'];
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
      response = generateQuestionResponse(userMessage, userName, weatherData, sentiment);
      break;
      
    case 'general':
      response = generatePersonalizedResponse(userMessage, userName, userPreferences);
      break;
      
    default:
      if (userMessage.includes('天気') || userMessage.includes('気温')) {
        response = generateWeatherResponseWithoutData(userName, userMessage, sentiment);
        suggestions = ['天気データを取得', '位置情報を共有'];
      } else {
        response = generatePersonalizedResponse(userMessage, userName, userPreferences);
      }
  }
  
  return {
    response,
    mood,
    suggestions,
    weatherAdvice
  };
}

/**
 * 時間に応じた挨拶を生成する
 * @param {string} userName - ユーザー名
 * @param {Object} weatherData - 天気データ
 * @param {string} sentiment - ユーザーの感情状態
 * @returns {string} コンテキストに応じた挨拶メッセージ
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

/**
 * パーソナライズされた一般会話レスポンス
 * @param {string} message - ユーザーメッセージ
 * @param {string} userName - ユーザー名
 * @param {Object} userPreferences - ユーザー設定
 * @returns {string} パーソナライズされた応答
 */
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

/**
 * 天気データがない場合の応答を生成する
 * @param {string} userName - ユーザー名
 * @param {string} message - ユーザーメッセージ
 * @param {string} sentiment - 感情分析結果
 * @returns {string} 天気データなしでの応答
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

/**
 * お別れの挨拶メッセージを生成する
 * @param {string} userName - ユーザー名
 * @param {string} sentiment - ユーザーの感情状態
 * @returns {string} お別れの挨拶メッセージ
 */
function generateFarewellResponse(userName, sentiment) {
  const farewellMessages = [
    `${userName}さん、またお話しできるのを楽しみにしています！`,
    `${userName}さん、お疲れさまでした。よい一日をお過ごしください！`,
    `${userName}さん、また今度お話しましょうね♪`,
    `${userName}さん、ありがとうございました！気をつけてくださいね`
  ];
  
  if (sentiment === 'negative') {
    return `${userName}さん、お疲れのようですね。ゆっくり休んでくださいね。また元気な時にお話ししましょう✨`;
  }
  
  return farewellMessages[Math.floor(Math.random() * farewellMessages.length)];
}

module.exports = {
  generateAdvancedResponse,
  generateWeatherResponse,
  generateClothingAdvice,
  getWeatherSuggestions,
  getWeatherComment,
  generateContextualGreeting,
  generateWeatherClothingResponse,
  generateActivityResponse,
  generateQuestionResponse,
  generateNoWeatherDataResponse,
  generateFatigueResponse,
  generatePersonalizedActivitySuggestions,
  generatePersonalizedResponse,
  generateWeatherResponseWithoutData,
  generateFarewellResponse
};