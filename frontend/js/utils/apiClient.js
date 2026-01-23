/**
 * API通信用ユーティリティクラス
 */
class ApiClient {
    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl.replace('/api', ''); // プロキシ経由の場合は相対パスを使用
        this.isDocker = window.location.hostname !== 'localhost';
    }

    /**
     * マスコットとチャットする
     * @param {Object} chatData - チャットデータ
     * @returns {Promise<Object>} - チャットレスポンス
     */
    async sendMascotChat(chatData) {
        try {
            const url = this.isDocker ? '/api/mascot/chat' : `${this.baseUrl || 'http://localhost:3001'}/api/mascot/chat`;
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
     * 天気情報を取得する
     * @param {string} cityName - 都市名
     * @returns {Promise<Object>} - 天気データ
     */
    async getWeatherData(cityName = 'tokyo') {
        try {
            const url = this.isDocker ? `/api/weather/city/${cityName}` : `${this.baseUrl || 'http://localhost:3001'}/api/weather/city/${cityName}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('天気データ取得エラー:', error);
            throw error;
        }
    }
}

// グローバルなAPIクライアントインスタンス
const apiClient = new ApiClient();