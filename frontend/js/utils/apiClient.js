console.log('📁 [SCRIPT-LOAD] apiClient.js読み込み開始...');

/**
 * API通信用ユーティリティクラス
 */
class ApiClient {
    constructor(baseUrl = '') {
        this.hostname = window.location.hostname;
        this.port = window.location.port;
        this.protocol = window.location.protocol;
        this.isDocker = this.hostname !== 'localhost' && this.hostname !== '127.0.0.1';
        this.baseUrl = this.isDocker ? '' : 'http://localhost:3001';
    }

    /**
     * 天気情報を取得する（都市名指定）
     * @param {string} cityName - 都市名
     * @returns {Promise<Object>} - 天気データ
     */
    async getCurrentWeather(cityName = 'tokyo') {
        try {
            const url = `${this.baseUrl}/api/weather/city/${cityName}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
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
     * 汎用GET関数
     * @param {string} endpoint - エンドポイント（例：'/mascot/1'）
     * @returns {Promise<Object>} - APIレスポンス
     */
    async get(endpoint) {
        try {
            const url = `${this.baseUrl}/api${endpoint}`;
            console.log('GET リクエスト:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API GETエラー:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API GET エラー:', error);
            throw error;
        }
    }

    /**
     * 汎用POST関数
     * @param {string} endpoint - エンドポイント（例：'/mascot/update'）
     * @param {Object} data - 送信データ
     * @returns {Promise<Object>} - APIレスポンス
     */
    async post(endpoint, data) {
        try {
            const url = `${this.baseUrl}/api${endpoint}`;
            console.log('POST リクエスト:', url, data);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API POSTエラー:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API POST エラー:', error);
            throw error;
        }
    }

    /**
     * レガシー互換性のため
     */
    async getWeatherData(cityName = 'tokyo') {
        return this.getCurrentWeather(cityName);
    }

    /**
     * マスコットのステータスを取得
     * @returns {Promise<Object>} - マスコットデータ
     */
    async getMascotStatus() {
        try {
            const url = `http://localhost:8000/api/mascot/status`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`マスコットステータス取得エラー: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('マスコットステータス取得エラー:', error);
            throw error;
        }
    }

    /**
     * マスコットにエサをあげる
     * @returns {Promise<Object>} - 結果データ
     */
    async feedMascot() {
        try {
            const url = `http://localhost:8000/api/mascot/feed`;
            console.log('マスコット給餌 API URL:', url);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });
            
            if (!response.ok) {
                throw new Error(`マスコット給餌エラー: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('マスコット給餌結果:', data);
            return data;
        } catch (error) {
            console.error('マスコット給餌エラー:', error);
            throw error;
        }
    }

    /**
     * マスコットと遊ぶ
     * @returns {Promise<Object>} - 結果データ
     */
    async playWithMascot() {
        try {
            const url = `http://localhost:8000/api/mascot/play`;
            console.log('マスコット遊ぶ API URL:', url);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });
            
            if (!response.ok) {
                throw new Error(`マスコット遊ぶエラー: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('マスコット遊ぶ結果:', data);
            return data;
        } catch (error) {
            console.error('マスコット遊ぶエラー:', error);
            throw error;
        }
    }

    /**
     * マスコットをなでる
     * @returns {Promise<Object>} - 結果データ
     */
    async petMascot() {
        try {
            const url = `http://localhost:8000/api/mascot/pet`;
            console.log('マスコットなでる API URL:', url);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });
            
