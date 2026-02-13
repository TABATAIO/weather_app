# 🌤️ Weather Mascot App

天気マスコット育成アプリケーション - AIマスコットと天気情報を組み合わせた対話型育成システム

## 📖 プロジェクト概要

**Gemini AI搭載の対話システム**と**リアルタイム天気情報**、**マスコット育成要素**を組み合わせた革新的なWebアプリケーション。ユーザーとマスコットの触れ合いを通じて経験値を獲得し、レベルアップしながら進化していく育成システムです。

## ✨ 最終仕様 (v3.0 - 2026年2月13日完成版)

### 🐾 マスコット育成システム

- **経験値システム**: 撫でる・食べさせる・遊ぶでEXP獲得
- **レベルアップ**: 100EXPごとにレベルアップ（最大レベル無制限）
- **マスコット進化**: レベルに応じて4段階の見た目変化
  - Lv.1-10: 第一形態（character01.png）
  - Lv.11-20: 第二形態（character02.png）
  - Lv.21-30: 第三形態（character03.png）
  - Lv.31+: 第四形態（character04.png）
- **プログレスバー**: リアルタイムで経験値進捗を視覚表示
- **サーバー再起動不要**: アクション直後に全ステータス即座更新

### 💬 AIチャット機能

- **Google Gemini搭載**: 自然な会話を実現
- **時間帯対応挨拶**: Asia/Tokyo タイムゾーンで正確な時刻判定
- **会話履歴保存**: ローカルストレージ + データベース永続化
- **天気連動対話**: リアルタイム天気データを含む対話
- **マスコット個性**: 名前に応じたキャラクター設定

### 🎯 ミッション機能

- **日次ミッション**: 毎日3つの新しいタスク
- **自動リセット**: 日付変更で自動更新
- **進捗トラッキング**: リアルタイム進行状況表示
- **報酬システム**: 達成で経験値とボーナス獲得
- **ミッション種類**:
  - マスコットと遊ぼう（touch_mascot）
  - 気分をシェアしよう（share_mood）
  - 外出準備をしよう（check_weather）

### 🌤️ 天気システム

- **Weathernews API連携**: 正確な天気情報取得
- **動的背景**: 天気に応じた背景自動変更
- **詳細データ**: 温度・湿度・風速・気圧表示
- **外部リンク**: Weathernews詳細ページへ遷移可能

### 📱 PWA対応

- **オフライン対応**: Service Worker実装
- **ホーム画面追加**: アプリアイコンからアクセス可能
- **manifest.json**: PWA完全対応

### 🏗️ アーキテクチャ

- **Docker 3層構成**:
  - Nginx (port 8080): フロントエンド配信
  - Node.js Express (port 3001): チャットAPI・天気API
  - Laravel (port 8000): マスコット管理API・ミッションAPI
- **データベース**: SQLite（永続化ボリューム）
- **認証**: JWT トークンベース（実装済み・未使用）

## 🚀 クイックスタート

### 必要環境

- Docker & Docker Compose
- モダンブラウザ（Chrome、Firefox、Safari推奨）
- インターネット接続（Gemini API・Weathernews API使用）

### 環境変数設定

`.env`ファイルを作成：

```bash
# Backend/.env
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=weather_app_secret_key
PORT=3001
NODE_ENV=production

# Backend/Laravel/weather-admin/.env
DB_CONNECTION=sqlite
DB_DATABASE=/var/www/storage/database/database.sqlite
APP_ENV=production
APP_KEY=base64:your_laravel_app_key
```

### 起動方法

```bash
# リポジトリのクローン
git clone <repository-url>
cd weather_app

# 簡単起動（推奨）
./start.sh

# または手動起動
docker compose build --no-cache
docker compose up -d

# パーミッション修正（初回のみ必要な場合）
docker exec weather-admin chmod -R 777 /var/www/storage /var/www/bootstrap/cache
```

### アクセス先

