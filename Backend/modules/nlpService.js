const nlp = require('compromise');

/**
 * テキストの感情分析を行う（ローカル実装）
 * @param {string} text - 分析対象のテキスト
 * @returns {string} 感情の種類（positive, negative, neutral）
 */
function analyzeSentiment(text) {
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

/**
 * ユーザーのメッセージからインテント（意図）を分析する
 * @param {string} message - ユーザーの入力メッセージ
 * @returns {string} 検出されたインテント
 */
function analyzeIntent(message) {
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
  
  // 天気情報問い合わせ（高優先）
  const weatherInquiryPatterns = [
    /天気.*[？?]/, /今日.*天気/, /天気.*どう/, /天気.*教えて/, 
    /天気.*知りたい/, /天気.*分かる/, /外.*天気/, /天候.*どう/
  ];
  const weatherInquiryKeywords = ['天気は', '天気教えて', '天気どう', '今日の天気'];
  
  if (weatherInquiryPatterns.some(pattern => pattern.test(message)) ||
      weatherInquiryKeywords.some(keyword => message.includes(keyword))) {
    return 'weather_inquiry';
  }
  
  // 服装相談（天気情報問い合わせの次の優先度）
  const clothingKeywords = [
    '服', '着る', '洋服', 'ファッション', 'コーデ', 
    '何着る', '服装', '何を着', '着れば', '服選び'
  ];
  const clothingPatterns = [
    /何.*着/, /服.*選/, /コーデ/, /ファッション/, /着こなし/
  ];
  
  if (clothingKeywords.some(keyword => message.includes(keyword)) ||
      clothingPatterns.some(pattern => pattern.test(message))) {
    return 'weather_clothing';
  }
  
  // 一般的な天気関連（温度や状況について）
  const generalWeatherKeywords = [
    '気温', '寒い', '暑い', '涼しい', '暖かい', 
    '雨', '晴れ', '曇り', '雪', '風', '湿度', '気候'
  ];
  
  if (generalWeatherKeywords.some(keyword => message.includes(keyword))) {
    return 'weather_general';
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
    return 'question';
  }
  
  return 'general';
}

/**
 * エンティティ抽出（簡易版）
 * @param {string} text - 分析対象のテキスト
 * @returns {Object} 抽出されたエンティティ情報
 */
function extractEntities(text) {
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
    const doc = nlp(text);
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

/**
 * 音声入力対応のテキスト正規化
 * @param {string} text - 正規化対象のテキスト
 * @returns {string} 正規化されたテキスト
 */
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

module.exports = {
  analyzeSentiment,
  analyzeIntent,
  extractEntities,
  normalizeForSpeech
};