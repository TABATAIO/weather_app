# 🌤️ Weather Mascot Backend

天気マスコットアプリのバックエンドシステム - Node.js API + Laravel管理システム

## 技術スタック

- **Node.js** - JavaScript ランタイム
- **Express.js** - Web フレームワーク
- **Axios** - HTTP クライアント（外部API通信用）
- **CORS** - Cross-Origin Resource Sharing 対応
- **dotenv** - 環境変数管理

## セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
`.env` ファイルに以下を設定してください：

```env
WEATHERNEWS_API_KEY=your_weathernews_api_key_here
PORT=3001
NODE_ENV=development
```

**Weathernews API キーの取得方法:**
1. [Weathernews 開発者サイト](https://weathernews.jp/) にアクセス
2. 開発者アカウント作成・ログイン
3. API Keys セクションでキーを取得
4. `.env` ファイルの `WEATHERNEWS_API_KEY` に設定

### 3. サーバー起動

#### 開発モード（ファイル変更時に自動再起動）
```bash
npm run dev
```

#### 本番モード
```bash
npm start
```

サーバーは `http://localhost:3001` で起動します。

## API エンドポイント

### 基本情報
- **GET** `/` - API 概要とエンドポイント一覧

### 天気情報
- **GET** `/api/weather/:lat/:lon` - 緯度経度で天気情報を取得
  - パラメータ: `lat` (緯度), `lon` (経度)
  - レスポンス: 天気データ（温度、湿度、天気状況など）

- **GET** `/api/weather/city/:city` - 都市名で天気情報を取得
  - パラメータ: `city` (都市名、例: tokyo, osaka)
  - レスポンス: 天気データ（温度、湿度、天気状況など）
  - サポート都市: tokyo, osaka, kyoto, yokohama, nagoya, fukuoka, sendai, hiroshima

### マスコット関連
- **POST** `/api/mascot/update` - マスコット状態を更新
  - ボディ: `{ weather, temperature, humidity }`
  - レスポンス: 更新されたマスコット状態

- **GET** `/api/mascot/:id` - マスコット情報を取得
  - パラメータ: `id` (マスコットID)
  - レスポンス: マスコット情報（レベル、経験値、機嫌など）

- **POST** `/api/mascot/chat` - マスコットとの会話（AI機能）
  - ボディ: `{ message, userName, weatherData?, userPreferences?, conversationHistory? }`
  - レスポンス: AI応答、感情状態、提案、天気アドバイス

### ユーザー管理
- **POST** `/api/user/profile` - ユーザープロフィール設定
  - ボディ: `{ userId, userName, preferences, favoriteActivities, clothingStyle }`
  - レスポンス: 保存されたプロフィール情報

- **GET** `/api/user/profile/:userId` - ユーザープロフィール取得
  - パラメータ: `userId` (ユーザーID)
  - レスポンス: プロフィール情報

## API レスポンス例

### 天気情報取得
```json
{
  "success": true,
  "data": {
    "location": {
      "lat": 35.681236,
      "lon": 139.767125
    },
    "current": {
      "time": "2024-12-01T09:00:00+09:00",
      "weather": "sunny",
      "temperature": 19.5,
      "feelsLike": 20.1,
      "humidity": 45,
      "precipitation": 0.0,
      "windSpeed": 3.4,
      "windDirection": "NE",
      "cloudCover": 20,
      "uvIndex": 3,
      "pressure": 1014
    },
    "timestamp": "2025-12-01T10:00:00.000Z"
  }
}
```

### マスコット状態
```json
{
  "success": true,
  "data": {
    "mood": "happy",
    "energy": 75,
    "happiness": 85,
    "comfort": 70,
    "weatherReaction": "今日はいい天気だね！☀️",
    "recommendations": [
      "お出かけに最適な天気",
      "日焼け止めと帽子を忘れずに"
    ],
    "timestamp": "2025-12-01T10:00:00.000Z"
  }
}
```

### AI会話レスポンス
```json
{
  "success": true,
  "data": {
    "response": "田中さん、今日の服装についてですね！過ごしやすい気温ですね！",
    "mood": "friendly",
    "suggestions": [
      "長袖シャツ",
      "カーディガン",
      "チノパン",
      "軽めのジャケット"
    ],
    "weatherAdvice": {
      "advice": "過ごしやすい気温ですね！",
      "items": ["長袖シャツ", "カーディガン", "チノパン", "軽めのジャケット"]
    },
    "timestamp": "2025-12-04T03:56:47.051Z"
  }
}
```

## 機能概要

### 🌤️ 天気連動システム
- 外部天気API（Weathernews ポイント天気）との連携
- リアルタイム天気情報取得
- 日本語での天気状況表示

### 🐾 マスコット状態管理
- 天気に応じた機嫌・エネルギー変化
- 温度による状態調整
- ランダムなリアクションメッセージ

### 🤖 AI会話機能
- 自然な日常会話レスポンス
- 天気に基づく服装アドバイス
- パーソナライズされた活動提案
- 感情認識と共感的な応答
- ユーザー設定による個性化

### 📊 拡張可能な設計
- 将来的なデータベース連携に対応
- ユーザー認証システムの追加準備
- 育成システムの実装準備

## 開発用コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番サーバー起動
npm start

# API テスト例
# 緯度経度で天気取得（東京）
curl http://localhost:3001/api/weather/35.6762/139.6503

# 都市名で天気取得
curl http://localhost:3001/api/weather/city/tokyo

# AI会話テスト
curl -X POST http://localhost:3001/api/mascot/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "今日は何を着ればいいかな？",
    "userName": "田中さん",
    "weatherData": {"current": {"weather": "sunny", "temperature": 22}}
  }'

# ユーザープロフィール設定
curl -X POST http://localhost:3001/api/user/profile \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "userName": "田中さん", 
    "preferences": {"activities": "outdoor", "style": "sporty"}
  }'
```

## 注意事項

- Weathernews API の利用制限については公式ドキュメントを確認してください
- `.env` ファイルは Git にコミットしないでください
- CORS設定により、すべてのオリジンからのアクセスを許可しています（開発用）

## 今後の実装予定

- [ ] データベース連携（SQLite/MongoDB）
- [ ] ユーザー認証システム
- [ ] マスコット育成ロジックの詳細実装
- [ ] キャッシュ機能
- [ ] エラーハンドリングの強化