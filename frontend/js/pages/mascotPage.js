console.log('📁 [SCRIPT-LOAD] mascotPage.js読み込み開始...');

/**
 * マスコットページのメイン制御クラス（シンプル版）
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
        console.log('🚀 コンポーネント初期化開始...');
        
        try {
            // APIクライアント初期化
            if (typeof ApiClient !== 'undefined' && !window.apiClient) {
                window.apiClient = new ApiClient();
                console.log('✅ APIクライアント初期化完了');
            }

            // 基本UI設定
            this.setupBasicUI();

            // MascotDisplayクラスを初期化
            this.initializeMascotDisplay();

            // MissionManagerクラスを初期化
            this.initializeMissionManager();

            // 天気背景モジュール初期化
            this.initializeWeatherBackground();

            // 初期データ読み込み
            await this.loadInitialData();

            this.isInitialized = true;
            console.log('✅ 全コンポーネント初期化完了');

        } catch (error) {
            console.error('❌ コンポーネント初期化エラー:', error);
        }
    }

    /**
     * 基本UI設定
     */
    setupBasicUI() {
        // 戻るボタン
        const backButton = document.getElementById('backButton');
        if (backButton) {
            backButton.addEventListener('click', () => this.goBack());
        }

        // マスコットクリック（チャット遷移用）
        const mascot = document.getElementById('mascot');
        if (mascot) {
            mascot.addEventListener('click', () => this.onMascotInteraction());
        }

        // 撫でるボタンにミッション機能を追加
        const petButton = document.getElementById('petButton');
        if (petButton) {
            petButton.addEventListener('click', () => this.onPetInteraction());
        }

        // 時刻更新
        this.updateTimeDisplay();
        setInterval(() => this.updateTimeDisplay(), 60000); // 1分ごと
    }

    /**
     * 時刻表示更新
     */
    updateTimeDisplay() {
        const now = new Date();
        const formatTime = () => {
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        };

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
     * MascotDisplayクラスを初期化
     */
    initializeMascotDisplay() {
        try {
            if (typeof MascotDisplay !== 'undefined') {
                console.log('🎯 MascotDisplayクラスを初期化...');
                window.mascotDisplay = new MascotDisplay();
                console.log('✅ MascotDisplayクラス初期化完了');
            } else {
                console.warn('⚠️ MascotDisplayクラスが見つかりません');
            }
        } catch (error) {
            console.error('❌ MascotDisplay初期化エラー:', error);
        }
    }

    /**
     * MissionManagerクラスを初期化
     */
    initializeMissionManager() {
        console.log('🎯 MissionManager初期化処理開始...');
        
        try {
            if (typeof MissionManager !== 'undefined') {
                console.log('✅ MissionManagerクラス発見、インスタンス生成中...');
                window.missionManager = new MissionManager();
                console.log('✅ MissionManagerインスタンス生成完了');
            } else {
                console.warn('⚠️ MissionManagerクラスが見つかりません');
            }
        } catch (error) {
            console.error('❌ MissionManager初期化エラー:', error);
        }
    }

    /**
     * 天気背景モジュール初期化
     */
    initializeWeatherBackground() {
        console.log('🌤️ 天気背景モジュール初期化...');
        
        try {
            if (typeof WeatherBackground !== 'undefined') {
                window.weatherBackground = new WeatherBackground();
                console.log('✅ 天気背景モジュール初期化完了');
            } else {
                console.warn('⚠️ WeatherBackgroundクラスが見つかりません');
            }
        } catch (error) {
            console.error('❌ WeatherBackground初期化エラー:', error);
        }
    }

    /**
     * 初期データ読み込み
     */
    async loadInitialData() {
        console.log('📊 初期データ読み込み開始...');
        
        try {
            // 天気データ読み込み
            await this.loadWeatherData();
            
            // マスコット挨拶読み込み
            await this.loadMascotGreeting();
            
            console.log('✅ 初期データ読み込み完了');
        } catch (error) {
            console.error('❌ 初期データ読み込みエラー:', error);
        }
    }

    /**
     * マスコットの挨拶を読み込む
     */
    async loadMascotGreeting() {
        try {
            console.log('👋 マスコット挨拶読み込み開始...');
            
            if (window.apiClient) {
                const result = await apiClient.getMascotGreeting();
                if (result.success && result.data) {
                    this.updateGreetingUI(result.data);
                    console.log('✅ マスコット挨拶更新完了:', result.data);
                } else {
                    console.error('❌ マスコット挨拶取得失敗:', result.error);
                }
            } else {
                console.warn('⚠️ APIクライアントが利用できません');
            }
        } catch (error) {
            console.error('❌ マスコット挨拶読み込みエラー:', error);
        }
    }

    /**
     * 挨拶UIを更新
     */
    updateGreetingUI(greetingData) {
        const commentElement = document.getElementById('aiComment');
        const nameElement = document.getElementById('mascot-name-comment');
        
        console.log('👋 挨拶データ詳細:', {
            greeting: greetingData.greeting,
            time_of_day: greetingData.time_of_day,
            current_hour: greetingData.current_hour,
            current_time: greetingData.current_time,
            timezone: greetingData.timezone
        });
        
        if (commentElement && greetingData.greeting) {
            // 挨拶メッセージのみを表示
            commentElement.textContent = greetingData.greeting;
            
            console.log('✅ 挨拶UI更新完了:', {
                message: greetingData.greeting,
                time: greetingData.current_time,
                period: greetingData.time_of_day
            });
        }
    }

    /**
     * マスコットステータスを読み込む
     */
    async loadMascotStatus() {
        try {
            console.log('📊 マスコットステータス読み込み開始...');
            
            if (window.apiClient) {
                const result = await apiClient.getMascotStatus();
                if (result.success && result.data) {
                    this.updateMascotStatusUI(result.data);
                    console.log('✅ マスコットステータス更新完了:', result.data);
                } else {
                    console.error('❌ マスコットステータス取得失敗:', result.error);
                }
            } else {
                console.warn('⚠️ APIクライアントが利用できません');
            }
        } catch (error) {
            console.error('❌ マスコットステータス読み込みエラー:', error);
        }
    }

    /**
     * マスコットステータスUIを更新
     */
    updateMascotStatusUI(statusData) {
        console.log('🎨 マスコットステータスUI更新:', statusData);
        
        // レベル表示を更新
        const levelElement = document.getElementById('mascot-level');
        if (levelElement) {
            levelElement.textContent = `Lv.${statusData.level}`;
            console.log(`📊 レベル表示更新: Lv.${statusData.level}`);
        }

        // 経験値バーを更新
        const levelFillElement = document.getElementById('level-fill');
        if (levelFillElement) {
            const progress = statusData.exp_progress_percentage || 0;
            levelFillElement.style.width = `${progress}%`;
            console.log(`📊 経験値バー更新: ${progress}% (${statusData.current_level_exp}/100)`);
        }

        // 体力バーを更新
        const healthFillElement = document.getElementById('health-fill');
        if (healthFillElement) {
            healthFillElement.style.width = `${statusData.health}%`;
            healthFillElement.className = `progress-fill health-fill ${this.getHealthClass(statusData.health)}`;
        }

        // エネルギー（満腹度）を更新
        this.updateEnergyStars(statusData.energy);
    }

    /**
     * 体力に応じたクラス名を取得
     */
    getHealthClass(health) {
        if (health >= 70) return 'high';
        if (health >= 40) return 'medium';
        return 'low';
    }

    /**
     * エネルギー星を更新
     */
    updateEnergyStars(energy) {
        const stars = document.querySelectorAll('.fullness-star');
        const filledCount = Math.ceil((energy / 100) * stars.length);
        
        stars.forEach((star, index) => {
            if (index < filledCount) {
                star.classList.add('filled');
                star.textContent = '⭐';
            } else {
                star.classList.remove('filled');
                star.textContent = '☆';
            }
        });
    }

    /**
     * 天気データ読み込み
     */
    async loadWeatherData() {
        try {
            if (window.ApiClient) {
                const weatherData = await ApiClient.getWeather();
                if (weatherData) {
                    this.currentWeatherData = weatherData;
                    
                    // 天気背景に反映
                    if (window.weatherBackground) {
                        weatherBackground.updateWeather(weatherData);
                    }
                }
            }
        } catch (error) {
            console.error('天気データ取得エラー:', error);
        }
    }

    /**
     * マスコットの挨拶を読み込む
     */
    async loadMascotGreeting() {
        try {
            console.log('👋 マスコット挨拶読み込み開始...');
            
            if (window.apiClient) {
                const result = await apiClient.getMascotGreeting();
                if (result.success && result.data) {
                    this.updateGreetingUI(result.data);
                    console.log('✅ マスコット挨拶更新完了:', result.data);
                } else {
                    console.error('❌ マスコット挨拶取得失敗:', result.error);
                }
            } else {
                console.warn('⚠️ APIクライアントが利用できません');
            }
        } catch (error) {
            console.error('❌ マスコット挨拶読み込みエラー:', error);
        }
    }

    /**
     * 挨拶UIを更新
     */
    updateGreetingUI(greetingData) {
        const commentElement = document.getElementById('aiComment');
        
        console.log('👋 挨拶データ詳細:', {
            greeting: greetingData.greeting,
            time_of_day: greetingData.time_of_day,
            current_hour: greetingData.current_hour,
            current_time: greetingData.current_time,
            timezone: greetingData.timezone
        });
        
        if (commentElement && greetingData.greeting) {
            // 挨拶メッセージのみを表示
            commentElement.textContent = greetingData.greeting;
            
            console.log('✅ 挨拶UI更新完了:', {
                message: greetingData.greeting,
                time: greetingData.current_time,
                period: greetingData.time_of_day
            });
        }
    }

    /**
     * マスコットインタラクション時の処理
     */
    async onMascotInteraction() {
        try {
            console.log('🐱 [DEBUG-MASCOT-1] マスコットインタラクション開始');
            
            // 基本的なマスコットアニメーション
            if (window.mascotDisplay) {
                console.log('🎭 [DEBUG-MASCOT-2] マスコットアニメーション実行...');
                const reactions = [
                    () => mascotDisplay.playTapAnimation(),
                    () => mascotDisplay.playHappyAnimation(),
                    () => this.showRandomMessage()
                ];

                const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
                randomReaction();

                console.log('⭐ [DEBUG-MASCOT-3] 経験値追加...');
                // 経験値追加
                mascotDisplay.addExperience(5);
                mascotDisplay.showFeedback('楽しいね〜♪', 'positive');
                console.log('✅ [DEBUG-MASCOT-4] 経験値追加完了');
            } else {
                console.warn('⚠️ [DEBUG-MASCOT-5] MascotDisplayが見つかりません');
            }

            // ミッション進行（マスコット用 - チャット遷移なし）
            if (window.missionManager) {
                console.log('🎯 [DEBUG-MASCOT-6] ミッション進行処理...');
                missionManager.onGameEvent('touch', { source: 'mascot' });
                console.log('✅ [DEBUG-MASCOT-7] ミッション進行完了');
            } else {
                console.warn('⚠️ [DEBUG-MASCOT-8] MissionManagerが見つかりません');
            }

            // インタラクション回数をカウント
            const interactionCount = Storage.get('interactionCount') || 0;
            Storage.set('interactionCount', interactionCount + 1);
            console.log('📊 [DEBUG-MASCOT-9] インタラクション回数更新:', interactionCount + 1);
            
            console.log('✅ [DEBUG-MASCOT-10] マスコットインタラクション完了');
            
        } catch (error) {
            console.error('❌ [DEBUG-MASCOT-ERROR] マスコットインタラクションエラー:', error);
        }
    }

    /**
     * 撫でるボタンインタラクション時の処理（ミッション達成用）
     */
    async onPetInteraction() {
        try {
            console.log('🐱 [DEBUG-PET-1] 撫でるボタンインタラクション開始');
            
            // 基本的なマスコットアニメーション
            if (window.mascotDisplay) {
                console.log('🎭 [DEBUG-PET-2] マスコットアニメーション実行...');
                const reactions = [
                    () => mascotDisplay.playTapAnimation(),
                    () => mascotDisplay.playHappyAnimation(),
                    () => this.showRandomMessage()
                ];

                const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
                randomReaction();

                console.log('⭐ [DEBUG-PET-3] 撫でるアクション実行...');
                // 撫でるアクション実行（API経由で経験値自動更新、フィードバック自動表示）
                await mascotDisplay.handlePetAction();
                console.log('✅ [DEBUG-PET-4] 撫でるアクション完了');
            } else {
                console.warn('⚠️ [DEBUG-PET-7] MascotDisplayが見つかりません');
            }

            // ミッション進行（撫でるボタン用）
            if (window.missionManager) {
                console.log('🎯 [DEBUG-PET-8] ミッション進行処理...');
                await missionManager.recordAction('touch_mascot');
                console.log('✅ [DEBUG-PET-9] ミッション進行完了');
            } else {
                console.warn('⚠️ [DEBUG-PET-10] MissionManagerが見つかりません');
            }

            // インタラクション回数をカウント
            const interactionCount = Storage.get('interactionCount') || 0;
            Storage.set('interactionCount', interactionCount + 1);
            console.log('📊 [DEBUG-PET-11] インタラクション回数更新:', interactionCount + 1);
            
            console.log('✅ [DEBUG-PET-12] 撫でるボタンインタラクション完了');
            
        } catch (error) {
            console.error('❌ [DEBUG-PET-ERROR] 撫でるボタンインタラクションエラー:', error);
        }
    }

    /**
     * ランダムメッセージ表示
     */
    showRandomMessage() {
        const messages = [
            'こんにちは〜♪',
            '今日も元気だね！',
            'いっしょに遊ぼう！',
            'お天気はどうかな？',
            '楽しいことしよ〜！'
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        if (window.mascotDisplay) {
            mascotDisplay.showActionFeedback(randomMessage);
        }
    }
}

// ページ読み込み時に初期化
window.addEventListener('DOMContentLoaded', () => {
    console.log('🏁 DOMContentLoaded - MascotPage初期化開始');
    window.mascotPage = new MascotPage();
    console.log('✅ MascotPage初期化完了');
});

console.log('📁 [SCRIPT-LOAD] mascotPage.js読み込み完了');