FROM node:18-alpine

# 作業ディレクトリの設定
WORKDIR /app

# package.jsonをコピーして依存関係をインストール
COPY package*.json ./
RUN npm install --only=production && npm cache clean --force

# アプリケーションコードをコピー
COPY . .

# データディレクトリの作成
RUN mkdir -p /app/data && chmod 755 /app/data

# 非rootユーザーでの実行設定（Alpine Linux対応）
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 -G nodejs nextjs && \
    chown -R nextjs:nodejs /app

# エントリーポイントスクリプトのコピー
COPY docker-entrypoint.sh /docker-entrypoint.sh
USER root
RUN chmod +x /docker-entrypoint.sh

# 最終的にnextjsユーザーで実行
USER nextjs

# ポート公開
EXPOSE 3000

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/status || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["npm", "start"]