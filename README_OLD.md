# 🌤️ Weather Mascot App

天気マスコットアプリケーション - 高度AIチャット機能を備えた対話型天気システム

## 📖 プロジェクト概要

このプロジェクトは、最新のGemma-3-1b-it AIモデルを活用した高度なチャット機能と、正確な天気情報を組み合わせた革新的なアプリケーションです。ユーザーの感情や疲労度を理解し、パーソナライズされた天気情報と実用的な提案を提供します。

## ✨ 最新機能 (v2.0)

### 🤖 高度AIチャット
- **Gemma-3-1b-it**: Google製の高効率AIモデル搭載
- **感情解析**: ユーザーの気持ちを理解し共感的な応答
- **疲労サポート**: 疲れた時の適切なアドバイスとケア
- **会話履歴**: SQLiteによる永続的な会話記録
- **ローカルフォールバック**: AI接続時の自然言語処理

###  インタラクティブデモ
- **統合デモページ**: 天気情報とAIチャットの完全統合UI
- **リアルタイム都市選択**: 東京、大阪、名古屋、札幌、福岡の即座切り替え
- **レスポンシブデザイン**: モバイル・デスクトップ最適化
- **ライブマスコット**: 天気に応じた動的キャラクター表示

### 🏗️ モジュラーアーキテクチャ
- **完全モジュール化**: 5つの専門モジュールによる保守性向上
- **コード最適化**: server.js 2042行 → 1672行 (370行削減)
- **エラーハンドリング**: 堅牢なフォールバックシステム

```
weather_app/
├── Backend/                    # バックエンドシステム
│   ├── server.js              # メインAPIサーバー (1,672行)
│   ├── demo.html              # 🌟 統合デモページ (666行)
│   ├── Dockerfile             # 🐳 Node.js環境構築
│   ├── docker-entrypoint.sh   # 🗄️ DB初期化スクリプト
│   ├── modules/               # 専門モジュール (1,886行)
│   │   ├── chatService.js     # AIチャット & 会話履歴管理
│   │   ├── mascotService.js   # マスコット状態 & リアクション
│   │   ├── weatherService.js  # 天気データ処理
│   │   ├── nlpService.js      # 自然言語解析
│   │   └── responseGenerator.js # 高度応答生成
│   ├── Laravel/               # 管理システム
│   │   └── weather-admin/     # Laravel管理パネル
│   │       ├── Dockerfile     # 🐳 PHP+Laravel環境
│   │       └── docker/        # 設定ファイル群
│   └── weather_app.db         # SQLite データベース
├── Frontend/                   # フロントエンド
│   ├── Dockerfile             # 🐳 Nginx静的配信
│   └── docker-nginx.conf      # Nginx設定
├── docker-compose.yml         # 🐳 マルチサービス定義
├── start.sh                   # 🚀 ワンクリック起動
└── Prototype/                 # プロトタイプ・実験
```

## 🔄 更新履歴

### � v2.4 - 認証システム完全修復・データベース統合 (2026年1月29日)
#### 🌟 重要な修正・改良
- **🔐 認証システム完全修復**: サインアップ/サインイン機能が正常に動作
- **🗄️ データベース統合**: Node.js + Laravel で統一されたusersテーブル構造
- **⚠️ 構文エラー修正**: dbUtils.jsの認証関数の構文問題を完全解決
- **🔒 権限問題解決**: SQLite書き込み権限エラー（SQLITE_READONLY）を修正

#### 🛠️ 技術的改善点
- **テーブル作成改善**: usersテーブルをLaravel互換形式で自動作成
- **データベース権限管理**: nextjs:nodejs権限でのSQLite読み書き対応
- **エラーハンドリング強化**: 認証プロセスの詳細ログ出力
- **API動作確認**: プロキシ経由とダイレクト両方での認証テスト完了

#### ✅ 動作確認済み機能
- **サインアップ**: `POST /api/auth/signup` - ユーザー登録とJWTトークン発行
- **サインイン**: `POST /api/auth/signin` - 認証とトークン生成
- **ユーザー確認**: `GET /api/debug/users` - データベース保存状況確認
- **フロントエンド**: Nginxプロキシ経由での認証API呼び出し

#### 📊 現在のデータベース状況
```bash
# ユーザー確認コマンド
curl http://localhost:3001/api/debug/users

# 現在保存済みユーザー数: 3名
# - testuser5@example.com (ID:1)  
# - testuser6@example.com (ID:2)
# - example@gmail.com/tabata (ID:3)
```

