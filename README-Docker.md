# 🐳 Docker環境での起動方法

## 必要な環境
- Docker
- Docker Compose

## 🚀 クイックスタート

### 1. 起動
```bash
chmod +x start.sh
./start.sh
```

### 2. アクセス先
- **📱 メインアプリ**: http://localhost:3000/demo.html
- **🌐 フロントエンド**: http://localhost:8080  
- **🔧 管理画面**: http://localhost:8000
- **📊 API**: http://localhost:3000/api

### 3. 機能テスト手順
1. メインデモページでチャット機能をテスト
2. ユーザー登録とプロフィール設定
3. 管理画面でデータ確認
4. 天気API連携の動作確認

### 4. 停止・削除
```bash
# 停止
docker-compose down

# データも含めて完全削除
docker-compose down -v
```

## 🔧 開発者向け

### ログ確認
```bash
# 全サービス
docker-compose logs -f

# 特定サービス
docker-compose logs -f weather-backend
```

### コンテナ内での作業
```bash
docker-compose exec weather-backend sh
```