# 🌤️ Weather Mascot App

天気マスコットアプリケーション - インタラクティブなマスコットと天気情報を組み合わせた対話型システム

## 📖 プロジェクト概要

天気情報とマスコットのインタラクションを組み合わせた革新的なWebアプリケーション。ミッション機能、名前変更、マスコットのケアなど、豊富な機能で楽しい天気体験を提供します。

## ✨ 最新機能 (v2.1 - 2026年2月1日更新)

### 🎮 インタラクティブマスコット
- **名前変更機能**: マスコットの名前をカスタマイズ可能（サーバー永続化対応）
- **ミッションシステム**: 日次タスクでゲーミフィケーション体験
- **マスコット状態管理**: レベル、体力、幸福度の詳細表示
- **リアルタイム同期**: サーバーとローカルストレージの完全同期

### 🌤️ 天気情報システム
- **動的背景**: 天気に応じたリアルタイム背景変更
- **詳細天気データ**: 温度、湿度、風速、気圧の多項目表示
- **マスコット連動**: 天気状況でマスコットの感情・状態が変化
- **Weathernews連携**: 外部リンクで詳細天気情報にアクセス

### 💻 技術的改善（2026年2月1日）
- **✅ API通信最適化**: エラーハンドリングとフォールバック機能実装
- **✅ パフォーマンス向上**: デバッグログ最適化で起動・動作速度向上
- **✅ 構文エラー解消**: JavaScript/CSS の完全な動作保証
- **✅ レスポンシブUI**: モバイル・デスクトップ完全対応

## 🚀 クイックスタート

### 必要環境
- Docker & Docker Compose
- ブラウザ（Chrome、Firefox、Safari対応）

### 起動方法
```bash
# リポジトリのクローン
git clone <repository-url>
cd weather_app

# 簡単起動（推奨）
./start.sh

# または手動起動
docker compose down
docker compose up --build
```

### アクセス先
- **🎯 メインアプリ**: http://localhost:8080/mascot_page.html
- **⚙️ Laravel管理**: http://localhost:8000
- **🌤️ 天気API**: http://localhost:3001

## 📁 プロジェクト構造

```
weather_app/
├── Backend/                    # バックエンドシステム
│   ├── server.js              # Node.js APIサーバー
│   ├── modules/               # 専門モジュール群
│   │   ├── chatService.js     # AIチャット機能
│   │   ├── mascotService.js   # マスコット管理
│   │   ├── weatherService.js  # 天気データ処理
│   │   ├── nlpService.js      # 自然言語処理
│   │   └── responseGenerator.js # 応答生成
│   └── Laravel/               # Laravel管理システム
│       └── weather-admin/     # 管理パネル・API
│           ├── app/Http/Controllers/ # API controllers
│           ├── routes/api.php # API ルート定義
│           └── database/      # DB設計
├── Frontend/                   # フロントエンドUI
│   ├── mascot_page.html       # 🎯 メインアプリページ
│   ├── js/                    # JavaScript モジュール
│   │   ├── pages/             # ページコントローラー
│   │   │   └── mascot_page.js # メインページロジック
│   │   ├── modules/           # UI コンポーネント
│   │   │   ├── mascotDisplay.js # マスコット表示制御
│   │   │   └── missionManager.js # ミッション管理
│   │   └── utils/             # ユーティリティ
│   │       └── apiClient.js   # API通信クライアント
│   ├── css/                   # スタイルシート
│   │   ├── main.css           # 基本スタイル
│   │   ├── mascot_page.css    # マスコットページ専用
│   │   └── weather-background.css # 天気背景
│   └── img/                   # 画像アセット
├── docker-compose.yml         # Docker サービス定義
└── start.sh                   # 簡単起動スクリプト
```

## 🎮 主な機能

### マスコットインタラクション
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

## 🤝 貢献方法

1. このリポジトリをフォーク
2. 新機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📜 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

---

**🌟 楽しい天気マスコット生活をお楽しみください！ 🌟**