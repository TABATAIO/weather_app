/**
 * チャットインターフェース管理クラス（シンプル版）
 */
class ChatInterface {
    constructor() {
        this.conversationHistory = [];
        this.isLoading = false;
        this.currentUserId = 'user_' + Date.now();
        this.userName = 'ユーザー';
        this.init();
    }

    init() {
        console.log('💬 [DEBUG-CI-1] チャット機能初期化開始...');
        this.setupElements();
        this.cleanupInvalidMessages(); // 無効なメッセージを削除
        this.loadConversationHistory();
        console.log('✅ [DEBUG-CI-2] チャット機能初期化完了');
    }

    setupElements() {
        console.log('🔧 [DEBUG-CI-SETUP-1] チャット要素取得開始...');
        
        // チャット要素の取得
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-button');
        this.aiCommentElement = document.getElementById('ai-comment') || document.getElementById('aiComment');
        
        // chat_page.htmlの構造に合わせてchatHistoryContainerをメインコンテナとして使用
        this.chatHistoryContainer = document.getElementById('chatHistoryContainer');
        // 互換性のためにchatContainerも設定（同じ要素を指す）
        this.chatContainer = this.chatHistoryContainer;
        
        console.log('🔍 [DEBUG-CI-SETUP-2] チャット要素存在確認:', {
            chatInput: !!this.chatInput,
            sendButton: !!this.sendButton,
            aiCommentElement: !!this.aiCommentElement,
            chatHistoryContainer: !!this.chatHistoryContainer,
            chatContainer: !!this.chatContainer
        });

        // イベントリスナーの設定
        console.log('🎯 [DEBUG-CI-SETUP-3] イベントリスナー設定開始...');
        
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => {
                console.log('🔵 [DEBUG-CI-EVENT] 送信ボタンクリック');
                this.sendMessage();
            });
            console.log('✅ [DEBUG-CI-SETUP-4] 送信ボタンイベント設定完了');
        }

        if (this.chatInput) {
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    console.log('⌨️ [DEBUG-CI-EVENT] Enterキー押下、メッセージ送信');
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            console.log('✅ [DEBUG-CI-SETUP-5] チャット入力Enterイベント設定完了');
        }

        console.log('✅ [DEBUG-CI-SETUP-6] チャット要素設定完了');
    }

    /**
     * 無効なメッセージ（undefinedなど）を削除
     */
    cleanupInvalidMessages() {
        console.log('🧹 [DEBUG-CI-CLEANUP-1] 無効メッセージクリーンアップ開始...');
        
        if (!this.chatHistoryContainer) {
            console.warn('⚠️ [DEBUG-CI-CLEANUP-2] チャットコンテナが見つかりません');
            return;
        }
        
        // undefinedクラスを持つメッセージを削除
        const invalidMessages = this.chatHistoryContainer.querySelectorAll('.history-message.undefined');
        console.log(`🧹 [DEBUG-CI-CLEANUP-3] ${invalidMessages.length}個の無効メッセージを発見`);
        
        invalidMessages.forEach((element, index) => {
            console.log(`🗑️ [DEBUG-CI-CLEANUP-4-${index}] 無効メッセージを削除:`, element.className);
            element.remove();
        });
        
        // 空のメッセージも削除
        const emptyMessages = this.chatHistoryContainer.querySelectorAll('.history-message');
        let removedCount = 0;
        emptyMessages.forEach((element, index) => {
            const text = element.textContent?.trim();
            if (!text || text === '' || text === 'undefined') {
                console.log(`🗑️ [DEBUG-CI-CLEANUP-5-${index}] 空メッセージを削除:`, { className: element.className, text });
                element.remove();
                removedCount++;
            }
        });
        
        console.log(`✅ [DEBUG-CI-CLEANUP-6] クリーンアップ完了 - 削除数: ${invalidMessages.length + removedCount}`);
    }

    /**
     * メッセージを送信
     */
    async sendMessage() {
        console.log('📨 [DEBUG-CI-SEND-1] メッセージ送信処理開始...');
        
        const message = this.chatInput?.value.trim();
        console.log('📝 [DEBUG-CI-SEND-2] 入力メッセージ:', { message, hasInput: !!this.chatInput, isLoading: this.isLoading });
        
        if (!message || this.isLoading) {
            console.log('⚠️ [DEBUG-CI-SEND-3] メッセージ送信中断:', { hasMessage: !!message, isLoading: this.isLoading });
            return;
        }

        console.log('💬 [DEBUG-CI-SEND-4] ユーザーメッセージをチャットに追加...');
        // UI更新
        this.addMessageToChat('user', message);
        this.chatInput.value = '';
        this.setLoading(true);

        try {
            console.log('🌤️ [DEBUG-CI-SEND-5] 天気データ取得開始...');
            // 天気データを取得
            const weatherData = await this.getCurrentWeatherData();
            console.log('🌤️ [DEBUG-CI-SEND-6] 天気データ取得完了:', !!weatherData);

            // APIに送信するデータを準備
            const chatData = {
                message: message,
                userName: this.userName,
                userId: this.currentUserId,
                weatherData: weatherData,
                conversationHistory: this.conversationHistory.slice(-10) // 直近10件のみ
            };
            
            console.log('📡 [DEBUG-CI-SEND-7] APIリクエストデータ詳細:', {
                hasMessage: !!chatData.message,
                message: chatData.message,
                hasWeatherData: !!chatData.weatherData,
                weatherData: chatData.weatherData,
                historyCount: chatData.conversationHistory.length,
                userName: chatData.userName,
                userId: chatData.userId
            });

            console.log('🔄 [DEBUG-CI-SEND-8] マスコットチャットAPI呼び出し...');
            // APIコール
            const response = await apiClient.sendMascotChat(chatData);
            console.log('📡 [DEBUG-CI-SEND-9] APIレスポンス:', { success: response?.success, hasData: !!response?.data });
            
            if (response.success) {
                console.log('🤖 [DEBUG-CI-SEND-10] AIメッセージをチャットに追加...');
                // AIの返答を表示
                this.addMessageToChat('ai', response.data?.response || response.response);
                
                // マスコットの状態を更新
                if (response.data?.mascotStatus) {
                    console.log('🐱 [DEBUG-CI-SEND-11] マスコット状態更新...');
                    this.updateMascotStatus(response.data.mascotStatus);
                }

                // 会話履歴に追加
                this.addToHistory('user', message);
                this.addToHistory('ai', response.data?.response || response.response);

                // チャットイベントを発火（ミッション連携）
                this.dispatchChatEvent(message, response.data?.response || response.response);
            } else {
                throw new Error(response.error || 'チャットエラー');
            }

        } catch (error) {
            console.error('チャット送信エラー:', error);
            this.addMessageToChat('system', 'すみません、何か問題が発生しました。もう一度お試しください。');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * チャットイベントを発火（ミッション連携等）
     */
    dispatchChatEvent(userMessage, aiResponse) {
        const chatEvent = new CustomEvent('chatSent', {
            detail: {
                userMessage,
                aiResponse,
                timestamp: new Date()
            }
        });
        document.dispatchEvent(chatEvent);
    }

    /**
     * チャットにメッセージを追加
     * @param {string} sender - 送信者（user, ai, system）
     * @param {string} message - メッセージ
     */
    addMessageToChat(sender, message) {
        console.log('💬 [DEBUG-CI-ADD-1] メッセージ追加処理開始:', { sender, hasMessage: !!message });
        
        // パラメータチェック：undefinedや空のメッセージは表示しない
        if (!sender || sender === 'undefined' || !message || message.trim() === '') {
            console.warn('⚠️ [DEBUG-CI-ADD-SKIP] 無効なメッセージをスキップ:', { sender, message });
            return;
        }
        
        // chat_page.htmlの構造に合わせてchatHistoryContainerを使用
        const targetContainer = this.chatHistoryContainer;
        console.log('📦 [DEBUG-CI-ADD-2] 使用するコンテナ:', { 
            chatHistoryContainer: !!this.chatHistoryContainer,
            targetContainer: !!targetContainer 
        });
        
        if (!targetContainer) {
            console.error('❌ [DEBUG-CI-ADD-ERROR] チャットコンテナが見つかりません');
            return;
        }

        const messageElement = document.createElement('div');
        
        // chat_page.htmlの構造に合わせてhistory-messageクラスで表示
        messageElement.className = `history-message ${sender}`;
        
        if (sender === 'ai') {
            // AIメッセージはアイコン付き構造
            messageElement.innerHTML = `
                <div class="message-with-avatar">
                    <div class="avatar-container">
                        <div class="mascot-avatar">🐱</div>
                    </div>
                    <div class="message-content">${message}</div>
                </div>
            `;
        } else {
            // ユーザーメッセージはシンプルに
            messageElement.textContent = message;
        }
        
        console.log('🏗️ [DEBUG-CI-ADD-3] メッセージ要素作成:', { 
            className: messageElement.className, 
            sender: sender,
            hasAvatar: sender === 'ai'
        });

        console.log('📋 [DEBUG-CI-ADD-4] メッセージ要素をコンテナに追加...');
        targetContainer.appendChild(messageElement);
        
        // DOM追加後の確認
        console.log('🔍 [DEBUG-CI-ADD-4.5] DOM追加後の状態確認:', {
            containerChildren: targetContainer.children.length,
            lastChild: targetContainer.lastElementChild?.className,
            lastChildText: targetContainer.lastElementChild?.textContent,
            containerHTML: targetContainer.innerHTML.substring(0, 200) + '...'
        });
        
        // 会話履歴に追加
        this.conversationHistory.push({
            type: sender,
            content: message,
            timestamp: new Date().toISOString()
        });
        
        // スクロールを最下部に
        console.log('⬇️ [DEBUG-CI-ADD-5] スクロール位置調整...');
        setTimeout(() => {
            if (targetContainer.scrollHeight > targetContainer.clientHeight) {
                targetContainer.scrollTop = targetContainer.scrollHeight;
                console.log('📜 [DEBUG-CI-ADD-5.5] スクロール実行:', {
                    scrollHeight: targetContainer.scrollHeight,
                    clientHeight: targetContainer.clientHeight,
                    scrollTop: targetContainer.scrollTop
                });
            } else {
                console.log('📜 [DEBUG-CI-ADD-5.5] スクロール不要 (コンテンツ小)');
            }
        }, 100);

        console.log('✅ [DEBUG-CI-ADD-6] メッセージ追加完了');

        // AIメッセージはチャット欄のみに表示（吹き出しには表示しない）
        console.log('📝 [DEBUG-CI-ADD-7] AIメッセージはチャット欄のみに表示');
    }

    /**
     * AIコメントを更新（無効化済み、吹き出し表示はしない）
     * @param {string} message - メッセージ
     */
    updateAiComment(message) {
        console.log('🚫 [DEBUG-CI-COMMENT] AIコメント更新は無効化済み（吹き出し非表示）');
        // 意図的に空にして吹き出し表示を停止
        return;
    }

    /**
     * タイピングアニメーション
     * @param {HTMLElement} element - 表示する要素
     * @param {string} message - メッセージ
     * @param {number} speed - タイピング速度（ミリ秒）
     */
    typeMessage(element, message, speed = 50) {
        let index = 0;
        
        function typeChar() {
            if (index < message.length) {
                element.textContent += message.charAt(index);
                index++;
                setTimeout(typeChar, speed);
            }
        }
        
        typeChar();
    }

    /**
     * 読み込み状態を設定
     * @param {boolean} loading - 読み込み中かどうか
     */
    setLoading(loading) {
        this.isLoading = loading;
        
        if (this.sendButton) {
            this.sendButton.disabled = loading;
            this.sendButton.textContent = loading ? '送信中...' : '送信';
        }

        if (this.chatInput) {
            this.chatInput.disabled = loading;
        }

        // 読み込み中のアニメーションを表示
        if (loading) {
            this.showTypingIndicator();
        } else {
            this.hideTypingIndicator();
        }
    }

    /**
     * タイピングインジケーターを表示
     */
    showTypingIndicator() {
        if (!this.chatContainer) return;

        // 既存のインジケーターを削除
        this.hideTypingIndicator();

        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.id = 'typing-indicator';
        indicator.innerHTML = `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;

        this.chatContainer.appendChild(indicator);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    /**
     * タイピングインジケーターを非表示
     */
    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    /**
     * 会話履歴に追加
     * @param {string} role - 役割（user, ai）
     * @param {string} message - メッセージ
     */
    addToHistory(role, message) {
        this.conversationHistory.push({
            role: role,
            message: message,
            timestamp: new Date().toISOString()
        });

        // 最大履歴数を制限（50件）
        if (this.conversationHistory.length > 50) {
            this.conversationHistory = this.conversationHistory.slice(-50);
        }

        this.saveConversationHistory();
    }

    /**
     * 会話履歴を読み込み
     */
    async loadConversationHistory() {
        try {
            // ローカル履歴を読み込み
            const localHistory = Storage.get('conversationHistory');
            if (localHistory) {
                this.conversationHistory = localHistory;
            }

            // サーバー履歴を取得（非同期）
            if (window.apiClient) {
                const serverHistory = await apiClient.getChatHistory(this.currentUserId, 20);
                if (serverHistory.success && serverHistory.data.length > 0) {
                    console.log('✅ サーバーチャット履歴読み込み完了');
                }
            }
        } catch (error) {
            console.warn('⚠️ チャット履歴読み込みエラー:', error);
        }
    }

    /**
     * 会話履歴を保存
     */
    saveConversationHistory() {
        Storage.set('conversationHistory', this.conversationHistory);
    }

    /**
     * 現在の天気データを取得
     * @returns {Promise<Object>} - 天気データ
     */
    async getCurrentWeatherData() {
        try {
            console.log('🌤️ [DEBUG-WEATHER-1] 天気データAPIリクエスト開始...');
            const result = await apiClient.getWeatherData();
            console.log('🌤️ [DEBUG-WEATHER-2] 天気データAPIレスポンス:', result);
            
            if (result && result.success) {
                console.log('✅ [DEBUG-WEATHER-3] 天気データ取得成功:', {
                    weather: result.data?.current?.weather,
                    temperature: result.data?.current?.temperature,
                    hasWeatherData: !!result.data
                });
                return result.data;
            } else {
                console.warn('⚠️ [DEBUG-WEATHER-4] 天気データ取得失敗:', result);
                return null;
            }
        } catch (error) {
            console.error('❌ [DEBUG-WEATHER-5] 天気データ取得エラー:', error);
            return null;
        }
    }

    /**
     * メッセージをフォーマット
     * @param {string} message - 元のメッセージ
     * @returns {string} - フォーマットされたメッセージ
     */
    formatMessage(message) {
        // 改行をBRタグに変換
        return message.replace(/\n/g, '<br>');
    }

    /**
     * マスコットステータスを更新
     * @param {Object} status - ステータス情報
     */
    updateMascotStatus(status) {
        if (window.mascotDisplay) {
            mascotDisplay.updateStatus(status);
        }
    }

    /**
     * 初回メッセージを設定（無効化済み、吹き出し表示はしない）
     * @param {string} message - 初回メッセージ
     */
    setInitialMessage(message) {
        console.log('🚫 [DEBUG-CI-INITIAL] 初回メッセージ設定は無効化済み（吹き出し非表示）');
        // 意図的に空にして吹き出し表示を停止
        return;
    }
}

// グローバルインスタンス
console.log('🌍 ChatInterfaceインスタンス作成中...');
const chatInterface = new ChatInterface();

// グローバルアクセス用
if (typeof window !== 'undefined') {
    window.chatInterface = chatInterface;
}