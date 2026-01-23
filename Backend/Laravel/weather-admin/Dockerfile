FROM php:8.4-fpm-alpine

# 必要なパッケージとPHP拡張をインストール
RUN apk add --no-cache \
    nginx \
    supervisor \
    sqlite \
    sqlite-dev \
    curl \
    zip \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_sqlite

# Composerのインストール
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Node.js & npmのインストール
RUN apk add --no-cache nodejs npm

# 作業ディレクトリの設定
WORKDIR /var/www

# Composer依存関係の事前インストール
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --optimize-autoloader

# npm依存関係の事前インストール（dev含む）
COPY package*.json ./
RUN npm ci

# アプリケーションコードのコピー
COPY . .

# Composer autoloadとLaravel最適化
RUN composer dump-autoload --optimize

# アセットのビルド（devDependenciesが必要）
RUN npm run build

# 本番環境用に再インストール（devDependencies削除）
RUN npm ci --only=production && npm cache clean --force

# 権限設定
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage \
    && chmod -R 755 /var/www/bootstrap/cache

# データベースディレクトリの作成と権限設定
RUN mkdir -p /var/www/storage/database && \
    chown -R www-data:www-data /var/www/storage/database && \
    chmod -R 775 /var/www/storage/database

# Nginx設定
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Supervisor設定  
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Laravelエントリーポイント
COPY docker/laravel-entrypoint.sh /laravel-entrypoint.sh
RUN chmod +x /laravel-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/laravel-entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]