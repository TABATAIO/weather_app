#!/bin/sh

echo "Starting Laravel backend service..."

#環境ファイルの確認とコピー
if [ ! -f "/var/www/.env" ]; then
  echo ".env file not found. Copying .env.example to .env..."
  cp /var/www/.env.example /var/www/.env
fi

#アプリケーションキーの生成
echo "Generating application key..."
php artisan key:generate --force

#データベースのディレクトリ確認
if [ ! -d "/var/www/storage/database" ]; then
    echo "Creating database directory..."
    mkdir -p /var/www/storage/database
fi

# データベースディレクトリの権限を確実に設定
echo "Setting database directory permissions..."
chown -R www-data:www-data /var/www/storage/database
chmod -R 775 /var/www/storage/database

# データベースファイルが存在する場合、権限を修正
if [ -f "/var/www/storage/database/weather_app.db" ]; then
    echo "Setting database file permissions..."
    chown www-data:www-data /var/www/storage/database/weather_app.db
    chmod 664 /var/www/storage/database/weather_app.db
fi

#データベースの設定確認
echo "Checking database configuration..."
php artisan config:cache

#マイグレーション実行
echo "Running database migrations..."
php artisan migrate --force 2> /dev/null || echo "Migrations already applied or failed."

#ルートキャッシュ
echo "Caching routes..."
php artisan route:cache

echo "Starting the Laravel application..."
exec "$@"