- **🐾 マスコットページ**: http://localhost:8080/mascotPage.html
- **💬 チャットページ**: http://localhost:8080/chatPage.html
- **🛠️ Laravel管理画面**: http://localhost:8000
- **🔌 Node.js API**: http://localhost:3001

## 📁 プロジェクト構造

```
weather_app/
├── Backend/                    # バックエンドシステム
│   ├── server.js              # Node.js Express APIサーバー
│   ├── database.js            # SQLite DB設定
│   ├── dbUtils.js             # DB操作ユーティリティ
│   ├── modules/               # 専門モジュール群
│   │   ├── chatService.js     # Gemini AIチャット機能
│   │   ├── mascotService.js   # マスコット管理ロジック
│   │   ├── weatherService.js  # Weathernews API連携
│   │   ├── nlpService.js      # 自然言語処理
│   │   └── responseGenerator.js # 応答生成エンジン
│   ├── Laravel/               # Laravel管理システム
│   │   └── weather-admin/     # 管理パネル・マスコットAPI
│   │       ├── app/Http/Controllers/
│   │       │   ├── SimpleMascotController.php  # マスコットAPI
│   │       │   ├── MissionController.php       # ミッションAPI
│   │       │   └── AuthController.php          # 認証API
│   │       ├── routes/api.php # API ルート定義
│   │       ├── database/migrations/ # DB設計
│   │       └── storage/database/  # SQLite DBファイル
│   └── weather_app.db         # Node.js SQLite DB（チャット履歴等）
├── Frontend/                   # フロントエンドUI
│   ├── mascotPage.html        # 🐾 メインマスコットページ
│   ├── chatPage.html          # 💬 チャット機能ページ
│   ├── index.html             # 🏠 ランディングページ
│   ├── manifest.json          # PWA manifest
│   ├── js/                    # JavaScript モジュール
│   │   ├── pages/             # ページコントローラー
│   │   │   ├── mascotPage.js  # マスコットページロジック
│   │   │   └── chatPage.js    # チャットページロジック
│   │   ├── modules/           # UI コンポーネント
│   │   │   ├── mascotDisplay.js   # マスコット表示・アニメーション
│   │   │   ├── chatInterface.js   # チャットUI制御
│   │   │   ├── missionManager.js  # ミッション進捗管理
│   │   │   └── weatherBackground.js # 天気背景制御
│   │   └── utils/             # ユーティリティ
│   │       ├── apiClient.js   # API通信クライアント
│   │       └── common.js      # 共通関数
│   ├── css/                   # スタイルシート
│   │   ├── main.css           # 基本スタイル
│   │   ├── mascotPage.css     # マスコットページ専用
│   │   ├── chatPage.css       # チャットページ専用
│   │   └── weatherBackground.css # 天気背景スタイル
│   └── img/                   # 画像アセット
│       ├── character01.png    # マスコット第一形態
│       ├── character02.png    # マスコット第二形態
│       ├── character03.png    # マスコット第三形態
│       └── character04.png    # マスコット第四形態
├── docker-compose.yml         # Docker サービス定義
├── start.sh                   # 簡単起動スクリプト
├── DEVELOPMENT_REPORT.md      # 開発レポート
└── TEST_REPORT.md            # テストレポート
```
│   │   ├── main.css           # 基本スタイル
│   │   ├── mascotPage.css     # マスコットページ専用
│   │   ├── chatPage.css       # チャットページ専用（NEW!）
│   │   └── weatherBackground.css # 天気背景
│   └── img/                   # 画像アセット
├── docker-compose.yml         # Docker サービス定義
└── start.sh                   # 簡単起動スクリプト
```

## 🎮 主な機能

### マスコットインタラクション

- **チャット機能**: マスコットとAI搭載の自然な会話（Gemini API）
- **名前編集**: マスコットの名前をリアルタイム変更・保存
- **タッチインタラクション**: クリックでマスコットが反応
- **状態表示**: レベル・体力・経験値バーの視覚表示
- **感情システム**: 天気や時間に応じた感情変化

### ミッション機能

- **日次ミッション**: 毎日更新される3つのタスク
- **進行状況**: リアルタイム進捗表示
- **報酬システム**: ミッション達成で経験値獲得

### 天気連携

- **リアルタイム天気**: 東京の現在天気情報表示
- **動的背景**: 晴れ・雨・曇りに応じた背景切り替え
- **マスコット連動**: 天気でマスコットの気分が変化

## 🛠️ 開発・デバッグ

### ログ確認

```bash
# サービス別ログ確認
docker compose logs weather-backend  # Node.js API
docker compose logs weather-admin    # Laravel API
docker compose logs weather-frontend # Nginx

