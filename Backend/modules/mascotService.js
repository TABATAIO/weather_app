/**
 * Mascot Service Module
 * マスコット関連の機能を統合管理するモジュール
 * - マスコット状態計算
 * - 天気リアクション生成
 * - おすすめ行動提案
 * - 天気コード変換
 */

/**
 * 天気コードから日本語天気名を取得
 * @param {number} weatherCode - Weathernews天気コード
 * @returns {string} 日本語の天気名
 */
function getWeatherName(weatherCode) {
  const weatherCodes = {
    100: '晴れ', 101: '晴れ時々くもり', 102: '晴れ一時雨', 103: '晴れ時々雨',
    104: '晴れ一時雪', 105: '晴れ時々雪', 106: '晴れ一時雨か雪', 107: '晴れ時々雨か雪',
    108: '晴れ一時雨か雷雨', 110: '晴れのち時々くもり', 111: '晴れのちくもり', 112: '晴れのち一時雨',
    113: '晴れのち時々雨', 114: '晴れのち雨', 115: '晴れのち一時雪', 116: '晴れのち時々雪',
    117: '晴れのち雪', 118: '晴れのち雨か雪', 119: '晴れのち雨か雷雨', 120: '晴れ朝夕一時雨',
    121: '晴れ朝の内一時雨', 122: '晴れ夕方一時雨', 123: '晴れ山沿い雷雨', 124: '晴れ山沿い雪',
    125: '晴れ午後は雷雨', 126: '晴れ昼頃から雨', 127: '晴れ夕方から雨', 128: '晴れ夜は雨',
    129: '晴れ夜半から雨', 130: '朝の内霧のち晴れ', 131: '晴れ朝方霧', 132: '晴れ朝夕くもり',
    140: '晴れ時々雨で雷を伴う', 160: '晴れ一時雪か雨', 170: '晴れ時々雪か雨', 181: '晴れのち雪か雨',
    
    200: 'くもり', 201: 'くもり時々晴れ', 202: 'くもり一時雨', 203: 'くもり時々雨',
    204: 'くもり一時雪', 205: 'くもり時々雪', 206: 'くもり一時雨か雪', 207: 'くもり時々雨か雪',
    208: 'くもり一時雨か雷雨', 209: '霧', 210: 'くもりのち時々晴れ', 211: 'くもりのち晴れ',
    212: 'くもりのち一時雨', 213: 'くもりのち時々雨', 214: 'くもりのち雨', 215: 'くもりのち一時雪',
    216: 'くもりのち時々雪', 217: 'くもりのち雪', 218: 'くもりのち雨か雪', 219: 'くもりのち雨か雷雨',
    220: 'くもり朝夕一時雨', 221: 'くもり朝の内一時雨', 222: 'くもり夕方一時雨', 223: 'くもり日中時々晴れ',
    224: 'くもり昼頃から雨', 225: 'くもり夕方から雨', 226: 'くもり夜は雨', 227: 'くもり夜半から雨',
    228: 'くもり昼頃から雪', 229: 'くもり夕方から雪', 230: 'くもり夜は雪', 231: 'くもり海上海岸は霧か霧雨',
    240: 'くもり時々雨で雷を伴う', 250: 'くもり時々雪で雷を伴う', 260: 'くもり一時雪か雨', 270: 'くもり時々雪か雨',
    281: 'くもりのち雪か雨',
    
    300: '雨', 301: '雨時々晴れ', 302: '雨時々止む', 303: '雨時々雪', 304: '雨か雪',
    306: '大雨', 308: '雨で暴風を伴う', 309: '雨一時雪', 311: '雨のち晴れ', 313: '雨のちくもり',
    314: '雨のち時々雪', 315: '雨のち雪', 316: '雨か雪のち晴れ', 317: '雨か雪のちくもり',
    320: '朝の内雨のち晴れ', 321: '朝の内雨のちくもり', 322: '雨朝晩一時雪', 323: '雨昼頃から晴れ',
    324: '雨夕方から晴れ', 325: '雨夜は晴れ', 326: '雨夕方から雪', 327: '雨夜は雪',
    328: '雨一時強く降る', 329: '雨一時みぞれ', 340: '雪か雨', 350: '雨で雷を伴う',
    361: '雪か雨のち晴れ', 371: '雪か雨のちくもり',
    
    400: '雪', 401: '雪時々晴れ', 402: '雪時々止む', 403: '雪時々雨', 405: '大雪',
    406: '風雪強い', 407: '暴風雪', 409: '雪一時雨', 411: '雪のち晴れ', 413: '雪のちくもり',
    414: '雪のち雨', 420: '朝の内雪のち晴れ', 421: '朝の内雪のちくもり', 422: '雪昼頃から雨',
    423: '雪夕方から雨', 424: '雪夜半から雨', 425: '雪一時強く降る', 426: '雪のちみぞれ',
    427: '雪一時みぞれ', 430: 'みぞれ', 450: '雪で雷を伴う',
    
    500: '快晴', 550: '猛暑', 552: '猛暑時々曇り', 553: '猛暑時々雨', 558: '猛暑時々大雨・嵐',
    562: '猛暑のち曇り', 563: '猛暑のち雨', 568: '猛暑のち大雨・嵐', 572: '曇り時々猛暑',
    573: '雨時々猛暑', 582: '曇りのち猛暑', 583: '雨のち猛暑',
    
    600: 'うすぐもり', 650: '小雨', 800: '雷', 850: '大雨・嵐', 851: '大雨・嵐時々晴れ',
    852: '大雨・嵐時々曇り', 853: '大雨・嵐時々雨', 854: '大雨・嵐時々雪', 855: '大雨・嵐時々猛暑',
    859: '大雨・嵐一時大雪', 861: '大雨・嵐のち晴れ', 862: '大雨・嵐のち曇り', 863: '大雨・嵐のち雨',
    864: '大雨・嵐のち雪', 865: '大雨・嵐のち猛暑', 869: '大雨・嵐のち大雪', 871: '晴れ時々大雨・嵐',
    872: '曇り時々大雨・嵐', 873: '雨時々大雨・嵐', 874: '雪時々大雨・嵐', 881: '晴れのち大雨・嵐',
    882: '曇りのち大雨・嵐', 883: '雨のち大雨・嵐', 884: '雪のち大雨・嵐',
    
    950: '大雪', 951: '大雪時々晴れ', 952: '大雪時々曇', 953: '大雪一時雨', 954: '大雪時々雪',
    958: '大雪一時大雨', 961: '大雪のち晴れ', 962: '大雪のち曇', 963: '大雪のち雨',
    964: '大雪のち雪', 968: '大雪のち大雨・嵐', 971: '晴れ一時大雪', 972: '曇一時大雪',
    973: '雨一時大雪', 974: '雪一時大雪', 981: '晴れのち大雪', 982: '曇のち大雪',
    983: '雨のち大雪', 984: '雪のち大雪', 999: 'データなし'
  };
  
  return weatherCodes[weatherCode] || `天気コード${weatherCode}`;
}