### �🐳 v2.3 - Docker環境改良・API修正 (2026年1月23日)
#### 🔧 重要な修正・改良
- **🔄 APIエンドポイント修正**: `/api`エンドポイントが正常に動作するよう修正
- **🐳 Docker環境安定化**: コンテナ再起動・ビルド手順の改善
- **📊 エラーハンドリング強化**: 404エラーハンドラーの重複削除と最適化
- **🔍 デバッグ機能向上**: より詳細なログ出力とエラー追跡

#### 🛠️ 技術的改善点
- **Docker イメージ再構築**: `--no-cache`オプションによる確実なビルド
- **ルーティング最適化**: Express.jsルート定義の順序と構造改善
- **コンテナ管理**: `docker compose down` → `build` → `up`の標準化
- **API情報エンドポイント**: `/api` で利用可能な全エンドポイント一覧表示

#### 📋 修正されたAPIエンドポイント
- ✅ `GET /api` - API情報とエンドポイント一覧
- ✅ `GET /api/weather/city/:city` - 都市別天気情報
- ✅ `POST /api/mascot/chat` - AIチャット機能
- ✅ その他すべてのAPIエンドポイント

### 🐳 v2.2 - Docker化対応 (2026年1月23日)
#### 🌟 主要な新機能
- **🐳 完全Docker化**: 1コマンドで全環境構築
- **🔄 自動データベース初期化**: SQLite自動セットアップ
- **📦 マルチサービス対応**: Backend + Frontend + Admin の統合
- **💾 データ永続化**: Dockerボリュームによるデータ保持
- **🛠️ 開発・本番両対応**: 環境切り替え可能

#### 📁 追加ファイル
- `docker-compose.yml` - マルチサービス構成定義
- `start.sh` - ワンクリック起動スクリプト
- `Backend/Dockerfile` - Node.js環境構築
- `Backend/docker-entrypoint.sh` - DB初期化スクリプト
- `Frontend/Dockerfile` - Nginx静的配信
- `Backend/Laravel/weather-admin/Dockerfile` - PHP+Laravel環境

#### ✨ 審査官・評価者向け改善
- 環境構築不要（Docker Desktopのみ）
- 全機能の一括テスト可能
- データベース自動初期化
- ログ・デバッグ機能強化

### ✨ v2.1 - インタラクティブデモページ実装 (2026年1月22日)
#### 🌟 主要な新機能
- **🌐 統合デモページ**: 天気情報とAIチャットの完全統合インターフェース
- **🏙️ リアルタイム都市選択**: 5都市（東京、大阪、名古屋、札幌、福岡）の即座切り替え
- **💬 ライブチャット**: タイピングインジケーター付きインタラクティブUI
- **🎭 動的マスコット**: 天気条件に応じたキャラクター表情変化
- **📱 レスポンシブ対応**: モバイル・タブレット・デスクトップ最適化

#### 📁 ファイル追加
- `Backend/demo.html` - 完全統合デモページ (666行)
- 会話履歴サポート付きAIチャット機能
- スムーズなローディングアニメーション
- エラーハンドリング強化

#### 🚀 技術向上
- フェッチAPI統合によるシームレスなデータ取得
- CSSグリッドレイアウトによる美しいUI設計
- JavaScriptモジュール化によるコード整理

### 🚀 v2.0 - 自然な会話AI実装 (2025年12月18日)
#### 🌟 主要な改善点
- **🤖 Gemmaモデル統合**: Gemma-3-1b-itによる高度な自然言語処理を実装
- **💬 自然な会話機能**: ユーザーの感情や意図を理解した共感的な応答システム
- **🎯 正確な天気判定**: 実際の天気データに基づく正確な回答システム
- **🔧 デバッグ強化**: AIプロンプトとレスポンスの詳細ログ機能

#### ✨ 新機能
- 天気データを正確に解釈する高度なプロンプトエンジニアリング
- 降水量・降水確率を考慮した精密な天気判定
- ユーザーの質問内容に惑わされない真実ベースの応答
- 完全日本語対応（英語回答の排除）

#### 🛠️ 技術的改善
- `chatService.js`: Geminiプロンプトの最適化とデバッグ機能強化
- `weatherService.js`: 天気APIレスポンスの詳細ログ追加
- SQLiteデータベース: 会話履歴の蓄積と改善

#### 🎭 AIキャラクター向上
- **そらちゃん**: より親しみやすく自然な会話パターン
- 絵文字の適切な使用による親近感向上
- ユーザー名正規化による自然な呼びかけ