# リアルタイムログ
docker compose logs -f
```

### データベースアクセス

```bash
# Laravel Tinker
docker exec weather-admin php artisan tinker

# マスコットデータ確認
DB::table('user_mascots')->where('user_id', 1)->first();
```

## 📝 更新履歴

### v2.2 (2026年2月2日) - チャット機能リリース

- ✅ AIチャット機能の完全実装（Gemini API搭載）
- ✅ チャットページの新設（chatPage.html）
- ✅ マスコットアバター表示とスクロール機能
- ✅ 天気データ連動チャット（リアルタイム天気情報を含む対話）
- ✅ 部屋名動的変更（マスコット名に応じた表示）
- ✅ ナビゲーション改善（マスコット⇔チャット画面の双方向移動）

### v2.1 (2026年2月1日)

- ✅ 名前変更機能の完全実装（サーバー永続化）
- ✅ API通信エラーの修正とフォールバック実装
- ✅ JavaScript構文エラーの全面解消
- ✅ パフォーマンス最適化（デバッグログ整理）
- ✅ ローカルストレージとサーバーの同期機能

### v2.0 (前回)

- 高度AIチャット機能の実装
- モジュラーアーキテクチャの導入
- Docker環境の整備

## 🎮 主な機能詳細

### 🐾 マスコットインタラクション

- **撫でる**: マスコットをクリックして愛情表現（+10 EXP）
- **食べさせる**: おにぎり・ケーキなどの食事提供（+5 EXP、満腹度回復）
- **遊ぶ**: マスコットと一緒に遊ぶ（+15 EXP、幸福度上昇）
- **チャット**: AI搭載の自然な会話（経験値獲得なし、コミュニケーション重視）
- **名前変更**: リアルタイムで名前をカスタマイズ（サーバー永続化）

### 📊 ステータスシステム

- **レベル**: 100EXPごとにレベルアップ
- **経験値バー**: 0-100%のプログレスバー（リアルタイム更新）
- **体力（HP）**: 0-100、マスコットの健康状態
- **幸福度**: 0-100、インタラクション頻度で変動
- **満腹度**: 0-100、食事で回復

### 🎯 ミッションシステム詳細

**日次ミッション（毎日3つ）**:
1. **マスコットと遊ぼう** - タップして触れ合う（target: touch_mascot）
2. **気分をシェアしよう** - チャットで会話（target: share_mood）
3. **外出準備をしよう** - 天気をチェック（target: check_weather）

**進捗管理**:
- リアルタイム進捗表示（0→1→完了）
- ローカルとサーバー両方で進捗保存
- 日付変更で自動リセット

### 🌤️ 天気連携機能

- **Weathernews API**: 正確な天気データ取得
- **東京エリア**: デフォルトで東京の天気情報表示
- **動的背景**: 晴れ・曇り・雨・雪で背景自動変更
- **詳細情報**: 温度・体感温度・湿度・風速・気圧

### 💬 チャット機能詳細

- **Google Gemini 1.5 Flash**: 高速応答AIモデル
- **コンテキスト保持**: 過去10件の会話履歴を参照
- **時間帯認識**: 朝・昼・夕・夜で異なる挨拶
- **天気連動**: 現在の天気情報を含む対話
- **会話履歴**: ローカルストレージ + SQLite DBに永続保存

## 🛠️ 技術スタック

### バックエンド
- **Node.js (v18+)**: Express.js REST API
- **Laravel (v11)**: マスコット・ミッション管理API
- **SQLite**: 軽量データベース（2つのDB使用）
- **Google Gemini API**: AIチャット機能
- **Weathernews API**: 天気情報取得

### フロントエンド
- **Vanilla JavaScript (ES6+)**: モジュール構造
- **CSS3**: Flexbox/Grid レイアウト
- **PWA**: Service Worker + Manifest対応
- **LocalStorage**: クライアント側データ永続化

### インフラ
- **Docker**: コンテナ化
- **Docker Compose**: マルチコンテナ管理
- **Nginx**: 静的ファイル配信

## 🔧 API エンドポイント

### マスコット管理API（Laravel - port 8000）

```bash
GET  /api/mascot/status             # マスコットステータス取得
POST /api/mascot/pet                # 撫でる（+10 EXP）
POST /api/mascot/feed               # 食べさせる（+5 EXP）
POST /api/mascot/play               # 遊ぶ（+15 EXP）
GET  /api/mascot/greeting           # 時間帯別挨拶取得
POST /api/mascot/name               # 名前変更
```

### ミッション管理API（Laravel - port 8000）

```bash
GET  /api/missions/today            # 今日のミッション取得
POST /api/missions/progress         # ミッション進捗更新
```

### チャット・天気API（Node.js - port 3001）

```bash
POST /api/mascot/chat               # AIチャット（Gemini）
GET  /api/weather/:location         # 天気情報取得
POST /api/chat/history/:userId      # チャット履歴保存
GET  /api/chat/history/:userId      # チャット履歴取得
```

## 🚀 開発・デバッグ

### ログ確認

```bash
# サービス別ログ確認
docker compose logs weather-backend
docker compose logs weather-admin
docker compose logs weather-frontend

