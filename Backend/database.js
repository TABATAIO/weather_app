const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// データベースファイルのパス
const dbPath = path.join(__dirname, 'weather_app.db');

/**
 * データベース接続を初期化する
 * @returns {Promise<sqlite3.Database>} データベース接続オブジェクト
 */
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('データベース接続エラー:', err.message);
        reject(err);
      } else {
        console.log('✅ SQLiteデータベースに接続しました');
        resolve(db);
      }
    });
  });
}

/**
 * テーブルを作成する
 * @param {sqlite3.Database} db - データベース接続
 * @returns {Promise<void>}
 */
function createTables(db) {
  return new Promise((resolve, reject) => {
    // ユーザープロフィールテーブル
    const userProfilesTable = `
      CREATE TABLE IF NOT EXISTS user_profiles (
        user_id TEXT PRIMARY KEY,
        user_name TEXT NOT NULL,
        temperature_preference TEXT DEFAULT 'moderate',
        activity_preference TEXT DEFAULT 'both',
        style_preference TEXT DEFAULT 'casual',
        weather_sensitivity TEXT DEFAULT 'normal',
        favorite_activities TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 会話履歴テーブル
    const chatHistoryTable = `
      CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        user_message TEXT NOT NULL,
        bot_response TEXT NOT NULL,
        intent TEXT,
        sentiment TEXT,
        weather_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user_profiles (user_id)
      )
    `;

    // 天気ログテーブル
    const weatherLogsTable = `
      CREATE TABLE IF NOT EXISTS weather_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        latitude REAL,
        longitude REAL,
        weather_data TEXT,
        requested_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    db.serialize(() => {
      db.run(userProfilesTable, (err) => {
        if (err) {
          console.error('user_profilesテーブル作成エラー:', err.message);
          reject(err);
        } else {
          console.log('✅ user_profilesテーブルを作成しました');
        }
      });

      db.run(chatHistoryTable, (err) => {
        if (err) {
          console.error('chat_historyテーブル作成エラー:', err.message);
          reject(err);
        } else {
          console.log('✅ chat_historyテーブルを作成しました');
        }
      });

      db.run(weatherLogsTable, (err) => {
        if (err) {
          console.error('weather_logsテーブル作成エラー:', err.message);
          reject(err);
        } else {
          console.log('✅ weather_logsテーブルを作成しました');
          resolve();
        }
      });
    });
  });
}

/**
 * データベースを初期化してテーブルを作成する
 * @returns {Promise<sqlite3.Database>} 初期化されたデータベース接続
 */
async function setupDatabase() {
  try {
    const db = await initializeDatabase();
    await createTables(db);
    return db;
  } catch (error) {
    console.error('データベースセットアップエラー:', error);
    throw error;
  }
}

module.exports = {
  initializeDatabase,
  createTables,
  setupDatabase,
  dbPath
};