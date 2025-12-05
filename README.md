# 🌤️ Weather Mascot App

天気マスコットアプリケーション - AIチャットと天気情報を組み合わせた対話型システム

## 📖 プロジェクト概要

このプロジェクトは、天気情報とAIチャットを組み合わせた革新的なアプリケーションです。ユーザーの疲労度や感情を理解し、個人に最適化された天気情報と提案を提供します。

### 🎯 主な機能

- **AIチャット**: 自然言語処理による対話システム
- **天気情報**: Weathernews API連携による正確な天気データ
- **感情分析**: ユーザーの感情や疲労度を分析
- **個人化**: ユーザープロファイルによるカスタマイズ
- **管理システム**: Laravel製の包括的な管理ダッシュボード

## 🏗️ アーキテクチャ

```
weather_app/
├── Backend/           # バックエンドシステム
│   ├── server.js     # Node.js API サーバー
│   ├── Laravel/      # Laravel 管理システム
│   └── weather_app.db # SQLite データベース
├── Front/            # フロントエンド (予定)
└── Prototype/        # プロトタイプ・実験
```

### 🔧 技術スタック

#### バックエンド
- **Node.js + Express.js**: RESTful API
- **SQLite**: データベース
- **Natural.js**: 自然言語処理
- **Compromise.js**: 高度な言語分析

#### 管理システム
- **Laravel 12.x**: 管理ダッシュボード
- **Tailwind CSS**: スタイリング
- **Chart.js**: データ可視化

#### 外部API
- **Weathernews API**: リアルタイム天気データ

## 🚀 セットアップ & 起動

### 1. バックエンドAPI (Node.js)

```bash
cd Backend
npm install
node server.js
# → http://localhost:3000
```

### 2. 管理システム (Laravel)

```bash
cd Backend/Laravel/weather-admin
composer install
php artisan serve --port=8080
# → http://localhost:8080
```

## 📊 データベース構造

### ユーザープロファイル (`user_profiles`)
- `user_id`: ユーザー識別子
- `user_name`: ユーザー名
- `temperature_preference`: 温度設定
- `activity_preference`: 活動設定
- `style_preference`: 会話スタイル
- `weather_sensitivity`: 天気感度
- `favorite_activities`: 好みの活動

### チャット履歴 (`chat_history`)
- `user_id`: ユーザー識別子
- `user_message`: ユーザーメッセージ
- `bot_response`: AI応答
- `intent`: インテント分析結果
- `sentiment`: 感情分析結果
- `weather_data`: 天気データ

## 🌟 主要機能詳細

### AIチャットシステム
- **自然言語処理**: 日本語対応の高度な言語理解
- **疲労検出**: 「疲れたなー」などのカジュアル表現認識
- **コンテキスト保持**: 会話の文脈を理解
- **個人化応答**: ユーザー設定に基づく最適化

### 天気情報連携
- **Weathernews API**: プロフェッショナル気象データ
- **地点別予報**: 詳細な地域天気情報
- **活動提案**: 天気に応じた行動アドバイス

### 管理ダッシュボード
- **ユーザー管理**: プロファイル編集・削除
- **チャット分析**: 感情・インテント統計
- **データ可視化**: グラフ・チャートによる洞察
- **CSVエクスポート**: データのダウンロード

## 🔗 API エンドポイント

### ユーザー管理
- `POST /api/users/profile` - プロファイル作成・更新
- `GET /api/users/profile/:userId` - プロファイル取得

### チャット
- `POST /api/chat` - チャット送信
- `GET /api/chat/history/:userId` - 履歴取得

### 天気情報
- `GET /api/weather/:location` - 天気取得

## 📈 開発ロードマップ

### Phase 1: ✅ 完了
- [x] Node.js APIサーバー構築
- [x] SQLiteデータベース統合
- [x] 自然言語処理実装
- [x] Weathernews API連携
- [x] Laravel管理システム
- [x] 疲労度検出機能

### Phase 2: 🚧 開発中
- [ ] フロントエンドUI構築
- [ ] 音声入力対応
- [ ] リアルタイム通知

### Phase 3: 📋 計画中
- [ ] 機械学習による予測
- [ ] マルチユーザー対応
- [ ] モバイルアプリ

## 🤝 貢献

プロジェクトへの貢献を歓迎します！

1. リポジトリをフォーク
2. フィーチャーブランチ作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエスト作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 👥 開発チーム

- **田端** - プロジェクトリード・フルスタック開発
- **舟橋** - UI/UX ・ AIキャラクター 担当
- **近藤・前田** - フロントエンド ・ 発表 担当

---

*最終更新: 2025年12月5日*
