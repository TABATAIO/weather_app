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

### � インタラクティブデモ
- **統合デモページ**: 天気情報とAIチャットの完全統合UI
- **リアルタイム都市選択**: 東京、大阪、名古屋、札幌、福岡の即座切り替え
- **レスポンシブデザイン**: モバイル・デスクトップ最適化
- **ライブマスコット**: 天気に応じた動的キャラクター表示

### �🏗️ モジュラーアーキテクチャ
- **完全モジュール化**: 5つの専門モジュールによる保守性向上
- **コード最適化**: server.js 2042行 → 1672行 (370行削減)
- **エラーハンドリング**: 堅牢なフォールバックシステム

```
weather_app/
├── Backend/                    # バックエンドシステム
│   ├── server.js              # メインAPIサーバー (1,672行)
│   ├── demo.html              # 🌟 統合デモページ (666行)
│   ├── modules/               # 専門モジュール (1,886行)
│   │   ├── chatService.js     # AIチャット & 会話履歴管理
│   │   ├── mascotService.js   # マスコット状態 & リアクション
│   │   ├── weatherService.js  # 天気データ処理
│   │   ├── nlpService.js      # 自然言語解析
│   │   └── responseGenerator.js # 高度応答生成
│   ├── Laravel/               # 管理システム
│   └── weather_app.db         # SQLite データベース
├── Front/                     # フロントエンド (開発中)
└── Prototype/                 # プロトタイプ・実験
```

## 🔄 更新履歴

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

### 🎨 管理システム
- **Laravel 12.x**: 現代的な管理ダッシュボード
- **Tailwind CSS**: レスポンシブUI
- **Chart.js**: データ可視化

### 🌐 外部API
- **Weathernews API**: 1km精度のリアルタイム天気データ
- **Google Gemini API**: 最新AI言語モデル

## 🚀 クイックスタート

### 🌟 デモページ体験 (最速)
```bash
cd Backend
npm install
npm run dev
# ブラウザで http://localhost:3001/demo.html にアクセス
# → 統合デモページを即座に体験！
```

### 1. 環境変数設定

```bash
cd Backend
cp .env.example .env
# GEMINI_API_KEY=your_api_key_here を設定
# WEATHERNEWS_API_KEY=your_api_key_here を設定
```

### 2. バックエンドAPI起動

```bash
cd Backend
npm install
npm run dev  # または node server.js
# → http://localhost:3001
```

### 3. 管理システム起動 (オプション)

```bash
cd Backend/Laravel/weather-admin
composer install
php artisan serve --port=8080
# → http://localhost:8080
```

## 🎯 API エンドポイント

### 🌟 デモページ
- `GET /demo.html` - **統合デモページ** (天気情報 + AIチャット)

### 💬 チャット機能
- `POST /api/mascot/chat` - AIチャット (Gemma-3-1b-it)
- `GET /api/chat/history/:userId` - 会話履歴取得

### 🌤️ 天気情報
- `GET /api/weather/coordinates` - 座標指定天気取得
- `GET /api/weather/city/:cityName` - 都市名天気取得

### 🎭 マスコット機能
- `POST /api/mascot/update` - マスコット状態更新
- `GET /api/mascot/:id` - マスコット情報取得
- `GET /api/icon/:weatherCode` - 天気アイコン取得

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

### 必要な環境
- **Node.js**: v18.0.0+
- **npm**: v8.0.0+
- **PHP**: v8.1+ (Laravel管理システム用)
- **Composer**: v2.0+ (Laravel依存関係)

### 推奨開発ツール
- **VSCode**: エディタ
- **Postman**: API testing
- **SQLite Browser**: データベース管理

## 🔧 トラブルシューティング

### よくある問題

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

*最終更新: 2026年1月22日 - v2.1 インタラクティブデモページ実装*