---

## �🔧 技術スタック

### 🚀 AI & NLP
- **Gemma-3-1b-it**: 最新Google AIモデル (コスト効率的)
- **Natural.js**: 自然言語処理
- **Compromise.js**: 高度な言語分析・構文解析
- **感情分析**: リアルタイム感情認識

### ⚡ バックエンド
- **Node.js + Express.js**: 高性能RESTful API
- **SQLite**: 軽量データベース (会話履歴・ユーザープロファイル)
- **モジュラー設計**: 保守性・拡張性重視
- **🐳 Docker対応**: コンテナ化による環境統一

### 🎨 管理システム
- **Laravel 12.x**: 現代的な管理ダッシュボード
- **Tailwind CSS**: レスポンシブUI
- **Chart.js**: データ可視化
- **🐳 Docker統合**: PHP-FPM + Nginx

### 🌐 外部API
- **Weathernews API**: 1km精度のリアルタイム天気データ
- **Google Gemini API**: 最新AI言語モデル

## 🚀 クイックスタート

### 🐳 Docker環境での起動 (推奨・審査官向け)

Docker環境なら**環境構築不要**で1コマンドで全サービスが起動します：

```bash
# 1. 実行権限の設定
chmod +x start.sh

# 2. 全サービス起動（自動でビルド＆起動）
./start.sh

# 3. アクセス先
# 📱 メインデモ:    http://localhost:3000/demo.html
# 🌐 フロントエンド: http://localhost:8080
# 🔧 管理画面:      http://localhost:8000
# 📊 API:          http://localhost:3000/api
```

### 💻 VS Code Dev Containers での開発 (NEW!)

**統合開発環境**でコンテナ内開発ができます：

```bash
# 1. VS Codeでプロジェクトを開く
code .

# 2. コマンドパレット: Cmd+Shift+P (Mac) / Ctrl+Shift+P (Windows)
# 「Dev Containers: Reopen in Container」を実行

# 3. 自動で以下が実行されます:
# ✅ 全サービスのコンテナ起動
# ✅ 開発ツールの自動インストール (git, curl, nano, vim, tree, htop)
# ✅ VS Code拡張機能の自動インストール
# ✅ npm/composer install の実行
# ✅ ポートフォワーディング (3001, 8000, 8080)
```

#### 🛠️ Dev Containers の特徴
- **🔧 統合開発**: Frontend/Backend/Laravel を一つのコンテナで編集
- **📦 自動セットアップ**: 必要な依存関係とツールを自動インストール
- **🌐 ポートフォワーディング**: すべてのサービスに直接アクセス
- **⚡ ホットリロード**: ファイル変更の即座反映
- **🔍 統合デバッグ**: VS Code内でのデバッグ・ログ表示

#### 📋 必要なもの
- **VS Code** + **Dev Containers拡張機能**
- **Docker Desktop** (Windows/Mac) または **Docker Engine** (Linux)

---

#### 🐳 Docker環境の特徴
- ✅ **環境依存なし**: Node.js、PHP、データベース等の個別インストール不要
- ✅ **自動データベース初期化**: SQLiteデータベースの自動作成・テーブル構築
- ✅ **永続化対応**: ユーザーデータ・チャット履歴が保持される
- ✅ **ワンクリック削除**: `docker-compose down -v` で完全クリーンアップ

#### 🛠️ Docker管理コマンド
```bash
# サービス状態確認
docker-compose ps

# ログ確認
docker-compose logs -f

# サービス停止
docker-compose down

# データ含めて完全削除
docker-compose down -v --rmi all --remove-orphans

# 再起動（修正後など）
docker-compose restart
```

#### 📋 必要な環境
- **Docker Desktop** (Windows/Mac) または **Docker Engine** (Linux)
- **Docker Compose** v2.0+

---

### 🛠️ 従来環境での起動（開発者向け）

#### 🌟 デモページ体験 (最速)
```bash
cd Backend
npm install
npm run dev
# ブラウザで http://localhost:3001/demo.html にアクセス
# → 統合デモページを即座に体験！
```

#### 1. 環境変数設定

```bash
cd Backend
cp .env.example .env
# GEMINI_API_KEY=your_api_key_here を設定
# WEATHERNEWS_API_KEY=your_api_key_here を設定
```

#### 2. バックエンドAPI起動

```bash
cd Backend
npm install
npm run dev  # または node server.js
# → http://localhost:3001
```

