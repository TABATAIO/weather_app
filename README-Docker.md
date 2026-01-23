# 🐳 Docker環境での起動方法

## 必要な環境
- Docker Desktop v4.0+ (Windows/Mac) または Docker Engine (Linux)
- Docker Compose v2.0+

## 🚀 クイックスタート

### 1. 起動
```bash
chmod +x start.sh
./start.sh
```

### 2. アクセス先
- **📊 API情報**: http://localhost:3001/api  
- **📱 統合デモページ**: http://localhost:3001/demo.html
- **🌐 フロントエンド**: http://localhost:8080  
- **🔧 Laravel管理画面**: http://localhost:8000

### 3. 機能テスト手順
1. **API情報確認**: http://localhost:3001/api で利用可能なエンドポイント確認
2. **天気情報テスト**: http://localhost:3001/api/weather/city/tokyo で東京の天気取得
3. **統合デモページ**: http://localhost:3001/demo.html でチャット機能をテスト
4. **管理画面**: http://localhost:8000 でデータ管理機能確認

### 4. APIテスト例
```bash
# API情報取得
curl http://localhost:3001/api

# 東京の天気情報取得
curl http://localhost:3001/api/weather/city/tokyo

# AIチャット（POST）
curl -X POST http://localhost:3001/api/mascot/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "今日の天気は？", "userId": "test_user"}'
```

### 5. 停止・削除
```bash
# 停止
docker compose down

# データも含めて完全削除
docker compose down -v
```

## 🔧 トラブルシューティング

### APIが見つからない場合
```bash
# 完全再構築（推奨）
docker compose down
docker compose build --no-cache
docker compose up -d

# 起動確認
docker ps
curl http://localhost:3001/api
```

### ポート競合の確認
```bash
# ポート使用状況確認
lsof -i :3001  # バックエンド
lsof -i :8000  # Laravel
lsof -i :8080  # フロントエンド

# 競合するプロセスを停止してから再起動
```

## 🔧 開発者向け

### ログ確認
```bash
# 全サービス
docker compose logs -f

# 特定サービス
docker compose logs -f weather-backend
docker compose logs weather-backend --tail 20
```

### コンテナ内での作業
```bash
# バックエンドコンテナに入る
docker exec -it weather-backend sh

# ファイル内容確認
docker exec weather-backend cat /app/server.js | head -100
```

### 個別サービス管理
```bash
# 特定サービスのみ再起動
docker compose restart weather-backend

# 特定サービスのみビルド
docker compose build weather-backend

# 特定サービスのみアップ
docker compose up -d weather-backend
```

## 📝 開発ノート

### コンテナ構成
- **weather-backend** (Port 3001): Node.js + Express + SQLite
- **weather-admin** (Port 8000): PHP + Laravel + SQLite
- **weather-frontend** (Port 8080): Nginx + 静的ファイル

### データ永続化
- `weather_db_data`: SQLiteデータベースファイルの永続化
- バックエンドとLaravelで共有される統一データベース