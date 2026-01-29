#!/bin/sh

echo "Starting backend service..."
echo "現在のユーザー: $(whoami)"

#環境変数設定
echo "設定前のDB_PATH: $DB_PATH"
export DB_PATH=${DB_PATH:-/var/www/storage/database/weather_app.db}
echo "設定後のDB_PATH: $DB_PATH"

#データベースディレクトリの確認
echo "データベースディレクトリ確認中..."
if [ ! -d "/var/www/storage/database" ]; then
  echo "Creating data directory..."
  mkdir -p /var/www/storage/database
else
  echo "データベースディレクトリ存在します: /var/www/storage/database"
fi

echo "ディレクトリ内容確認:"
ls -la /var/www/storage/database/ || echo "ディレクトリが見つかりません"

# ROOT権限でファイル権限を修正
echo "データベースファイルの権限を修正中（root権限）..."
if [ -f "/var/www/storage/database/weather_app.db" ]; then
  chown nextjs:nodejs /var/www/storage/database/weather_app.db
  chmod 664 /var/www/storage/database/weather_app.db
  echo "weather_app.dbの所有者をnextjs:nodejsに変更しました"
fi

if [ -d "/var/www/storage/database" ]; then
  chown nextjs:nodejs /var/www/storage/database
  chmod 755 /var/www/storage/database
  echo "データベースディレクトリの所有者をnextjs:nodejsに変更しました"
fi

echo "修正後の権限:"
ls -la /var/www/storage/database/

#データベースファイルの存在確認と初期化
if [ ! -f "$DB_PATH" ]; then
  echo "Database file not found. Initializing database..."
  node -e "
    const { setupDatabase } = require('./database');
    setupDatabase().then(() => {
      console.log('Database setup completed.');
    }).catch((err) => {
      console.error('Error setting up database:', err);
      process.exit(1);
    });
  " || exit 1
fi 

echo "Database is ready at $DB_PATH"

#環境ファイルの確認
if [ -f "/app/.env" ]; then
  echo "Loading environment variables from .env file..."
  export $(cat /app/.env | grep -v '#' | awk '/=/ {print $1}')
  else
  echo ".env file not found. Using default environment variables."
fi

echo "Starting the application..."
echo "DB_PATH is set to $DB_PATH"
echo "PORT is set to $PORT"

# nextjsユーザーでアプリケーションを実行
echo "nextjsユーザーに切り替えてアプリケーションを起動..."
exec su-exec nextjs "$@"

exec "$@"