# リアルタイムログ
docker compose logs -f weather-backend
```

### データベース操作

```bash
# Laravel Tinker（対話型コンソール）
docker exec -it weather-admin php artisan tinker

# マスコットデータ確認
>>> DB::table('mascots')->first();

# チャット履歴確認
docker exec weather-admin sqlite3 /var/www/storage/database/database.sqlite \
  "SELECT COUNT(*) FROM chat_history;"
```

### パーミッション問題解決

```bash
# Laravel ストレージパーミッション修正
docker exec weather-admin chmod -R 777 /var/www/storage /var/www/bootstrap/cache
```

## 📝 更新履歴

### v3.0 (2026年2月13日) - 完成版 🎉

- ✅ マスコット育成システム完全実装
- ✅ 経験値・レベルアップ・4段階進化システム
- ✅ プログレスバーのリアルタイム更新
- ✅ サーバー再起動不要の即座ステータス更新
- ✅ チャット履歴のデータベース永続化
- ✅ 時間帯対応AI挨拶（Asia/Tokyo）
- ✅ SQLiteパーミッション問題の解決
- ✅ PWAフル対応完了

### v2.2 (2026年2月2日)

- ✅ AIチャット機能実装
- ✅ チャットページ新設
- ✅ 天気データ連動チャット

### v2.1 (2026年2月1日)

- ✅ 名前変更機能実装
- ✅ API通信エラー修正

## 🤝 貢献方法

1. このリポジトリをフォーク
2. 新機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 関連ドキュメント

- [開発レポート](DEVELOPMENT_REPORT.md)
- [テストレポート](TEST_REPORT.md)
- [Laravel管理画面README](Backend/Laravel/README.md)

## 📜 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 🙏 謝辞

- **Google Gemini API** - AIチャット機能
- **Weathernews** - 天気情報API
- **Docker** - コンテナ化プラットフォーム

---

**🌟 楽しいマスコット育成ライフをお楽しみください！ 🌟**

*「天気と一緒に成長する、あなただけのマスコット」*