/**
 * 天気アイコンURL生成関数
 * @param {number} weatherCode - 天気コード
 * @returns {string} アイコンURL
 */
function getWeatherIcon(weatherCode) {
  return `https://tpf.weathernews.jp/wxicon/152/${weatherCode}.png`;
}

/**
 * 風向変換関数
 * @param {number} windDirectionCode - 風向コード(1-16)
 * @returns {string} 風向（N, NE, E等）
 */
function getWindDirection(windDirectionCode) {
  const windDirections = {
    1: 'NNE', 2: 'NE', 3: 'ENE', 4: 'E', 5: 'ESE', 6: 'SE', 7: 'SSE', 8: 'S',
    9: 'SSW', 10: 'SW', 11: 'WSW', 12: 'W', 13: 'WNW', 14: 'NW', 15: 'NNW', 16: 'N'
  };
  
  return windDirections[windDirectionCode] || '不明';
}

/**
 * 天気コードからカテゴリーを取得
 * @param {number} weatherCode - 天気コード
 * @returns {string} 天気カテゴリー（sunny/cloudy/rainy/snowy等）
 */
function getWeatherCategory(weatherCode) {
  if (weatherCode >= 100 && weatherCode < 200) {
    return 'sunny'; // 晴れ系
  } else if (weatherCode >= 200 && weatherCode < 300) {
    return 'cloudy'; // 曇り系
  } else if (weatherCode >= 300 && weatherCode < 400) {
    return 'rainy'; // 雨系
  } else if (weatherCode >= 400 && weatherCode < 500) {
    return 'snowy'; // 雪系
  } else if (weatherCode >= 500 && weatherCode < 600) {
    return 'foggy'; // 霧系
  } else if (weatherCode >= 600 && weatherCode < 700) {
    return 'clear_night'; // 夜間晴れ系
  } else if (weatherCode >= 700 && weatherCode < 800) {
    return 'cloudy_night'; // 夜間曇り系
  } else if (weatherCode >= 800 && weatherCode < 900) {
    return 'storm'; // 嵐・強風系
  } else if (weatherCode >= 900 && weatherCode < 1000) {
    return 'severe'; // 警報・注意報系
  } else {
    return 'unknown';
  }
}

