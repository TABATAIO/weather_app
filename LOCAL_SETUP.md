# 🏠 ローカル環境セットアップガイド

## 📋 前提条件

### 必要なソフトウェア

- **Node.js** (v16以降推奨)
- **Docker & Docker Compose**
- **Git**
- **ブラウザ** (Chrome、Firefox、Safari)

## 🚀 ローカル環境構築手順

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd weather-mascot-app
```

### 2. Backend環境設定

#### 依存関係インストール

```bash
cd Backend
npm install
```

#### 環境変数設定

`.env`ファイルを確認・編集：

```env
# Weathernews API Configuration
WEATHERNEWS_API_KEY=your_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_PATH=./weather_app.db

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080,http://localhost:5000,http://127.0.0.1:5500

# Gemini AI API設定
GEMINI_API_KEY=your_gemini_api_key_here
```

#### Backendサーバー起動

```bash
# 開発モード（ファイル変更時自動再起動）
npm run dev

# または通常起動
npm start
```

### 3. Frontend環境構築

#### 静的ファイルサーバー起動

```bash
cd Frontend

# Node.js HTTP サーバー（推奨）
node simple-server.js

# またはPython HTTP サーバー
python3 -m http.server 8080

# またはPHP開発サーバー
php -S localhost:8080
```

### 4. Laravel管理システム（オプション）

#### Composer依存関係インストール

```bash
cd Backend/Laravel/weather-admin
composer install
```

#### Laravel環境設定

```bash
# 環境ファイル準備
cp .env.example .env

# アプリケーションキー生成
php artisan key:generate

# データベースマイグレーション
php artisan migrate
```

#### Laravel開発サーバー起動

```bash
php artisan serve --port=8000
```

## 🌐 アクセスURL

| サービス        | URL                   | 説明               |
| --------------- | --------------------- | ------------------ |
| **Frontend**    | http://localhost:8080 | メインWebアプリ    |
| **Backend API** | http://localhost:3001 | REST API サーバー  |
| **Laravel管理** | http://localhost:8000 | 管理ダッシュボード |

## 🐳 Dockerを使用する場合

### 全サービス一括起動

```bash
# ビルドして起動
docker-compose up --build

# バックグラウンド起動
docker-compose up -d --build

# ログ確認
docker-compose logs -f

# 停止
docker-compose down
```

### 個別サービス起動

```bash
# Backendのみ
docker-compose up weather-backend

# Frontendのみ
docker-compose up weather-frontend

# Laravel管理画面のみ
docker-compose up weather-admin
```

## 🔧 トラブルシューティング

### ポート競合の解決

```bash
# ポート使用状況確認
netstat -tulpn | grep :3001
lsof -i :3001

# プロセス終了
kill -9 <PID>
```

### 依存関係の問題

```bash
# Node.js依存関係リフレッシュ
rm -rf node_modules package-lock.json
npm install

# Composer依存関係リフレッシュ
rm -rf vendor composer.lock
composer install
```

### データベース問題

```bash
# SQLiteファイル権限修正
chmod 664 weather_app.db

# Laravel migration リセット
php artisan migrate:fresh
```

## 📊 動作確認チェックリスト

### Frontend機能

- [ ] ページ表示（index.html）
- [ ] マスコット表示
- [ ] 天気背景変化
- [ ] チャット画面遷移

### Backend API

- [ ] `/test` エンドポイント
- [ ] `/api/weather` 天気情報取得
- [ ] `/api/chat` チャット機能
- [ ] `/api/mascot` マスコット状態

### Laravel管理

- [ ] ダッシュボード表示
- [ ] ユーザー管理
- [ ] データエクスポート

## 🔍 デバッグ情報

### ブラウザコンソール確認

```javascript
// API接続テスト
fetch("http://localhost:3001/test")
  .then((response) => response.json())
  .then((data) => console.log(data));
```

### ログファイル確認

```bash
# Backend ログ
tail -f Backend/logs/app.log

# Laravel ログ
tail -f Backend/Laravel/weather-admin/storage/logs/laravel.log
```

---

## 🎯 次のステップ

1. ローカル環境でシステム全体を起動
2. 各機能の動作確認
3. API連携テスト
4. パフォーマンス測定
5. テストケース実行
