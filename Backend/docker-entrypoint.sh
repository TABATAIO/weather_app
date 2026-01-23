#!/bin/sh

echo "Starting backend service..."

#環境変数設定
export DB_PATH=${DB_PATH:-/app/data/weather_app.db}

#データベースディレクトリの確認
if [ ! -d "/app/data" ]; then
  echo "Creating data directory..."
  mkdir -p /app/data
fi

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

exec "$@"
