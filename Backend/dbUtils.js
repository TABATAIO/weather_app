const { setupDatabase } = require('./database');

let db = null;

/**
 * データベース接続を取得する
 * @returns {Promise<sqlite3.Database>} データベース接続
 */
async function getDatabase() {
  if (!db) {
    db = await setupDatabase();
  }
  return db;
}

/**
 * ユーザープロフィールを保存する
 * @param {Object} userProfile - ユーザープロフィール情報
 * @returns {Promise<Object>} 保存結果
 */
async function saveUserProfile(userProfile) {
  const database = await getDatabase();
  
  return new Promise((resolve, reject) => {
    const {
      userId,
      userName,
      preferences = {},
      favoriteActivities = []
    } = userProfile;

    const sql = `
      INSERT OR REPLACE INTO user_profiles (
        user_id, user_name, temperature_preference, activity_preference,
        style_preference, weather_sensitivity, favorite_activities, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;

    const params = [
      userId,
      userName,
      preferences.temperature || 'moderate',
      preferences.activities || 'both',
      preferences.style || 'casual',
      preferences.weatherSensitivity || 'normal',
      JSON.stringify(favoriteActivities)
    ];

    database.run(sql, params, function(err) {
      if (err) {
        console.error('ユーザープロフィール保存エラー:', err.message);
        reject(err);
      } else {
        resolve({
          success: true,
          userId: userId,
          changes: this.changes
        });
      }
    });
  });
}

/**
 * ユーザープロフィールを取得する
 * @param {string} userId - ユーザーID
 * @returns {Promise<Object>} ユーザープロフィール
 */
async function getUserProfile(userId) {
  const database = await getDatabase();
  
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT * FROM user_profiles WHERE user_id = ?
    `;

    database.get(sql, [userId], (err, row) => {
      if (err) {
        console.error('ユーザープロフィール取得エラー:', err.message);
        reject(err);
      } else if (row) {
        // JSONフィールドをパース
        const profile = {
          ...row,
          favorite_activities: row.favorite_activities ? JSON.parse(row.favorite_activities) : [],
          preferences: {
            temperature: row.temperature_preference,
            activities: row.activity_preference,
            style: row.style_preference,
            weatherSensitivity: row.weather_sensitivity
          }
        };
        resolve(profile);
      } else {
        resolve(null); // ユーザーが見つからない
      }
    });
  });
}

/**
 * 会話履歴を保存する
 * @param {Object} chatData - 会話データ
 * @returns {Promise<Object>} 保存結果
 */
async function saveChatHistory(chatData) {
  const database = await getDatabase();
  
  return new Promise((resolve, reject) => {
    const {
      userId,
      userMessage,
      botResponse,
      intent,
      sentiment,
      weatherData
    } = chatData;

    const sql = `
      INSERT INTO chat_history (
        user_id, user_message, bot_response, intent, sentiment, weather_data
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
      userId,
      userMessage,
      botResponse,
      intent,
      sentiment,
      weatherData ? JSON.stringify(weatherData) : null
    ];

    database.run(sql, params, function(err) {
      if (err) {
        console.error('会話履歴保存エラー:', err.message);
        reject(err);
      } else {
        resolve({
          success: true,
          id: this.lastID,
          changes: this.changes
        });
      }
    });
  });
}

/**
 * ユーザーの会話履歴を取得する
 * @param {string} userId - ユーザーID
 * @param {number} limit - 取得件数制限
 * @returns {Promise<Array>} 会話履歴の配列
 */
async function getChatHistory(userId, limit = 10) {
  const database = await getDatabase();
  
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT * FROM chat_history 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `;

    database.all(sql, [userId, limit], (err, rows) => {
      if (err) {
        console.error('会話履歴取得エラー:', err.message);
        reject(err);
      } else {
        // JSONフィールドをパース
        const history = rows.map(row => ({
          ...row,
          weather_data: row.weather_data ? JSON.parse(row.weather_data) : null
        }));
        resolve(history);
      }
    });
  });
}

/**
 * 天気ログを保存する
 * @param {Object} weatherLog - 天気ログデータ
 * @returns {Promise<Object>} 保存結果
 */
async function saveWeatherLog(weatherLog) {
  const database = await getDatabase();
  
  return new Promise((resolve, reject) => {
    const {
      userId,
      latitude,
      longitude,
      weatherData
    } = weatherLog;

    const sql = `
      INSERT INTO weather_logs (user_id, latitude, longitude, weather_data)
      VALUES (?, ?, ?, ?)
    `;

    const params = [
      userId,
      latitude,
      longitude,
      JSON.stringify(weatherData)
    ];

    database.run(sql, params, function(err) {
      if (err) {
        console.error('天気ログ保存エラー:', err.message);
        reject(err);
      } else {
        resolve({
          success: true,
          id: this.lastID,
          changes: this.changes
        });
      }
    });
  });
}

module.exports = {
  getDatabase,
  saveUserProfile,
  getUserProfile,
  saveChatHistory,
  getChatHistory,
  saveWeatherLog
};