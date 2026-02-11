console.log('💬 [SCRIPT-LOAD] chat_page.js読み込み開始...');

/**
 * チャットページのメイン制御クラス
 */
class ChatPage {
    constructor() {
        this.isInitialized = false;
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
            console.error('チャットページ初期化エラー:', error);
        }
    }

    /**
     * コンポーネント初期化
     */
    async initializeComponents() {
        console.log('🚀 [DEBUG-CHAT-1] チャットページコンポーネント初期化開始...');
        
        try {
            console.log('🔧 [DEBUG-CHAT-2] 基本UI設定開始...');
            // 基本UI設定
            this.setupBasicUI();
            console.log('✅ [DEBUG-CHAT-3] 基本UI設定完了');

            console.log('🐹 [DEBUG-CHAT-4] MascotDisplay初期化開始...');
            // MascotDisplayクラスを初期化
            this.initializeMascotDisplay();
            console.log('✅ [DEBUG-CHAT-5] MascotDisplay初期化完了');

            console.log('💬 [DEBUG-CHAT-6] チャット機能初期化開始...');
            // チャット機能を初期化
            this.initializeChatInterface();
            console.log('✅ [DEBUG-CHAT-7] チャット機能初期化完了');

            console.log('🏠 [DEBUG-CHAT-8] 部屋名更新開始...');
            // マスコット名に基づく部屋名更新
            this.updateRoomTitle();
            console.log('✅ [DEBUG-CHAT-9] 部屋名更新完了');

            console.log('🌤️ [DEBUG-CHAT-8] 天気背景モジュール初期化開始...');
            // 天気背景モジュール初期化
            this.initializeWeatherBackground();
            console.log('✅ [DEBUG-CHAT-9] 天気背景モジュール初期化完了');

            console.log('📊 [DEBUG-CHAT-10] 初期データ読み込み開始...');
            // 初期データ読み込み
            await this.loadInitialData();
            console.log('✅ [DEBUG-CHAT-11] 初期データ読み込み完了');

            this.isInitialized = true;
            console.log('✅ [DEBUG-CHAT-12] チャットページ全コンポーネント初期化完了');

        } catch (error) {
            console.error('❌ [DEBUG-CHAT-ERROR] チャットページコンポーネント初期化エラー:', error);
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
        // mascotPage.htmlまたはindex.htmlに戻る
        if (document.referrer.includes('mascotPage.html')) {
            window.history.back();
        } else {
            window.location.href = 'mascotPage.html';
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
     * チャット機能初期化
     */
    initializeChatInterface() {
        console.log('💬 [DEBUG-CHAT-INIT-1] チャット機能初期化開始...');
        
        try {
            console.log('🔍 [DEBUG-CHAT-INIT-2] ChatInterfaceクラス存在確認:', typeof ChatInterface);
            
            if (typeof ChatInterface !== 'undefined') {
                console.log('✅ [DEBUG-CHAT-INIT-3] ChatInterfaceクラス発見、インスタンス生成...');
                window.chatInterface = new ChatInterface();
                
                console.log('🔍 [DEBUG-CHAT-INIT-4] ChatInterfaceインスタンス確認:', !!window.chatInterface);
                
                // チャットページ専用の設定
                if (window.chatInterface) {
                    console.log('📝 [DEBUG-CHAT-INIT-5] 初期メッセージ追加開始...');
                    // 初期メッセージをチャット履歴として追加
                    setTimeout(() => {
                        console.log('💬 [DEBUG-CHAT-INIT-6] 初期メッセージをチャット履歴に追加');
                        chatInterface.addMessageToChat('ai', 'こんにちは！今日は何をお話ししましょうか？');
                        console.log('✅ [DEBUG-CHAT-INIT-7] 初期メッセージ追加完了');
                    }, 300);
                    
                    // 入力フォーカス
                    setTimeout(() => {
                        console.log('🎯 [DEBUG-CHAT-INIT-8] チャット入力フィールドフォーカス設定...');
                        const chatInput = document.getElementById('chat-input');
                        console.log('🔍 [DEBUG-CHAT-INIT-9] チャット入力要素:', !!chatInput);
                        if (chatInput) {
                            chatInput.focus();
                            console.log('✅ [DEBUG-CHAT-INIT-10] フォーカス設定完了');
                        }
                    }, 800);
                }
                
                console.log('✅ [DEBUG-CHAT-INIT-11] チャット機能初期化完了');
            } else {
                console.warn('⚠️ [DEBUG-CHAT-INIT-12] ChatInterfaceクラスが見つかりません');
            }
        } catch (error) {
            console.error('❌ [DEBUG-CHAT-INIT-ERROR] チャット機能初期化エラー:', error);
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
            
            // チャット履歴読み込み
            await this.loadChatHistory();
            
            console.log('✅ 初期データ読み込み完了');
        } catch (error) {
            console.error('❌ 初期データ読み込みエラー:', error);
        }
    }

    /**
     * 天気データ読み込み
     */
    async loadWeatherData() {
        try {
            if (window.ApiClient) {
                const weatherData = await ApiClient.getWeather();
                if (weatherData) {
                    // 天気背景に反映
                    if (window.weatherBackground) {
                        weatherBackground.updateWeather(weatherData);
                    }
                    
                    // ヘッダーに天気情報表示
                    this.updateWeatherInfo(weatherData);
                }
            }
        } catch (error) {
            console.error('天気データ取得エラー:', error);
        }
    }

    /**
     * 天気情報表示更新
     */
    updateWeatherInfo(weatherData) {
        const weatherInfo = document.getElementById('weatherInfo');
        if (weatherInfo && weatherData) {
            const temp = Math.round(weatherData.main?.temp || 0);
            const condition = weatherData.weather?.[0]?.main || 'Clear';
            weatherInfo.innerHTML = `
                <span class="current-time" id="currentTime">${this.formatTime()}</span>
                <span class="weather-temp">${temp}°C</span>
            `;
        }
    }

    /**
     * チャット履歴読み込み
     */
    async loadChatHistory() {
        try {
            if (window.chatInterface) {
                // ローカルストレージからチャット履歴読み込み
                const history = Storage.get('chatHistory') || [];
                
                // 履歴をチャット画面に表示
                history.forEach(message => {
                    chatInterface.addMessageToChat(message.content, message.type);
                });
                
                console.log('✅ チャット履歴読み込み完了:', history.length);
            }
        } catch (error) {
            console.error('❌ チャット履歴読み込みエラー:', error);
        }
    }

    /**
     * 時刻フォーマット
     */
    formatTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    /**
     * マスコット名に基づく部屋名更新
     */
    updateRoomTitle() {
        try {
            console.log('🏠 [DEBUG-ROOM-1] 部屋名更新処理開始...');
            
            // ローカルストレージからマスコット名を取得
            let mascotName = 'からめる'; // デフォルト名
            if (window.Storage) {
                const savedName = Storage.get('mascot-name');
                console.log('📦 [DEBUG-ROOM-2] ストレージからマスコット名取得:', savedName);
                if (savedName && savedName.trim() !== '') {
                    mascotName = savedName;
                }
            }
            
            // 部屋名要素を取得
            const roomTitleElement = document.getElementById('roomTitle');
            console.log('🔍 [DEBUG-ROOM-3] 部屋名要素:', !!roomTitleElement);
            
            if (roomTitleElement) {
                const newRoomTitle = `${mascotName}の部屋`;
                roomTitleElement.textContent = newRoomTitle;
                console.log('✅ [DEBUG-ROOM-4] 部屋名更新完了:', newRoomTitle);
            } else {
                console.error('❌ [DEBUG-ROOM-ERROR] 部屋名要素が見つかりません');
            }
        } catch (error) {
            console.error('❌ [DEBUG-ROOM-ERROR] 部屋名更新エラー:', error);
        }
    }
}

// ページ読み込み時に初期化
window.addEventListener('DOMContentLoaded', () => {
    console.log('🏁 DOMContentLoaded - ChatPage初期化開始');
    window.chatPage = new ChatPage();
    console.log('✅ ChatPage初期化完了');
});

console.log('💬 [SCRIPT-LOAD] chat_page.js読み込み完了');