#### 3. 管理システム起動 (オプション)

```bash
cd Backend/Laravel/weather-admin
composer install
php artisan serve --port=8080
# → http://localhost:8080
```

## 🎯 API エンドポイント

### 🌟 デモページ
- `GET /demo.html` - **統合デモページ** (天気情報 + AIチャット)

### � API情報
- `GET /api` - **API情報一覧** - 利用可能な全エンドポイントとサービス状態

### 💬 チャット機能
- `POST /api/mascot/chat` - AIチャット (Gemma-3-1b-it)
- `GET /api/chat/history/:userId` - 会話履歴取得

### 🌤️ 天気情報
- `GET /api/weather/:lat/:lon` - 緯度経度指定天気取得
- `GET /api/weather/city/:city` - 都市名天気取得（tokyo, osaka, kyoto, など）

### 🎭 マスコット機能
- `POST /api/mascot/update` - マスコット状態更新
- `GET /api/mascot/:id` - マスコット情報取得

### 👤 ユーザー管理
- `POST /api/user/profile` - ユーザープロフィール設定
- `GET /api/user/profile/:userId` - ユーザープロフィール取得

## 📊 データベース構造

### 🗣️ チャット履歴 (`chat_history`)
```sql
- id: INTEGER PRIMARY KEY
- user_id: TEXT (ユーザー識別子)
- user_message: TEXT (ユーザーメッセージ)
- bot_response: TEXT (AI応答)
- intent: TEXT (意図分析: fatigue_support, weather_inquiry, etc.)
- sentiment: TEXT (感情分析: positive, negative, neutral)
- weather_data: TEXT (関連天気データ)
- created_at: DATETIME
```

### 👤 ユーザープロファイル (`user_profiles`)
```sql
- user_id: TEXT PRIMARY KEY
- user_name: TEXT
- temperature_preference: TEXT (温度設定)
- activity_preference: TEXT (活動設定) 
- style_preference: TEXT (会話スタイル)
- weather_sensitivity: TEXT (天気感度)
- favorite_activities: TEXT (好みの活動)
```

### 🌦️ 天気ログ (`weather_logs`)
```sql
- id: INTEGER PRIMARY KEY
- location: TEXT (地域情報)
- weather_data: TEXT (天気データJSON)
- created_at: DATETIME
```

## 🌟 主要機能詳細

### 🤖 AIチャットシステム
- **Gemma-3-1b-it統合**: Google製最新AIモデル
- **感情解析**: ポジティブ/ネガティブ/中性の認識
- **疲労サポート**: 「疲れた」「だるい」などの表現に共感的応答
- **コンテキスト理解**: 会話の流れを把握した対話
- **パーソナライゼーション**: ユーザー設定に基づく最適化

### 🌦️ 天気情報連携
- **Weathernews API**: 1km精度のプロフェッショナル気象データ
- **リアルタイム予報**: 短期・中期予報の詳細情報
- **活動提案**: 天気に応じた服装・行動アドバイス
- **地域対応**: 全国の詳細な地点別天気情報

### 📊 管理ダッシュボード (Laravel)
- **ユーザー管理**: プロファイル編集・削除・検索
- **チャット分析**: 感情・インテント統計の可視化
- **天気データ管理**: 履歴・ログの確認・分析
- **CSVエクスポート**: 全データの一括ダウンロード

## 💡 使用例

### チャット例
```bash
curl -X POST http://localhost:3001/api/mascot/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "今日疲れた...",
    "userName": "田中さん",
    "userId": "user123"
  }'

# 応答例:
{
  "response": "田中さん、お疲れ様でした！今日も頑張りましたね✨ 温かいお茶でも飲んで、ゆっくり休んでくださいね。",
  "mood": "caring",
  "suggestions": ["温かい飲み物", "軽いストレッチ", "好きな音楽"]
}
```

### 天気取得例
```bash
curl "http://localhost:3001/api/weather/city/東京"

# 応答: 詳細な天気データ + マスコット情報
```

## 📈 開発ロードマップ

### ✅ Phase 1: AIチャット基盤 (完了)
- [x] Gemma-3-1b-it AI統合
- [x] モジュラー設計実装
- [x] 会話履歴システム
- [x] 感情・インテント分析
- [x] SQLiteデータベース構築
- [x] **統合デモページ** - リアルタイム都市選択 + AIチャット

