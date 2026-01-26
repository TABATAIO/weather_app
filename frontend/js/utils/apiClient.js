/**
 * API通信用ユーティリティクラス
 */
class ApiClient {
    constructor(baseUrl = '') {
        this.hostname = window.location.hostname;
        this.port = window.location.port;
        this.protocol = window.location.protocol;
        
        console.log('APIクライアント初期化:', {
            hostname: this.hostname,
            port: this.port,
            protocol: this.protocol,
            location: window.location.href
        });
        
        // Docker環境での判定を改善
        this.isDocker = this.hostname !== 'localhost' && this.hostname !== '127.0.0.1';
        
        if (this.isDocker) {
            // Docker環境では相対パス
            this.baseUrl = '';
        } else {
            // ローカル開発環境ではバックエンドポート
            this.baseUrl = 'http://localhost:3001';
        }
        
        console.log('API設定:', {
            isDocker: this.isDocker,
            baseUrl: this.baseUrl
        });
    }

    /**
     * 天気情報を取得する
     * @param {string} cityName - 都市名
     * @returns {Promise<Object>} - 天気データ
     */
    async getWeatherData(cityName = 'tokyo') {
        try {
            const url = `${this.baseUrl}/api/weather/city/${cityName}`;
            console.log('天気API URL:', url);
            
            const response = await fetch(url);
            console.log('API レスポンス:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                url: response.url
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API エラーレスポンス:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('取得した天気データ:', data);
            return data;
        } catch (error) {
            console.error('天気データ取得エラー詳細:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    /**
     * マスコットとチャットする
     * @param {Object} chatData - チャットデータ
     * @returns {Promise<Object>} - チャットレスポンス
     */
    async sendMascotChat(chatData) {
        try {
            const url = `${this.baseUrl}/api/mascot/chat`;
            console.log('チャットAPI URL:', url);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(chatData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('マスコットチャットエラー:', error);
            throw error;
        }
    }

    /**
     * API接続テスト
     */
    async testConnection() {
        try {
            const url = `${this.baseUrl}/api`;
            console.log('API接続テスト URL:', url);
            
            const response = await fetch(url);
            console.log('API接続テスト結果:', {
                status: response.status,
                ok: response.ok
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('API情報:', data);
                return true;
            }
            return false;
        } catch (error) {
            console.error('API接続テストエラー:', error);
            return false;
        }
    }
}

// グローバルなAPIクライアントインスタンス
const apiClient = new ApiClient();