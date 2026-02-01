const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// データベースファイルのパス（環境変数から取得、デフォルトは既存パス）
const dbPath = process.env.DB_PATH || path.join(__dirname, 'weather_app.db');

/**
 * データベース接続を初期化する
 * @returns {Promise<sqlite3.Database>} データベース接続オブジェクト
 */
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    // ディレクトリが存在しない場合は作成
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`📁 データベースディレクトリを作成しました: ${dbDir}`);
    }
    
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('データベース接続エラー:', err.message);
        console.error('データベースパス:', dbPath);
        reject(err);
      } else {
        console.log('✅ SQLiteデータベースに接続しました');
        console.log('📍 データベースパス:', dbPath);
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
    // usersテーブル（Laravel互換）
    const usersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 会話履歴テーブル
    const chatHistoryTable = `
      CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        user_message TEXT NOT NULL,
        bot_response TEXT NOT NULL,
        intent TEXT,
        sentiment TEXT,
        weather_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `;

    // 天気ログテーブル
    const weatherLogsTable = `
      CREATE TABLE IF NOT EXISTS weather_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        latitude REAL,
        longitude REAL,
        weather_data TEXT,
        requested_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // ユーザープロファイルテーブル
    const userProfilesTable = `
      CREATE TABLE IF NOT EXISTS user_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        user_name VARCHAR(255),
        temperature_preference VARCHAR(50),
        activity_preference VARCHAR(50),
        style_preference VARCHAR(50),
        weather_sensitivity VARCHAR(50),
        favorite_activities TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `;

    let tablesCreated = 0;
    const totalTables = 4;

    function checkComplete() {
      tablesCreated++;
      if (tablesCreated === totalTables) {
        resolve();
      }
    }

    // usersテーブルを最初に作成
    db.run(usersTable, (err) => {
      if (err) {
        console.error('usersテーブル作成エラー:', err.message);
        reject(err);
      } else {
        console.log('✅ usersテーブルを作成しました');
        checkComplete();
      }
    });

    // chat_historyテーブル作成
    db.run(chatHistoryTable, (err) => {
      if (err) {
        console.error('chat_historyテーブル作成エラー:', err.message);
        reject(err);
      } else {
        console.log('✅ chat_historyテーブルを作成しました');
        checkComplete();
      }
    });

    // weather_logsテーブル作成
    db.run(weatherLogsTable, (err) => {
      if (err) {
        console.error('weather_logsテーブル作成エラー:', err.message);
        reject(err);
      } else {
        console.log('✅ weather_logsテーブルを作成しました');
        checkComplete();
      }
    });

    // user_profilesテーブル作成
    db.run(userProfilesTable, (err) => {
      if (err) {
        console.error('user_profilesテーブル作成エラー:', err.message);
        reject(err);
      } else {
        console.log('✅ user_profilesテーブルを作成しました');
        checkComplete();
      }
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