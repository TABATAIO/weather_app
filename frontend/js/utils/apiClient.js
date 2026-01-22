/**
 * API通信用ユーティリティクラス
 */
class ApiClient {
    constructor(baseUrl = 'http://localhost:3001') {
        this.baseUrl = baseUrl;
    }

    /**
     * マスコットとチャットする
     * @param {Object} chatData - チャットデータ
     * @returns {Promise<Object>} - チャットレスポンス
     */
    async sendMascotChat(chatData) {
        try {
            const response = await fetch(`${this.baseUrl}/api/mascot/chat`, {
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
            const response = await fetch(`${this.baseUrl}/api/weather/city/${cityName}`);
            
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