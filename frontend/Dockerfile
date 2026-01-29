FROM nginx:alpine

# 必要なパッケージのインストール（Git含む）
RUN apk update && apk add --no-cache git

# 静的ファイルをnginxのwebrootにコピー
COPY . /usr/share/nginx/html/

# カスタムnginx設定
COPY docker-nginx.conf /etc/nginx/conf.d/default.conf

# 権限設定
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]