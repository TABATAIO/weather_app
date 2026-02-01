console.log('📁 [SCRIPT-LOAD] mascot_page.js読み込み開始...');

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
        console.log('🚀 [COMPONENTS-1] コンポーネント初期化開始...');
        
        try {
            console.log('🔧 [COMPONENTS-2] 基本UI設定開始...');
            // 基本UI設定
            this.setupBasicUI();
            console.log('✅ [COMPONENTS-3] 基本UI設定完了');

            console.log('🐹 [COMPONENTS-4] MascotDisplay初期化開始...');
            // MascotDisplayクラスを初期化
            this.initializeMascotDisplay();
            console.log('✅ [COMPONENTS-5] MascotDisplay初期化完了');

            console.log('🎯 [COMPONENTS-6] MissionManager初期化開始...');
            // MissionManagerクラスを初期化
            this.initializeMissionManager();
            console.log('✅ [COMPONENTS-7] MissionManager初期化完了');

            console.log('🌤️ [COMPONENTS-8] 天気データ取得開始...');
            // 天気データを取得して背景を設定
            await this.loadWeatherAndUpdateBackground();
            console.log('✅ [COMPONENTS-9] 天気データ取得完了');

            console.log('🧿 [COMPONENTS-10] マスコット初期状態設定開始...');
            // マスコット初期状態を設定(非同期で完了を待つ)
            await this.initializeMascotStatus();
            console.log('✅ [COMPONENTS-11] マスコット初期状態設定完了');

            console.log('💬 [COMPONENTS-12] チャット機能初期化開始...');
            // チャット機能の初期化
            this.initializeChatInterface();
            console.log('✅ [COMPONENTS-13] チャット機能初期化完了');

            console.log('🎯 [COMPONENTS-14] イベントリスナー設定開始...');
            // イベントリスナーの設定
            this.setupEventListeners();
            console.log('✅ [COMPONENTS-15] イベントリスナー設定完了');

            console.log('💭 [COMPONENTS-16] 初回AIメッセージ設定開始...');
            // 初回メッセージの設定
            this.setInitialAiMessage();
            console.log('✅ [COMPONENTS-17] 初回AIメッセージ設定完了');

            console.log('🔄 [COMPONENTS-18] 日次ミッションリセットチェック開始...');
            // 日次ミッションリセットのチェック
            if (window.missionManager) {
                if (typeof window.missionManager.resetDailyMissions === 'function') {
                    missionManager.resetDailyMissions();
                    console.log('✅ [COMPONENTS-19] 日次ミッションリセット完了');
                } else {
                    console.log('⚠️ [COMPONENTS-19] resetDailyMissionsメソッドが見つからない（スキップ）');
                }
            } else {
                console.log('⚠️ [COMPONENTS-19] window.missionManagerが見つからない');
            }

            this.isInitialized = true;
            console.log('🎉 [COMPONENTS-20] 全コンポーネント初期化完了');
            
            // 初期化完了後、少し遅延してマスコット名を確実に取得
            setTimeout(async () => {
                console.log('🔍 初期化完了後のマスコット名再取得開始');
                try {
                    await this.debugFetchMascotName();
                    console.log('✅ 初期化後のマスコット名取得完了');
                } catch (error) {
                    console.error('❌ 初期化後のマスコット名取得エラー:', error);
                }
            }, 1500); // 1.5秒待機
            console.log('✅ 初期化完了待機中...');
            
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
        console.log('🎯 [INIT-MM-1] MissionManager初期化処理開始...');
        
        try {
            console.log('🔍 [INIT-MM-2] MissionManagerクラス存在確認:', typeof MissionManager);
            console.log('📋 [INIT-MM-3] 利用可能なクラス:', {
                MissionManager: typeof MissionManager,
                ApiClient: typeof ApiClient,
                MascotDisplay: typeof MascotDisplay
            });
            
            if (typeof MissionManager !== 'undefined') {
                console.log('✅ [INIT-MM-4] MissionManagerクラス発見、インスタンス生成中...');
                
                // MissionManagerインスタンス作成前にメモリ確認
                console.log('💾 [INIT-MM-5] インスタンス作成前メモリチェック完了');
                window.missionManager = new MissionManager();
                console.log('✅ [INIT-MM-6] MissionManagerインスタンス生成完了');
                
                // インスタンスの確認
                console.log('🔍 [INIT-MM-7] インスタンス確認:', {
                    exists: !!window.missionManager,
                    type: typeof window.missionManager,
                    methods: window.missionManager ? Object.getOwnPropertyNames(Object.getPrototypeOf(window.missionManager)) : []
                });
                
                // マスコットタッチイベントをミッションシステムに接続
                console.log('🔗 [INIT-MM-8] イベント接続開始...');
                this.connectMissionEvents();
                console.log('✅ [INIT-MM-9] イベント接続完了');
            } else {
                console.error('❌ [INIT-MM-10] MissionManagerクラスが見つかりません');
                console.log('📂 [INIT-MM-11] スクリプト読み込み状況確認が必要です');
            }
        } catch (error) {
            console.error('💥 [INIT-MM-ERROR] MissionManager初期化エラー:', {
                name: error.name,
                message: error.message,
                stack: error.stack?.split('\n').slice(0, 8)
            });
            console.error('🔍 [INIT-MM-ERROR] エラー発生時の状態:', {
                MissionManagerType: typeof MissionManager,
                windowMissionManager: typeof window.missionManager,
                errorString: error.toString()
            });
            // エラーが発生してもページ全体を止めないよう、例外を再スローしない
        }
    }

    /**
     * ミッションイベントを接続
     */
    connectMissionEvents() {
        // マスコットタッチイベントをオーバーライド
        const originalMascotTouch = window.mascotDisplay?.playTouchAnimation;
        if (originalMascotTouch) {
            window.mascotDisplay.playTouchAnimation = function() {
                // 元のアニメーション実行
                originalMascotTouch.apply(this, arguments);
                
                // ミッション進捗を記録
                if (window.missionManager) {
                    window.missionManager.recordAction('touch_mascot');
                }
            };
        }

        // セリフタップイベントを接続
        document.addEventListener('click', (e) => {
            const speechElement = e.target.closest('.speech-bubble, .mascot-speech, .dialog-bubble');
            if (speechElement && window.missionManager) {
                window.missionManager.recordAction('tap_mascot_speech');
            }
        });

        console.log('✅ ミッションイベント接続完了');
    }

    /**
     * 天気データを読み込み背景を更新
     */
    async loadWeatherAndUpdateBackground() {
        try {
            console.log('🌤️ 天気データ取得開始...');
            
            // apiClientの存在確認
            if (!window.apiClient && typeof apiClient === 'undefined') {
                console.warn('⚠️ apiClientが見つかりません。デフォルト背景を設定します。');
                this.setDefaultWeatherAndBackground();
                return;
            }
            
            // グローバルapiClientまたはwindow.apiClientを使用
            const client = window.apiClient || apiClient;
            
            // 天気データを取得
            const weatherData = await client.getCurrentWeather('tokyo');
            console.log('🌤️ 天気データ取得結果:', weatherData);
            
            if (weatherData && (weatherData.success || weatherData.current)) {
                // APIレスポンスの構造に応じて処理
                const currentWeather = weatherData.data || weatherData.current || weatherData;
                this.currentWeatherData = currentWeather;
                
                console.log('🌤️ 処理する天気データ:', currentWeather);
                
                // 背景を更新
                if (window.weatherBackground) {
                    weatherBackground.updateBackground(currentWeather);
                    console.log('🌄 背景更新完了');
                }
                
                // 天気情報を表示(安全に呼び出し)
                try {
                    this.updateWeatherInfo();
                } catch (error) {
                    console.warn('⚠️ 天気情報表示に失敗:', error);
                }
                
                // ヘッダーの天気情報を更新
                this.updateWeatherInfo();
                
                // マスコット状態を天気データで更新（可能な場合のみ）
                try {
                    await this.updateMascotWithWeather(weatherData);
                } catch (mascotError) {
                    console.warn('⚠️ マスコット更新に失敗:', mascotError);
                }
                
                // 天気チェックミッション（可能な場合のみ）
                if (window.missionManager) {
                    missionManager.onGameEvent('weather_check', currentWeather);
                }
            } else {
                console.warn('⚠️ 天気データが無効です:', weatherData);
                this.setDefaultWeatherAndBackground();
            }

        } catch (error) {
            console.warn('天気データの取得に失敗しました:', error);
            this.setDefaultWeatherAndBackground();
        }
    }
    
    /**
     * デフォルトの天気状態と背景を設定
     */
    setDefaultWeatherAndBackground() {
        console.log('🌤️ デフォルト天気状態を設定中...');
        
        // デフォルト背景を設定
        if (window.weatherBackground) {
            weatherBackground.setDefaultBackground();
        }
        
        // デフォルト天気情報を表示(安全に呼び出し)
        try {
            this.updateWeatherInfo();
        } catch (error) {
            console.warn('⚠️ 天気情報更新に失敗:', error);
        }
        
        // デフォルトマスコット状態を設定
        this.setDefaultMascotState();
    }

    /**
     * マスコットの初期状態を設定
     */
    async initializeMascotStatus() {
        console.log('🧡 マスコット初期化開始...');
        
        if (window.mascotDisplay) {
            // 保存された状態を読み込み、なければデフォルト値
            const savedStatus = Storage.get('mascotStatus') || {
                level: 1,
                health: 75,
                fullness: 25, // 25% = 1つ星
                mood: '遊びたい気分！',
                emotion: 'normal'
            };

            mascotDisplay.updateStatus(savedStatus);
            console.log('🧡 マスコット状態設定完了:', savedStatus);
        } else {
            console.warn('⚠️ mascotDisplayが利用できません');
        }
        
        // Laravelからマスコット情報を取得(非同期)
        console.log('🧡 Laravelからマスコット情報取得開始...');
        try {
            await this.loadMascotInfo();
            console.log('✅ マスコット情報取得完了');
        } catch (error) {
            console.error('❌ マスコット情報取得エラー:', error);
        }
    }

    /**
     * Laravelからマスコット情報を取得
     */
    async loadMascotInfo() {
        console.log('🔍 loadMascotInfo: 開始');
        
        try {
            // まずシンプルなマスコット基本情報を取得
            console.log('🔍 Laravel API /api/mascot/basic を呼び出し中...');
            const response = await this.fetchFromLaravel('/api/mascot/basic');
            
            console.log('🔍 API レスポンス:', response);
            
            if (response && response.success) {
                const mascotData = response.data;
                
                console.log('✅ 既存データベースからマスコットデータ取得成功:', mascotData);
                
                // マスコット名を更新
                console.log('🔍 マスコット名を更新中:', mascotData.name);
                this.updateMascotName(mascotData.name);
                
                // マスコット表示を更新
                if (window.mascotDisplay) {
                    console.log('🔍 mascotDisplayステータス更新中');
                    mascotDisplay.updateStatus({
                        level: mascotData.level,
                        health: mascotData.health,
                        fullness: mascotData.happiness,
                        mood: mascotData.mood,
                        emotion: this.getEmotionFromMood(mascotData.mood)
                    });
                }
                
                // レベル表示を更新（経験値は0として）
                this.updateLevelDisplay(mascotData.level, 0);
                
                // 状態を保存
                Storage.set('mascotStatus', {
                    name: mascotData.name,
                    level: mascotData.level,
                    health: mascotData.health,
                    happiness: mascotData.happiness,
                    energy: mascotData.energy,
                    mood: mascotData.mood,
                    species: mascotData.species,
                    lastUpdate: new Date().toISOString()
                });
                
                console.log('✅ Laravel基本情報取得完了');
                return;
            }
        } catch (error) {
            console.warn('⚠️ 既存データベースからのマスコット情報取得エラー:', error);
        }
        
        // フォールバック：マスコット名だけでも取得
        try {
            console.log('🔍 フォールバック: /api/mascot/name 呼び出し中...');
            const nameResponse = await this.fetchFromLaravel('/api/mascot/name');
            console.log('🔍 name API レスポンス:', nameResponse);
            
            if (nameResponse && nameResponse.success) {
                console.log('✅ マスコット名のみ取得成功:', nameResponse.data.name);
                this.updateMascotName(nameResponse.data.name);
                
                // デフォルト状態で他の値を設定
                if (window.mascotDisplay) {
                    mascotDisplay.updateStatus({
                        level: 1,
                        health: 60,
                        fullness: 30,
                        mood: '今日も頑張ります！',
                        emotion: 'normal'
                    });
                }
                
                Storage.set('mascotStatus', {
                    name: nameResponse.data.name,
                    level: 1,
                    health: 60,
                    happiness: 30,
                    energy: 50,
                    mood: '今日も頑張ります！',
                    lastUpdate: new Date().toISOString()
                });
                
                console.log('✅ 名前のみ取得完了');
                return;
            }
        } catch (error) {
            console.warn('⚠️ マスコット名取得エラー:', error);
        }
        
        // 最終フォールバック
        console.log('❌ Laravelからの取得に失敗、デフォルト状態に設定');
        this.setDefaultMascotState();
    }

    /**
     * 天気データでマスコット状態を更新
     */
    async updateMascotWithWeather(weatherData) {
        try {
            console.log('🌤️ updateMascotWithWeather 開始:', weatherData);
            
            // 天気データの構造確認
            if (!weatherData) {
                console.warn('⚠️ weatherData が null または undefined');
                return;
            }
            
            if (!weatherData.current) {
                console.warn('⚠️ weatherData.current が存在しません:', weatherData);
                return;
            }
            
            const currentWeather = weatherData.current;
            console.log('🌡️ 現在の天気データ:', currentWeather);
            
            const response = await apiClient.post('/mascot/update', {
                weatherCode: currentWeather.weatherCode || 'unknown',
                temperature: currentWeather.temperature || 20,
                humidity: currentWeather.humidity || 50,
                precipitation: currentWeather.precipitation || 0,
                windSpeed: currentWeather.windSpeed || 0,
                pressure: currentWeather.pressure || 1013,
                weatherName: currentWeather.weather || '晴れ'
            });
            
            if (response && response.success) {
                const mascotState = response.data;
                
                // マスコット表示を更新
                if (window.mascotDisplay) {
                    mascotDisplay.updateStatus({
                        level: mascotState.level || 1,
                        health: mascotState.energy,
                        fullness: mascotState.happiness,
                        mood: mascotState.mood,
                        emotion: mascotState.emotion || 'normal'
                    });
                }
                
                // AIコメントを更新
                this.updateAiComment(mascotState.weatherReaction);
                
                // 状態を保存
                Storage.set('mascotStatus', {
                    level: mascotState.level || 1,
                    health: mascotState.energy,
                    fullness: mascotState.happiness,
                    mood: mascotState.mood,
                    emotion: mascotState.emotion || 'normal'
                });
            }
        } catch (error) {
            console.error('マスコット天気更新エラー:', error);
            console.log('🔄 フォールバック: デフォルト天気状態を設定中...');
            // エラーが発生した場合はデフォルト状態に設定
            this.setDefaultMascotState();
        }
    }

    /**
     * デフォルトマスコット状態を設定
     */
    setDefaultMascotState() {
        console.log('🔍 setDefaultMascotState 呼び出し');
        
        const defaultStatus = {
            level: 1,
            health: 60,
            fullness: 30,
            mood: '今日もがんばろう！',
            emotion: 'normal'
        };
        
        // マスコット名をデフォルト設定
        console.log('🔍 デフォルト名「かめらる」を設定中');
        this.updateMascotName('かめらる');
        
        if (window.mascotDisplay) {
            mascotDisplay.updateStatus(defaultStatus);
        }
        
        this.updateAiComment('今日もよろしくお願いします！');
        
        // デフォルト状態を保存
        Storage.set('mascotStatus', {
            ...defaultStatus,
            name: 'かめらる',
            species: 'cloud_spirit'
        });
        
        console.log('✅ デフォルト状態設定完了');
    }
    
    /**
     * ヘッダーの天気情報を更新
     */
    updateWeatherInfo() {
        if (!this.currentWeatherData) return;
        
        try {
            const weatherInfo = document.getElementById('weatherInfo');
            if (weatherInfo) {
                const currentTime = formatTime();
                const weather = this.currentWeatherData.current;
                const temp = weather.temperature !== -9999 ? `${weather.temperature}°C` : '--°C';
                
                weatherInfo.innerHTML = `
                    <span class="current-time">${currentTime}</span>
                    <span class="temperature">${temp}</span>
                `;
            }
        } catch (error) {
            console.error('天気情報ヘッダー更新エラー:', error);
        }
    }
    
    /**
     * AIコメントを更新
     */
    updateAiComment(comment) {
        try {
            const aiCommentElement = document.getElementById('aiComment');
            if (aiCommentElement && comment) {
                // アニメーション付きでコメントを更新
                Animation.fadeOut(aiCommentElement).then(() => {
                    aiCommentElement.textContent = comment;
                    Animation.fadeIn(aiCommentElement);
                });
            }
        } catch (error) {
            console.error('AIコメント更新エラー:', error);
        }
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
     * ミッション完了イベント処理
     */
    onMissionCompleted(missionData) {
        console.log('ミッション完了:', missionData);
        
        // 経験値獲得エフェクトなど
        if (window.mascotDisplay) {
            window.mascotDisplay.showExpGain(missionData.reward || 10);
        }
    }
    
    /**
     * Laravelからミッション情報を取得
     */
    async loadMissionsFromLaravel() {
        try {
            const response = await this.fetchFromLaravel('/api/mascot/missions?user_id=1');
            
            if (response && response.success) {
                const missions = response.data;
                console.log('Laravel ミッションデータ:', missions);
                
                // ミッション表示を更新
                this.updateMissionDisplay(missions);
            }
        } catch (error) {
            console.warn('ミッション情報取得エラー:', error);
        }
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

        // タッチガイドを常時表示（自動非表示を無効化）
        // setTimeout(() => {
        //     const touchGuide = document.getElementById('touchGuide');
        //     if (touchGuide) {
        //         Animation.fadeOut(touchGuide);
        //     }
        // }, 5000);
    }

    /**
     * マスコットインタラクション時の処理（Laravel統合版）
     */
    async onMascotInteraction() {
        try {
            // Laravelでマスコットの状態を更新（遊ぶアクション）
            const response = await this.fetchFromLaravel('/api/mascot/update', {
                method: 'POST',
                body: JSON.stringify({
                    user_id: 1,
                    action: 'play'
                })
            });

            if (response && response.success) {
                // ランダムなリアクション
                const reactions = [
                    () => mascotDisplay.playTapAnimation(),
                    () => mascotDisplay.playHappyAnimation(),
                    () => this.showRandomMessage()
                ];

                const randomReaction = getRandomItem(reactions);
                randomReaction();

                // 状態を更新
                this.updateMascotFromResponse(response.data);
            }
        } catch (error) {
            console.error('マスコットインタラクションエラー:', error);
            
            // エラー時のフォールバック
            const reactions = [
                () => mascotDisplay.playTapAnimation(),
                () => this.showRandomMessage()
            ];
            const randomReaction = getRandomItem(reactions);
            randomReaction();
        }

        // インタラクション回数をカウント
        const interactionCount = Storage.get('interactionCount') || 0;
        Storage.set('interactionCount', interactionCount + 1);
    }

    /**
     * Laravel API通信用のヘルパー関数
     */
    async fetchFromLaravel(endpoint, options = {}) {
        // 現在の環境情報を取得
        const hostname = window.location.hostname;
        const port = window.location.port;
        
        // 複数のエンドポイントを試行
        const possibleUrls = [];
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // ローカル開発環境：Laravel APIに直接アクセス
            possibleUrls.push(`http://localhost:8000${endpoint}`);
        } else {
            // Docker環境：複数の方法を試行
            possibleUrls.push(`http://${hostname}:8000${endpoint}`); // 直接Laravel ポート
            possibleUrls.push(`${endpoint}`); // 相対パス（nginx proxy経由）
        }
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        // 複数のURLを順番に試行
        for (const url of possibleUrls) {
            console.log(`🔍 Laravel API 試行中:`, { endpoint, url });
            
            try {
                const response = await fetch(url, finalOptions);
                
                console.log(`📡 Laravel API レスポンス (${url}):`, {
                    status: response.status,
                    statusText: response.statusText,
                    ok: response.ok
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ Laravel API 成功 (${url}):`, data);
                    return data;
                }
                
            } catch (error) {
                console.warn(`⚠️ Laravel API 失敗 (${url}):`, error.message);
                // 続行して次のURLを試行
            }
        }
        
        // すべてのURLが失敗した場合
        const errorMsg = `すべてのLaravel API URLが失敗: ${possibleUrls.join(', ')}`;
        console.error(`❌ ${errorMsg}`);
        throw new Error(errorMsg);
    }

    /**
     * レスポンスからマスコット状態を更新
     */
    updateMascotFromResponse(mascotData) {
        if (window.mascotDisplay) {
            mascotDisplay.updateStatus({
                level: mascotData.level,
                health: mascotData.health,
                fullness: mascotData.happiness,
                mood: mascotData.mood,
                emotion: this.getEmotionFromMood(mascotData.mood)
            });
        }
        
        // レベル表示を更新
        this.updateLevelDisplay(mascotData.level, mascotData.experience);
        
        // 状態を保存
        Storage.set('mascotStatus', {
            ...mascotData,
            lastUpdate: new Date().toISOString()
        });
    }

    /**
     * 気分から表情を決定
     */
    getEmotionFromMood(mood) {
        if (mood.includes('最高') || mood.includes('元気いっぱい')) {
            return 'happy';
        } else if (mood.includes('疲れ') || mood.includes('お腹すいた')) {
            return 'tired';
        } else {
            return 'normal';
        }
    }

    /**
     * デバッグ用：手動でマスコット名を取得
     */
    async debugFetchMascotName() {
        console.log('🔍 デバッグ: マスコット名取得テスト開始');
        
        try {
            const response = await fetch('http://localhost:8000/api/mascot/name', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            console.log('🔍 レスポンス状態:', response.status);
            const data = await response.json();
            console.log('🔍 取得データ:', data);
            
            if (data.success) {
                this.updateMascotName(data.data.name);
                console.log('✅ マスコット名更新完了:', data.data.name);
                return data.data.name;
            }
        } catch (error) {
            console.error('❌ API呼び出しエラー:', error);
            return null;
        }
    }

    /**
     * マスコット名を更新
     */
    updateMascotName(name) {
        console.log('🔍 updateMascotName 呼び出し:', name);
        
        // タイトル部分の名前を更新
        const titleElement = document.getElementById('mascot-name-title');
        if (titleElement) {
            titleElement.textContent = name;
            console.log('✅ タイトル部分の名前を更新:', name);
        } else {
            console.warn('⚠️ mascot-name-title要素が見つかりません');
        }
        
        // AIコメント部分の名前を更新
        const commentElement = document.getElementById('mascot-name-comment');
        if (commentElement) {
            commentElement.textContent = name;
            console.log('✅ AIコメント部分の名前を更新:', name);
        } else {
            console.warn('⚠️ mascot-name-comment要素が見つかりません');
        }
    }
    
    /**
     * 天気情報表示を更新
     */
    updateWeatherInfo() {
        console.log('🌤️ 天気情報表示更新');
        
        // 現在時刻を更新
        this.updateCurrentTime();
        
        // 天気情報がある場合は表示を更新
        if (this.currentWeatherData) {
            const weatherInfo = document.getElementById('weatherInfo');
            if (weatherInfo && this.currentWeatherData.weather) {
                // シンプルな天気情報表示
                const tempSpan = weatherInfo.querySelector('.weather-temp');
                const weatherSpan = weatherInfo.querySelector('.weather-name');
                
                if (tempSpan && this.currentWeatherData.temperature !== undefined) {
                    tempSpan.textContent = Math.round(this.currentWeatherData.temperature) + '°C';
                }
                
                if (weatherSpan && this.currentWeatherData.weather) {
                    weatherSpan.textContent = this.currentWeatherData.weather;
                }
                
                console.log('✅ 天気情報表示更新完了');
            }
        }
    }

    /**
     * レベル表示を更新
     */
    updateLevelDisplay(level, experience) {
        const levelElement = document.getElementById('mascot-level');
        if (levelElement) {
            levelElement.textContent = `Lv.${level}`;
        }
        
        const levelFill = document.getElementById('level-fill');
        if (levelFill) {
            const progressPercent = ((experience % 100) / 100) * 100;
            levelFill.style.width = `${progressPercent}%`;
        }
    }

    /**
     * ミッション表示を更新
     */
    updateMissionDisplay(missions) {
        const missionList = document.getElementById('mission-list');
        if (!missionList) return;
        
        missionList.innerHTML = '';
        
        missions.forEach(mission => {
            const missionElement = document.createElement('div');
            missionElement.className = `mission-item ${mission.completed ? 'completed' : ''}`;
            
            const progressBar = `
                <div class="mission-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(mission.progress / mission.max_progress) * 100}%"></div>
                    </div>
                    <span class="progress-text">${mission.progress}/${mission.max_progress}</span>
                </div>
            `;
            
            missionElement.innerHTML = `
                <div class="mission-info">
                    <h4>${mission.title}</h4>
                    <p>${mission.description}</p>
                    ${progressBar}
                    <div class="mission-reward">報酬: ${mission.reward_exp}XP</div>
                </div>
                ${mission.completed ? '<div class="completed-badge">✓</div>' : ''}
            `;
            
            missionList.appendChild(missionElement);
        });
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
    /**
     * マスコットに餌をあげる
     */
    async feedMascot() {
        try {
            this.showNotification('餌をあげています...', 'info');
            
            const response = await this.fetchFromLaravel('/api/mascot/feed', {
                method: 'POST',
                body: JSON.stringify({})
            });

            if (response && response.success) {
                this.updateMascotFromResponse(response.data);
                this.showNotification('餌をあげました！満腹度が上がりました 🍙', 'success');
                
                if (window.mascotDisplay) {
                    mascotDisplay.playHappyAnimation();
                }
            }
        } catch (error) {
            console.error('餌やりエラー:', error);
            this.showNotification('餌やりに失敗しました', 'error');
        }
    }

    /**
     * マスコットと遊ぶ
     */
    async playWithMascot() {
        try {
            this.showNotification('遊んでいます...', 'info');
            
            const response = await this.fetchFromLaravel('/api/mascot/play', {
                method: 'POST',
                body: JSON.stringify({})
            });

            if (response && response.success) {
                this.updateMascotFromResponse(response.data);
                this.showNotification('一緒に遊びました！経験値が上がりました 🎾', 'success');
                
                if (window.mascotDisplay) {
                    mascotDisplay.playHappyAnimation();
                }
            }
        } catch (error) {
            console.error('遊びエラー:', error);
            this.showNotification('遊びに失敗しました', 'error');
        }
    }

    /**
     * マスコットを撫でる
     */
    async petMascot() {
        try {
            this.showNotification('撫でています...', 'info');
            
            const response = await this.fetchFromLaravel('/api/mascot/pet', {
                method: 'POST',
                body: JSON.stringify({})
            });

            if (response && response.success) {
                this.updateMascotFromResponse(response.data);
                this.showNotification('撫でました！気分が良くなりました ✋', 'success');
                
                if (window.mascotDisplay) {
                    mascotDisplay.playTapAnimation();
                }
            }
        } catch (error) {
            console.error('撫でるエラー:', error);
            this.showNotification('撫でるのに失敗しました', 'error');
        }
    }

    /**
     * 通知を表示
     */
    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        // 3秒後に削除
        setTimeout(() => {
            if (notification.parentNode) {
                Animation.fadeOut(notification).then(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                });
            }
        }, 3000);
    }}

// ページ読み込み時に初期化
console.log('🔄 mascot_page.js: スクリプト読み込み開始');
let mascotPage;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔄 DOM読み込み完了、MascotPage初期化中...');
    try {
        mascotPage = new MascotPage();
        
        // グローバルアクセス用
        window.mascotPage = mascotPage;
        
        console.log('✅ MascotPageインスタンス作成完了');
        
        // デバッグ用関数をグローバルに追加
        window.testMascotAPI = async () => {
            console.log('🔍 手動API テスト開始...');
            await mascotPage.debugFetchMascotName();
        };
        
        window.testNameUpdate = (name) => {
            console.log(`🔍 手動名前更新テスト: "${name}"`);
            mascotPage.updateMascotName(name || 'テスト名前');
        };
        
        // 直接アクセス用のデバッグ関数も追加
        window.debugMascotName = async () => {
            console.log('🔍 直接デバッグ関数呼び出し');
            if (mascotPage && typeof mascotPage.debugFetchMascotName === 'function') {
                return await mascotPage.debugFetchMascotName();
            } else {
                console.error('❌ mascotPageまたはdebugFetchMascotName関数が利用できません');
                throw new Error('mascotPageが初期化されていません');
            }
        };
        
        console.log('🔧 デバッグ用関数追加:');
        console.log('- window.testMascotAPI() でAPI テスト');
        console.log('- window.testNameUpdate("新しい名前") で名前更新テスト');
        console.log('- window.debugMascotName() で直接デバッグ');
        
    } catch (error) {
        console.error('❌ MascotPage初期化エラー:', error);
        console.error('❌ エラー詳細:', error.stack);
        
        // フォールバック: 最低限のグローバル関数を提供
        window.mascotPage = {
            isInitialized: false,
            error: error.message,
            debugFetchMascotName: async () => {
                console.warn('⚠️ フォールバックモード: 直接API呼び出し');
                try {
                    const response = await fetch('http://localhost:8000/api/mascot/name');
                    const data = await response.json();
                    console.log('📥 フォールバックAPI結果:', data);
                    return data;
                } catch (e) {
                    console.error('❌ フォールバックAPI失敗:', e);
                    throw e;
                }
            },
            updateMascotName: (name) => {
                console.log('🔍 フォールバック名前更新:', name);
                const titleElement = document.getElementById('mascot-name-title');
                const commentElement = document.getElementById('mascot-name-comment');
                if (titleElement) titleElement.textContent = name;
                if (commentElement) commentElement.textContent = name;
            }
        };
        
        console.warn('⚠️ フォールバックモードで初期化しました');
    }
});

// 追加の初期化試行（遅延読み込み対応）
setTimeout(() => {
    if (!window.mascotPage || !window.mascotPage.isInitialized) {
        console.log('🔄 遅延初期化を試行中...');
        try {
            if (!mascotPage && typeof MascotPage === 'function') {
                mascotPage = new MascotPage();
                window.mascotPage = mascotPage;
                console.log('✅ 遅延初期化成功');
            }
        } catch (error) {
            console.error('❌ 遅延初期化も失敗:', error);
        }
    }
}, 2000);

console.log('🔄 mascot_page.js: スクリプト読み込み完了');