### 🚧 Phase 2: フロントエンド開発 (進行中)
- [ ] React/Vue.js UI実装
- [ ] リアルタイムチャット画面
- [ ] マスコットアニメーション
- [ ] レスポンシブデザイン

### 🎯 Phase 3: 高度機能 (計画中)
- [ ] 音声対話機能
- [ ] プッシュ通知システム  
- [ ] 多言語対応
- [ ] マシンラーニング予測

## 🛠️ 開発環境

### 🐳 Docker環境（推奨）
- **Docker Desktop** v4.0+ (Windows/Mac) または **Docker Engine** (Linux)
- **Docker Compose** v2.0+
- **Git** - ソースコード取得

#### Docker環境の利点
- ✅ **統一環境**: 開発・本番・審査環境の完全一致
- ✅ **依存関係解決**: Node.js、PHP、データベース等の自動インストール
- ✅ **即座起動**: `./start.sh` 一発で全サービス起動
- ✅ **クリーンアップ**: 環境汚染なし、簡単削除

### 🛠️ 従来環境（開発者向け）
#### 必要な環境
- **Node.js**: v18.0.0+
- **npm**: v8.0.0+
- **PHP**: v8.1+ (Laravel管理システム用)
- **Composer**: v2.0+ (Laravel依存関係)

#### 推奨開発ツール
- **VSCode**: エディタ
- **Postman**: API testing
- **SQLite Browser**: データベース管理

## 🔧 トラブルシューティング

### Docker環境での問題

**Q: APIエンドポイントが見つからない（404エラー）**
```bash
# 解決方法: コンテナを完全に再構築
docker compose down              # 全コンテナ停止
docker compose build --no-cache  # キャッシュなしでビルド
docker compose up -d             # バックグラウンドで起動

# 動作確認
curl http://localhost:3001/api   # API情報表示
curl http://localhost:3001/api/weather/city/tokyo  # 天気情報テスト
```

**Q: Dockerコンテナが起動しない**
```bash
# Docker Desktop起動確認
docker --version
docker-compose --version

# ポート競合確認（3001, 8000, 8080）
lsof -i :3001
lsof -i :8000
lsof -i :8080

# 既存コンテナ停止
docker compose down -v
./start.sh  # 再起動
```

**Q: データベースエラー**
```bash
# ログ確認
docker logs weather-backend

# データボリューム削除して再初期化
docker compose down -v
docker compose up --build
```

**Q: コンテナがunhealthy状態**
```bash
# ヘルスチェック確認
docker ps  # STATUS列を確認

# 詳細ログ確認
docker logs weather-backend --tail 20

# 必要に応じて再構築
docker compose restart weather-backend
```

**Q: 権限エラー（start.sh実行時）**
```bash
# 実行権限付与
chmod +x start.sh
chmod +x Backend/docker-entrypoint.sh
chmod +x Backend/Laravel/weather-admin/docker/laravel-entrypoint.sh
```

### 従来環境での問題

**Q: Gemini APIエラーが発生する**
```bash
# .envファイルでAPIキー確認
GEMINI_API_KEY=your_actual_api_key

# APIキー取得: https://aistudio.google.com/app/apikey
```

**Q: 天気データが取得できない**
```bash
# Weathernews APIキー設定確認
WEATHERNEWS_API_KEY=your_weathernews_key
```

**Q: データベースエラー**
```bash
# データベースファイル権限確認
chmod 664 Backend/weather_app.db
```

## 🤝 貢献・開発参加

プロジェクトへの貢献を歓迎します！

### 貢献方法
1. リポジトリをフォーク
2. フィーチャーブランチ作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)  
5. プルリクエスト作成

### 開発ガイドライン
- **コードスタイル**: ESLint + Prettier準拠
- **コミットメッセージ**: [Conventional Commits](https://conventionalcommits.org/)形式
- **テスト**: 新機能には必ずテストを追加

## 📞 サポート・連絡先

- **Issue報告**: [GitHub Issues](https://github.com/your-repo/issues)
- **機能要望**: [Feature Requests](https://github.com/your-repo/issues)
- **質問・議論**: [Discussions](https://github.com/your-repo/discussions)

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

---

**🌟 Star this repo if you find it helpful!**

このプロジェクトはMITライセンスの下で公開されています。

## 👥 開発チーム

- **田端** - プロジェクトリード・フルスタック開発
- **舟橋** - UI/UX ・ AIキャラクター 担当
- **近藤・前田** - フロントエンド ・ 発表 担当

---

*最終更新: 2026年1月23日 - v2.3 Docker環境改良・API修正*
