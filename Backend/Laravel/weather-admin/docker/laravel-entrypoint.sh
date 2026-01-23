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
if [ ! -d "/var/www/strage/database" ]; then
    echo "Creating database directory..."
    mkdir -p /var/www/strage/database
    chown -R www-data:www-data /var/www/strage/database
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