/**
 * マスコット状態計算関数（天気データに基づいて感情・エネルギー・快適度を算出）
 * @param {Object} weatherData - 天気データオブジェクト
 * @param {number} weatherData.weatherCode - 天気コード
 * @param {number} weatherData.temperature - 気温（℃）
 * @param {number} weatherData.humidity - 湿度（%）
 * @param {number} weatherData.precipitation - 降水量（mm）
 * @param {number} weatherData.windSpeed - 風速（m/s）
 * @param {number} weatherData.pressure - 気圧（hPa）
 * @returns {Object} マスコット状態オブジェクト
 */
function calculateMascotState(weatherData) {
  const {
    weatherCode,
    temperature,
    humidity,
    precipitation,
    windSpeed,
    pressure
  } = weatherData;

  let mood = 'neutral';
  let energy = 50;
  let happiness = 50;
  let comfort = 50;

  // 天気コードによる基本状態変化
  if (weatherCode >= 100 && weatherCode < 200) {
    // 晴れ系
    mood = 'happy';
    energy += 25;
    happiness += 35;
    
    if (weatherCode >= 500 && weatherCode <= 583) {
      // 猛暑系
      mood = 'hot';
      energy -= 10;
      comfort -= 20;
    }
  } else if (weatherCode >= 200 && weatherCode < 300) {
    // 曇り系
    mood = 'calm';
    energy += 5;
    happiness += 5;
    
    if (weatherCode === 209) {
      // 霧
      mood = 'mysterious';
      comfort -= 5;
    }
  } else if (weatherCode >= 300 && weatherCode < 400) {
    // 雨系
    mood = 'sad';
    energy -= 15;
    happiness -= 25;
    
    if (weatherCode === 306 || (weatherCode >= 850 && weatherCode <= 884)) {
      // 大雨・嵐
      mood = 'worried';
      energy -= 25;
      happiness -= 35;
      comfort -= 30;
    }
  } else if (weatherCode >= 400 && weatherCode < 500) {
    // 雪系
    mood = 'excited';
    energy += 15;
    happiness += 20;
    
    if (weatherCode === 405 || (weatherCode >= 950 && weatherCode <= 984)) {
      // 大雪
      mood = 'amazed';
      energy += 10;
      comfort -= 15;
    }
  } else if (weatherCode === 800) {
    // 雷
    mood = 'surprised';
    energy += 10;
    happiness -= 10;
    comfort -= 20;
  }

  // 気温による調整（欠測値-9999を考慮）
  if (temperature !== -9999) {
    if (temperature < 0) {
      energy -= 20;
      comfort -= 30;
      mood = 'freezing';
    } else if (temperature < 10) {
      energy -= 10;
      comfort -= 15;
      if (mood === 'neutral') mood = 'cold';
    } else if (temperature > 35) {
      energy -= 15;
      comfort -= 25;
      mood = 'hot';
    } else if (temperature > 28) {
      energy -= 5;
      comfort -= 10;
    }
  }

  // 湿度による調整（欠測値-99を考慮）
  if (humidity !== -99) {
    if (humidity > 80) {
      comfort -= 20;
      energy -= 10;
    } else if (humidity < 30) {
      comfort -= 10;
    }
  }

  // 降水量による調整（欠測値-9999を考慮）
  if (precipitation !== -9999) {
    if (precipitation > 10) {
      happiness -= 15;
      energy -= 10;
    } else if (precipitation > 0) {
      happiness -= 5;
    }
  }

  // 風速による調整（欠測値-9999を考慮）
  if (windSpeed !== -9999) {
    if (windSpeed > 10) {
      energy -= 5;
      comfort -= 10;
    } else if (windSpeed > 5) {
      energy += 5; // 適度な風は気持ちいい
    }
  }

  // 気圧による調整（欠測値-9999を考慮）
  if (pressure !== -9999) {
    if (pressure < 1000) {
      comfort -= 10; // 低気圧で体調不良
    } else if (pressure > 1025) {
      comfort += 5; // 高気圧で快適
    }
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

/**
 * 天気リアクション取得関数（マスコットの天気に対するコメント生成）
 * @param {Object} weatherData - 天気データ
 * @returns {string} ランダムに選ばれた天気リアクション
 */
function getWeatherReaction(weatherData) {
  const { weatherCode, temperature, precipitation, windSpeed, pressure } = weatherData;
  
  let reactions = [];
  
  // 天気コード別リアクション
  if (weatherCode >= 100 && weatherCode < 200) {
    // 晴れ系
    reactions = [
      '今日はいい天気だね！☀️',
      'お散歩日和だよ♪',
      '太陽が気持ちいい～',
      '洗濯物がよく乾きそう！',
      '青空がきれいだね！'
    ];
    
    if (weatherCode >= 550 && weatherCode <= 583) {
      // 猛暑
      reactions = [
        'わー！今日は猛暑だね🔥',
        '暑すぎる～！冷房の下にいよう',
        'アイスが食べたくなる暑さ🍦',
        '熱中症に気をつけて！'
      ];
    }
  } else if (weatherCode >= 200 && weatherCode < 300) {
    // 曇り系
    reactions = [
      '曇り空も悪くないね☁️',
      'ちょっと涼しいかな',
      'のんびりした天気だね',
      '過ごしやすい気温だね'
    ];
    
    if (weatherCode === 209) {
      reactions = ['霧がかかって幻想的だね🌫️', '視界が悪いから気をつけて'];
    }
  } else if (weatherCode >= 300 && weatherCode < 400) {
    // 雨系
    reactions = [
      '雨の音って落ち着くよね☔',
      '傘を忘れずにね！',
      '雨上がりが楽しみ',
      'お家でのんびりしよう'
    ];
    
    if (weatherCode === 306 || (weatherCode >= 850 && weatherCode <= 884)) {
      reactions = [
        '大雨だね！外出は控えめに☔',
        '嵐みたい...安全な場所にいてね',
        'すごい雨だ！窓から見てるだけにしよう'
      ];
    }
  } else if (weatherCode >= 400 && weatherCode < 500) {
    // 雪系
    reactions = [
      '雪だ！雪だ！❄️',
      '雪遊びしたいな～',
      '真っ白できれい！',
      '雪だるま作ろう⛄'
    ];
    
    if (weatherCode === 405 || (weatherCode >= 950 && weatherCode <= 984)) {
      reactions = [
        'すごい雪だね！❄️❄️',
        '大雪だから外出注意だよ',
        '雪かきが大変そう...'
      ];
    }
  } else if (weatherCode === 800) {
    // 雷
    reactions = [
      'ゴロゴロ～雷が鳴ってる⚡',
      '雷雲が近づいてるね',
      '雷は怖いけどちょっと迫力があるね'
    ];
  } else {
    reactions = ['今日も一日がんばろう！', '天気をチェックして準備しようね'];
  }
  
  // 特殊条件での追加リアクション
  if (temperature !== -9999) {
    if (temperature > 30) {
      reactions.push('暑いから水分補給を忘れずに！🥤');
    } else if (temperature < 5) {
      reactions.push('寒いから暖かくしてね🧣');
    }
  }
  
  if (precipitation !== -9999 && precipitation > 5) {
    reactions.push('雨が強いから気をつけてね！');
  }
  
  if (windSpeed !== -9999 && windSpeed > 8) {
    reactions.push('風が強いから飛ばされないように！💨');
  }
  
  if (pressure !== -9999 && pressure < 990) {
    reactions.push('気圧が低いから体調管理に注意してね');
  }
  
  return reactions[Math.floor(Math.random() * reactions.length)];
}

/**
 * おすすめ行動取得関数（天気に応じた行動・服装・持ち物のアドバイス生成）
 * @param {Object} weatherData - 天気データ
 * @returns {Array<string>} おすすめ行動のリスト
 */
function getRecommendations(weatherData) {
  const { weatherCode, temperature, precipitation, windSpeed, pressure } = weatherData;
  const recommendations = [];
  
  // 服装アドバイス（温度基準）
  if (temperature !== -9999) {
    if (temperature > 25) {
      recommendations.push('軽装で涼しく過ごそう');
    } else if (temperature < 15) {
      recommendations.push('暖かい服装がおすすめ');
    } else if (temperature > 30) {
      recommendations.push('熱中症対策の服装を');
    } else if (temperature < 5) {
      recommendations.push('防寒対策をしっかりと');
    }
  }
  
  // 持ち物アドバイス
  if (precipitation !== -9999 && precipitation > 0) {
    recommendations.push('傘を持参しよう');
    if (precipitation > 10) {
      recommendations.push('レインコートもあると安心');
    }
  }
  
  // 天気コード別のアドバイス
  if (weatherCode >= 100 && weatherCode < 200) {
    // 晴れ系
    recommendations.push('日焼け止めと帽子を忘れずに');
    if (weatherCode >= 550 && weatherCode <= 583) {
      recommendations.push('こまめな水分補給を');
      recommendations.push('涼しい場所で過ごそう');
    }
  } else if (weatherCode >= 300 && weatherCode < 400) {
    // 雨系
    recommendations.push('室内活動がおすすめ');
    if (weatherCode === 306 || (weatherCode >= 850 && weatherCode <= 884)) {
      recommendations.push('外出は控えめに');
      recommendations.push('安全な場所で待機');
    }
  } else if (weatherCode >= 400 && weatherCode < 500) {
    // 雪系
    recommendations.push('滑りにくい靴を選ぼう');
    recommendations.push('防寒具を忘れずに');
    if (weatherCode === 405 || (weatherCode >= 950 && weatherCode <= 984)) {
      recommendations.push('不要不急の外出は控えよう');
    }
  }
  
  // 風速によるアドバイス
  if (windSpeed !== -9999 && windSpeed > 8) {
    recommendations.push('風に飛ばされやすいものに注意');
    if (windSpeed > 15) {
      recommendations.push('強風のため外出注意');
    }
  }
  
  // 気圧によるアドバイス
  if (pressure !== -9999 && pressure < 1000) {
    recommendations.push('体調管理に注意しよう');
  }
  
  // 活動アドバイス
  if (weatherCode >= 100 && weatherCode < 200 && temperature !== -9999 && temperature < 25) {
    recommendations.push('お出かけに最適な天気');
  } else if (weatherCode >= 300 && weatherCode < 400) {
    recommendations.push('読書や映画鑑賞はいかが？');
  } else if (weatherCode >= 400 && weatherCode < 500) {
    recommendations.push('雪景色を楽しもう');
  }
  
  return recommendations;
}

/**
 * マスコット情報生成関数（基本的なマスコットプロフィール）
 * @param {string} mascotId - マスコットID
 * @returns {Object} マスコット情報オブジェクト
 */
function generateMascotInfo(mascotId) {
  return {
    id: mascotId,
    name: 'ウェザーちゃん',
    level: 5,
    experience: 150,
    mood: 'happy',
    lastUpdate: new Date().toISOString(),
    personality: {
      cheerful: 85,
      helpful: 90,
      curious: 75,
      empathetic: 80
    },
    favorites: [
      '晴れの日',
      'お散歩',
      '虹を見ること',
      '雲の形観察'
    ]
  };
}

/**
 * 天気情報オブジェクト生成関数（アイコン・カテゴリー情報付き）
 * @param {number} weatherCode - 天気コード
 * @returns {Object} 天気情報オブジェクト
 */
function generateWeatherInfo(weatherCode) {
  return {
    code: weatherCode,
    name: getWeatherName(weatherCode),
    icon: getWeatherIcon(weatherCode),
    category: getWeatherCategory(weatherCode),
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  // 天気コード関連
  getWeatherName,
  getWeatherIcon,
  getWindDirection,
  getWeatherCategory,
  generateWeatherInfo,
  
  // マスコット状態管理
  calculateMascotState,
  getWeatherReaction,
  getRecommendations,
  generateMascotInfo
};