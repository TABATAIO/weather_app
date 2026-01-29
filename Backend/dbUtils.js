const { setupDatabase } = require('./database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

let db = null;

/**
 * データベース接続を取得する
 * @returns {Promise<sqlite3.Database>} データベース接続
 */
async function getDatabase() {
  console.log('🔍 getDatabase呼び出し, 現在のdb:', !!db);
  if (!db) {
    console.log('📊 データベース初期化中...');
    try {
      db = await setupDatabase();
      console.log('✅ データベース初期化完了');
    } catch (error) {
      console.error('💥 データベース初期化エラー:', error);
      throw error;
    }
  }
  console.log('🎯 データベース接続返却');
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

/**
 * ユーザーを作成する（サインアップ）
 * @param {Object} userData - ユーザー登録データ
 * @returns {Promise<Object>} 作成結果
 */
async function createUser(userData) {
  console.log('🔧 createUser関数開始:', userData);
  
  try {
    console.log('📊 データベース接続取得中...');
    const database = await getDatabase();
    console.log('✅ データベース接続成功');
    
    return new Promise(async (resolve, reject) => {
      const { email, password, username } = userData;

      console.log('🔒 パスワードハッシュ化開始...');
      try {
        // パスワードをハッシュ化
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log('✅ パスワードハッシュ化完了');

        const sql = `
          INSERT INTO users (name, email, password, created_at, updated_at)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;

        const params = [username, email, hashedPassword];
        console.log('📝 SQL実行:', { sql, params: [username, email, '***'] });

        database.run(sql, params, function(err) {
          if (err) {
            console.error('💥 SQL実行エラー:', err);
            if (err.message.includes('UNIQUE constraint failed')) {
              console.log('⚠️ 重複メールアドレスエラー');
              resolve({
                success: false,
                error: 'このメールアドレスは既に使用されています'
              });
            } else {
              console.error('❌ 予期しないユーザー作成エラー:', err.message);
              reject(err);
            }
          } else {
            console.log('✅ SQL実行成功, lastID:', this.lastID);
            // JWTトークンを生成
            const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
            console.log('🔐 JWT生成中...');
            const token = jwt.sign(
              { 
                userId: this.lastID, 
                email: email,
                username: username
              },
              jwtSecret,
              { expiresIn: '7d' }
            );
            console.log('✅ JWT生成完了');

            resolve({
              success: true,
              user: {
                id: this.lastID,
                email: email,
                username: username
              },
              token: token,
              changes: this.changes
            });
          }
        });
      } catch (error) {
        console.error('💥 createUser内部エラー:', error);
        reject(error);
      }
    });
  } catch (error) {
    console.error('💥 createUser外部エラー:', error);
    throw error;
  }
}

/**
 * ユーザー認証（サインイン）
 * @param {Object} loginData - ログインデータ
 * @returns {Promise<Object>} 認証結果
 */
async function authenticateUser(loginData) {
  console.log('🔧 authenticateUser関数開始:', loginData);
  
  try {
    console.log('📊 データベース接続取得中...');
    const database = await getDatabase();
    console.log('✅ データベース接続成功');
    
    return new Promise((resolve, reject) => {
      const { email, password } = loginData;

      const sql = `
        SELECT * FROM users WHERE email = ?
      `;

      console.log('🔍 ユーザー検索SQL実行:', { email, sql });

      database.get(sql, [email], async (err, user) => {
        if (err) {
          console.error('💥 SQL実行エラー:', err);
          console.error('ユーザー認証エラー:', err.message);
          reject(err);
        } else if (user) {
          console.log('👤 ユーザー発見:', { id: user.id, name: user.name, email: user.email });
          try {
            // パスワード照合
            console.log('🔒 パスワード照合開始...');
            const isValidPassword = await bcrypt.compare(password, user.password);
            console.log('🔍 パスワード照合結果:', isValidPassword);
            
            if (isValidPassword) {
              console.log('✅ パスワード照合成功');
              // JWTトークンを生成
              console.log('🔐 JWT生成開始...');
              const token = jwt.sign(
                { 
                  userId: user.id, 
                  email: user.email,
                  username: user.name 
                },
                process.env.JWT_SECRET || 'weather_app_secret',
                { expiresIn: '7d' }
              );
              console.log('✅ JWT生成完了');

              resolve({
                success: true,
                token: token,
                user: {
                  id: user.id,
                  email: user.email,
                  username: user.name
                }
              });
            } else {
              console.log('❌ パスワード照合失敗');
              resolve({
                success: false,
                error: 'パスワードが正しくありません'
              });
            }
          } catch (error) {
            console.error('💥 パスワード照合中エラー:', error);
            reject(error);
          }
        } else {
          console.log('❌ ユーザーが見つかりません:', email);
          resolve({
            success: false,
            error: 'ユーザーが見つかりません'
          });
        }
      });
    });
  } catch (error) {
    console.error('💥 authenticateUser外部エラー:', error);
    throw error;
  }
}

/**
 * JWTトークンを検証する
 * @param {string} token - JWTトークン
 * @returns {Promise<Object>} 検証結果
 */
async function verifyToken(token) {
  return new Promise((resolve, reject) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'weather_app_secret');
      resolve({
        success: true,
        user: decoded
      });
    } catch (error) {
      resolve({
        success: false,
        error: 'Invalid token'
      });
    }
  });
}

module.exports = {
  getDatabase,
  saveUserProfile,
  getUserProfile,
  saveChatHistory,
  getChatHistory,
  saveWeatherLog,
  createUser,
  authenticateUser,
  verifyToken
};