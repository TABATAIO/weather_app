/**
 * チャットインターフェース管理クラス
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
        this.setupElements();
        this.loadConversationHistory();
    }

    setupElements() {
        // チャット要素の取得
        this.chatContainer = document.getElementById('chat-container');
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-button');
        this.aiCommentElement = document.getElementById('ai-comment');

        // イベントリスナーの設定
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => this.sendMessage());
        }

        if (this.chatInput) {
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
    }

    /**
     * メッセージを送信
     */
    async sendMessage() {
        const message = this.chatInput?.value.trim();
        if (!message || this.isLoading) return;

        // UI更新
        this.addMessageToChat('user', message);
        this.chatInput.value = '';
        this.setLoading(true);

        try {
            // 天気データを取得
            const weatherData = await this.getCurrentWeatherData();

            // APIに送信するデータを準備
            const chatData = {
                message: message,
                userName: this.userName,
                userId: this.currentUserId,
                weatherData: weatherData,
                conversationHistory: this.conversationHistory.slice(-10) // 直近10件のみ
            };

            // APIコール
            const response = await apiClient.sendMascotChat(chatData);
            
            if (response.success) {
                // AIの返答を表示
                this.addMessageToChat('ai', response.data.response);
                
                // マスコットの状態を更新
                if (response.data.mascotStatus) {
                    this.updateMascotStatus(response.data.mascotStatus);
                }

                // 会話履歴に追加
                this.addToHistory('user', message);
                this.addToHistory('ai', response.data.response);
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
     * チャットにメッセージを追加
     * @param {string} sender - 送信者（user, ai, system）
     * @param {string} message - メッセージ
     */
    addMessageToChat(sender, message) {
        if (!this.chatContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${sender}`;
        
        const time = formatTime();
        const senderName = sender === 'user' ? this.userName : 'マスコット';
        
        messageElement.innerHTML = `
            <div class="message-header">
                <span class="sender-name">${senderName}</span>
                <span class="message-time">${time}</span>
            </div>
            <div class="message-content">${this.formatMessage(message)}</div>
        `;

        this.chatContainer.appendChild(messageElement);
        
        // スクロールを最下部に
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;

        // AIの場合は吹き出しにも表示
        if (sender === 'ai') {
            this.updateAiComment(message);
        }
    }

    /**
     * AIコメントを更新
     * @param {string} message - メッセージ
     */
    updateAiComment(message) {
        if (!this.aiCommentElement) return;

        // タイピングアニメーションで表示
        this.aiCommentElement.textContent = '';
        this.typeMessage(this.aiCommentElement, message, 50);
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
     * 会話履歴を保存
     */
    saveConversationHistory() {
        Storage.set('conversationHistory', this.conversationHistory);
    }

    /**
     * 会話履歴を読み込み
     */
    loadConversationHistory() {
        const saved = Storage.get('conversationHistory');
        if (saved) {
            this.conversationHistory = saved;
        }
    }

    /**
     * 現在の天気データを取得
     * @returns {Promise<Object>} - 天気データ
     */
    async getCurrentWeatherData() {
        try {
            return await apiClient.getWeatherData();
        } catch (error) {
            console.warn('天気データの取得に失敗:', error);
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
     * 初回メッセージを設定
     * @param {string} message - 初回メッセージ
     */
    setInitialMessage(message) {
        if (this.aiCommentElement) {
            this.updateAiComment(message);
        }
    }
}

// グローバルインスタンス
const chatInterface = new ChatInterface();