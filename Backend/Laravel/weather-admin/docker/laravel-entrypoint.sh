#!/bin/sh

echo "Starting Laravel backend service..."

# Environment file verification and copy
if [ ! -f "/var/www/.env" ]; then
  echo ".env file not found. Copying .env.example to .env..."
  cp /var/www/.env.example /var/www/.env
fi

# Application key generation
echo "Generating application key..."
php artisan key:generate --force

# Database directory verification
if [ ! -d "/var/www/storage/database" ]; then
    echo "Creating database directory..."
    mkdir -p /var/www/storage/database
fi

# Set database directory permissions securely
echo "Setting database directory permissions..."
chown -R www-data:www-data /var/www/storage/database
chmod -R 775 /var/www/storage/database

# If database file exists, correct permissions
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
