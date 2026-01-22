/**
 * マスコットページのメイン制御クラス
 */
class MascotPage {
    constructor() {
        this.isInitialized = false;
        this.currentWeatherData = null;
        this.init();
    }

    /**
     * ページ初期化
     */
    async init() {
        if (this.isInitialized) return;

        try {
            // DOM読み込み完了まで待機
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
            } else {
                this.initializeComponents();
            }
        } catch (error) {
            console.error('ページ初期化エラー:', error);
        }
    }

    /**
     * コンポーネント初期化
     */
    async initializeComponents() {
        try {
            // 基本UI設定
            this.setupBasicUI();

            // 天気データを取得して背景を設定
            await this.loadWeatherAndUpdateBackground();

            // マスコット初期状態を設定
            this.initializeMascotStatus();

            // チャット機能の初期化
            this.initializeChatInterface();

            // ミッション機能の初期化
            this.initializeMissionManager();

            // イベントリスナーの設定
            this.setupEventListeners();

            // 初回メッセージの設定
            this.setInitialAiMessage();

            // 日次ミッションリセットのチェック
            if (window.missionManager) {
                missionManager.resetDailyMissions();
            }

            this.isInitialized = true;
            console.log('マスコットページの初期化が完了しました');

        } catch (error) {
            console.error('コンポーネント初期化エラー:', error);
        }
    }

    /**
     * 基本UI設定
     */
    setupBasicUI() {
        // 現在時刻を表示
        this.updateCurrentTime();
        
        // 定期的な時刻更新
        setInterval(() => this.updateCurrentTime(), 60000);

        // バックボタンの設定
        const backButton = document.getElementById('backButton');
        if (backButton) {
            backButton.addEventListener('click', () => this.goBack());
        }

        // マスコット名編集ボタン
        const editNameBtn = document.querySelector('.edit-name-btn');
        if (editNameBtn) {
            editNameBtn.addEventListener('click', () => this.editMascotName());
        }
    }

    /**
     * 現在時刻を更新
     */
    updateCurrentTime() {
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            timeElement.textContent = formatTime();
        }
    }

    /**
     * 戻るボタンの処理
     */
    goBack() {
        // history.back()またはindex.htmlへのリダイレクト
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = 'index.html';
        }
    }

    /**
     * 天気データを読み込み背景を更新
     */
    async loadWeatherAndUpdateBackground() {
        try {
            // 天気データを取得
            this.currentWeatherData = await apiClient.getWeatherData();
            
            if (this.currentWeatherData && window.weatherBackground) {
                weatherBackground.updateBackground(this.currentWeatherData);
                
                // 天気チェックミッションの進行
                if (window.missionManager) {
                    missionManager.onGameEvent('weather_check', this.currentWeatherData);
                }
            }

        } catch (error) {
            console.warn('天気データの取得に失敗しました:', error);
            
            // デフォルト背景を設定
            if (window.weatherBackground) {
                weatherBackground.setDefaultBackground();
            }
        }
    }

    /**
     * マスコットの初期状態を設定
     */
    initializeMascotStatus() {
        if (!window.mascotDisplay) return;

        // 保存された状態を読み込み、なければデフォルト値
        const savedStatus = Storage.get('mascotStatus') || {
            level: 1,
            health: 75,
            fullness: 25, // 25% = 1つ星
            mood: '遊びたい気分！',
            emotion: 'normal'
        };

        mascotDisplay.updateStatus(savedStatus);
    }

    /**
     * チャット機能初期化
     */
    initializeChatInterface() {
        if (!window.chatInterface) return;

        // チャットイベントのリスナーを設定
        document.addEventListener('chatSent', (event) => {
            // チャットミッションの進行
            if (window.missionManager) {
                missionManager.onGameEvent('chat', event.detail);
            }
        });
    }

    /**
     * ミッション管理初期化
     */
    initializeMissionManager() {
        if (!window.missionManager) return;

        // ミッション完了イベントのリスナー
        document.addEventListener('missionCompleted', (event) => {
            this.onMissionCompleted(event.detail);
        });
    }

    /**
     * イベントリスナー設定
     */
    setupEventListeners() {
        // マスコットクリック時の特別な処理
        const mascot = document.getElementById('mascot');
        if (mascot) {
            mascot.addEventListener('click', () => this.onMascotInteraction());
        }

        // ページ非表示時の状態保存
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveCurrentState();
            }
        });

        // ページ離脱時の状態保存
        window.addEventListener('beforeunload', () => {
            this.saveCurrentState();
        });

        // タッチガイドの非表示（一定時間後）
        setTimeout(() => {
            const touchGuide = document.getElementById('touchGuide');
            if (touchGuide) {
                Animation.fadeOut(touchGuide);
            }
        }, 5000);
    }

    /**
     * マスコットインタラクション時の処理
     */
    onMascotInteraction() {
        // ランダムなリアクション
        const reactions = [
            () => mascotDisplay.playTapAnimation(),
            () => mascotDisplay.playHappyAnimation(),
            () => this.showRandomMessage()
        ];

        const randomReaction = getRandomItem(reactions);
        randomReaction();

        // 満腹度をわずかに回復（遊び効果）
        this.updateMascotFullness(2);

        // インタラクション回数をカウント
        const interactionCount = Storage.get('interactionCount') || 0;
        Storage.set('interactionCount', interactionCount + 1);
    }

    /**
     * ランダムメッセージを表示
     */
    showRandomMessage() {
        const messages = [
            'わーい！遊んでくれてありがとう♪',
            'きゃー！くすぐったいよ〜',
            'もっと遊ぼうよ！',
            '嬉しいな〜♪',
            'あはは〜楽しい！'
        ];

        const message = getRandomItem(messages);
        if (window.chatInterface) {
            chatInterface.setInitialMessage(message);
        }
    }

    /**
     * 初回AIメッセージ設定
     */
    setInitialAiMessage() {
        if (!window.chatInterface) return;

        const weatherMessage = this.getWeatherBasedGreeting();
        chatInterface.setInitialMessage(weatherMessage);
    }

    /**
     * 天気に基づく挨拶メッセージ
     */
    getWeatherBasedGreeting() {
        if (!this.currentWeatherData || !this.currentWeatherData.current) {
            return 'こんにちは！今日も一緒に過ごそうね♪';
        }

        const weather = this.currentWeatherData.current.weather;
        const temperature = this.currentWeatherData.current.temperature;

        if (weather.includes('晴')) {
            if (temperature > 25) {
                return '昼間は暖かいけど夜は寒いから気をつけてね！！';
            } else {
                return 'いい天気だね！お散歩日和だよ♪';
            }
        } else if (weather.includes('雨')) {
            return '雨の日は家でまったりしようね〜';
        } else if (weather.includes('雪')) {
            return '雪だー！雪だるま作りたいな♪';
        } else if (weather.includes('曇')) {
            return '曇り空だけど、一緒にいれば楽しいよ♪';
        }

        return '今日もよろしくお願いします！';
    }

    /**
     * ミッション完了時の処理
     */
    onMissionCompleted(missionData) {
        // 経験値でレベルアップチェック
        this.checkLevelUp();
        
        // 報酬に応じたマスコット状態更新
        if (missionData.rewards) {
            if (missionData.rewards.experience) {
                this.addExperience(missionData.rewards.experience);
            }
        }
    }

    /**
     * 経験値追加
     */
    addExperience(exp) {
        const currentExp = Storage.get('mascotExperience') || 0;
        const newExp = currentExp + exp;
        Storage.set('mascotExperience', newExp);

        // レベルアップ判定
        this.checkLevelUp();
    }

    /**
     * レベルアップチェック
     */
    checkLevelUp() {
        const currentExp = Storage.get('mascotExperience') || 0;
        const currentLevel = Storage.get('mascotLevel') || 1;
        
        // 必要経験値 = レベル * 100
        const requiredExp = currentLevel * 100;
        
        if (currentExp >= requiredExp) {
            const newLevel = currentLevel + 1;
            Storage.set('mascotLevel', newLevel);
            
            if (window.mascotDisplay) {
                mascotDisplay.updateLevel(newLevel);
                mascotDisplay.playHappyAnimation();
            }

            this.showLevelUpNotification(newLevel);
        }
    }

    /**
     * レベルアップ通知
     */
    showLevelUpNotification(newLevel) {
        const notification = document.createElement('div');
        notification.className = 'mission-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h4>🎉 レベルアップ!</h4>
                <p>Lv.${newLevel}になりました！</p>
            </div>
        `;

        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    /**
     * マスコットの満腹度を更新
     */
    updateMascotFullness(amount) {
        const currentStatus = Storage.get('mascotStatus') || { fullness: 25 };
        const newFullness = Math.min(100, currentStatus.fullness + amount);
        
        currentStatus.fullness = newFullness;
        Storage.set('mascotStatus', currentStatus);

        if (window.mascotDisplay) {
            mascotDisplay.updateFullness(newFullness);
        }

        // 満腹度が50%を超えたら餌やりミッション完了
        if (newFullness >= 50 && window.missionManager) {
            missionManager.onGameEvent('feeding');
        }
    }

    /**
     * マスコット名編集
     */
    editMascotName() {
        const currentName = Storage.get('mascotName') || 'からめる';
        const newName = prompt('マスコットの名前を入力してください:', currentName);
        
        if (newName && newName.trim()) {
            Storage.set('mascotName', newName.trim());
            
            // 名前表示を更新
            const nameElement = document.querySelector('.status-card h3');
            if (nameElement) {
                nameElement.childNodes[0].textContent = newName.trim() + ' ';
            }
        }
    }

    /**
     * 現在の状態を保存
     */
    saveCurrentState() {
        // 最後のアクセス時間を保存
        Storage.set('lastAccessTime', new Date().toISOString());
        
        // その他の状態も必要に応じて保存
        console.log('状態を保存しました');
    }

    /**
     * 定期的な状態更新（時間経過によるマスコットの変化）
     */
    startPeriodicUpdates() {
        // 5分ごとに満腹度を減らす
        setInterval(() => {
            const currentStatus = Storage.get('mascotStatus') || { fullness: 25 };
            const newFullness = Math.max(0, currentStatus.fullness - 1);
            
            currentStatus.fullness = newFullness;
            Storage.set('mascotStatus', currentStatus);

            if (window.mascotDisplay) {
                mascotDisplay.updateFullness(newFullness);
                
                // 満腹度が低くなったら疲労表現
                if (newFullness < 20) {
                    mascotDisplay.updateMood('お腹すいた...');
                    mascotDisplay.setEmotion('sad');
                }
            }
        }, 300000); // 5分
    }

    /**
     * 外部からの状態更新メソッド
     */
    updateMascotStatus(newStatus) {
        if (window.mascotDisplay) {
            mascotDisplay.updateStatus(newStatus);
        }
        
        const currentStatus = Storage.get('mascotStatus') || {};
        const updatedStatus = { ...currentStatus, ...newStatus };
        Storage.set('mascotStatus', updatedStatus);
    }
}

// ページ読み込み時に初期化
const mascotPage = new MascotPage();