            if (!response.ok) {
                throw new Error(`マスコットなでるエラー: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('マスコットなでる結果:', data);
            return data;
        } catch (error) {
            console.error('マスコットなでるエラー:', error);
            throw error;
        }
    }

    /**
     * 今日のミッション一覧を取得
     * @returns {Promise<Object>} - ミッションデータ
     */
    async getTodayMissions() {
        try {
            console.log('� [MISSION-1] ミッション取得開始...');
            
            // Docker環境か判定してエンドポイントを切り替え
            const missionUrl = this.isDocker ? 
                'http://localhost:8000/api/missions/today' : 
                'http://localhost:8000/api/missions/today';
            
            console.log('📡 [MISSION-2] URL構築完了:', {
                missionUrl: missionUrl,
                isDocker: this.isDocker,
                hostname: this.hostname,
                port: this.port
            });
            
            console.log('🌐 [MISSION-3] fetchリクエスト開始...');
            console.time('fetch-duration');
            
            const response = await fetch(missionUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            console.timeEnd('fetch-duration');
            console.log('📥 [MISSION-4] fetchレスポンス受信:', {
                url: missionUrl,
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                headers: Object.fromEntries(response.headers.entries())
            });
            
            if (!response.ok) {
                console.error('❌ [MISSION-5] HTTPエラー検出:', response.status);
                throw new Error(`ミッション取得エラー: ${response.status}`);
            }
            
            console.log('🔄 [MISSION-6] JSON解析開始...');
            const data = await response.json();
            console.log('📦 [MISSION-7] JSON解析完了:', {
                dataType: typeof data,
                hasSuccess: 'success' in data,
                hasData: 'data' in data,
                dataKeys: Object.keys(data),
                dataSize: JSON.stringify(data).length
            });
            
            console.log('✅ [MISSION-8] ミッション取得完了:', data);
            return data;
        } catch (error) {
            console.error('💥 [MISSION-ERROR] ミッション取得失敗:', {
                errorName: error.name,
                errorMessage: error.message,
                errorStack: error.stack.split('\n').slice(0, 5)
            });
            throw error;
        }
    }

    /**
     * ミッション進捗を更新
     * @param {string} action - アクション名
     * @returns {Promise<Object>} - 結果データ
     */
    async updateMissionProgress(action) {
        try {
            // Docker環境か判定してエンドポイントを切り替え
            const progressUrl = this.isDocker ? 
                'http://localhost:8000/api/missions/progress' : 
                'http://localhost:8000/api/missions/progress';
            console.log('ミッション進捗更新 API URL:', progressUrl);
            
            const response = await fetch(progressUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action: action })
            });
            
            if (!response.ok) {
                throw new Error(`ミッション進捗更新エラー: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('ミッション進捗更新結果:', data);
            return data;
        } catch (error) {
            console.error('ミッション進捗更新エラー:', error);
            throw error;
        }
    }

    /**
     * 餌やりAPI
     * @param {string} foodType - 餌の種類
     * @param {number} fullnessValue - 満腹度の増加値
     */
    async feedMascot(foodType = 'riceball', fullnessValue = 20) {
        try {
            const url = `http://localhost:8000/api/mascot/feed`;
            console.log('🍙 餌やりAPI呼び出し:', url, { foodType, fullnessValue });
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    food_type: foodType,
                    fullness_value: fullnessValue
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ 餌やり成功:', data);
                return { success: true, data };
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ 餌やり失敗:', response.status, errorData);
                return { success: false, error: errorData.error || 'API呼び出しに失敗しました' };
            }
        } catch (error) {
            console.error('❌ 餌やりAPIエラー:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 撫でるAPI
     */
    async petMascot() {
        try {
            const url = `http://localhost:8000/api/mascot/pet`;
            console.log('✋ 撫でるAPI呼び出し:', url);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ 撫でる成功:', data);
                return { success: true, data };
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ 撫でる失敗:', response.status, errorData);
                return { success: false, error: errorData.error || 'API呼び出しに失敗しました' };
            }
        } catch (error) {
            console.error('❌ 撫でるAPIエラー:', error);
            return { success: false, error: error.message };
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

    /**
     * マスコットの名前を更新
     * @param {string} newName - 新しい名前
     * @returns {Promise<Object>}
     */
    async updateMascotName(newName) {
        try {
            console.log('🏷️ [NAME-UPDATE-1] 名前更新開始:', newName);
            
            // 入力値の検証
            if (!newName || typeof newName !== 'string' || newName.trim().length === 0) {
                throw new Error('名前が入力されていません');
            }
            
            if (newName.trim().length > 20) {
                throw new Error('名前は20文字以内で入力してください');
            }
            
            const url = `${this.baseUrl}/api/mascot/update-name`;
            console.log('📡 [NAME-UPDATE-2] URL構築完了:', url);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: newName.trim()
                })
            });
            
            console.log('📥 [NAME-UPDATE-3] レスポンス受信:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `名前更新エラー: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ [NAME-UPDATE-4] 名前更新完了:', data);
            return data;
        } catch (error) {
            console.error('❌ 名前更新エラー:', error);
            throw error;
        }
    }
}

// グローバルなAPIクライアントインスタンス
const apiClient = new ApiClient();
window.apiClient = apiClient;