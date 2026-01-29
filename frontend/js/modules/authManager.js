/**
 * 認証管理モジュール
 * ユーザーのログイン状態管理とトークンベース認証を提供
 */

class AuthManager {
    constructor() {
        this.apiBaseUrl = window.location.origin;
        this.tokenKey = 'authToken';
        this.userKey = 'user';
    }

    /**
     * ユーザーがログインしているかチェック
     * @returns {boolean} ログイン状態
     */
    isAuthenticated() {
        const token = this.getToken();
        return token !== null && !this.isTokenExpired(token);
    }

    /**
     * 保存されたトークンを取得
     * @returns {string|null} JWT トークン
     */
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    /**
     * 保存されたユーザー情報を取得
     * @returns {Object|null} ユーザー情報
     */
    getUser() {
        const userStr = localStorage.getItem(this.userKey);
        return userStr ? JSON.parse(userStr) : null;
    }

    /**
     * トークンが期限切れかチェック
     * @param {string} token JWT トークン
     * @returns {boolean} 期限切れの場合true
     */
    isTokenExpired(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp < currentTime;
        } catch (error) {
            console.error('トークン解析エラー:', error);
            return true;
        }
    }

    /**
     * ユーザーのサインイン
     * @param {string} email メールアドレス
     * @param {string} password パスワード
     * @returns {Promise<Object>} サインイン結果
     */
    async signin(email, password) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/auth/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (result.success) {
                // トークンとユーザー情報を保存
                localStorage.setItem(this.tokenKey, result.token);
                localStorage.setItem(this.userKey, JSON.stringify(result.user));
            }

            return result;
        } catch (error) {
            console.error('サインインエラー:', error);
            return {
                success: false,
                error: 'ネットワークエラーが発生しました'
            };
        }
    }

    /**
     * ユーザーのサインアップ
     * @param {string} username ユーザー名
     * @param {string} email メールアドレス
     * @param {string} password パスワード
     * @returns {Promise<Object>} サインアップ結果
     */
    async signup(username, email, password) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('サインアップエラー:', error);
            return {
                success: false,
                error: 'ネットワークエラーが発生しました'
            };
        }
    }

    /**
     * トークンを検証
     * @returns {Promise<Object>} 検証結果
     */
    async verifyToken() {
        const token = this.getToken();
        if (!token) {
            return { success: false, error: 'トークンが見つかりません' };
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/auth/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('トークン検証エラー:', error);
            return {
                success: false,
                error: 'トークン検証に失敗しました'
            };
        }
    }

    /**
     * ユーザーをログアウト
     */
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        
        // ログインページにリダイレクト
        window.location.href = 'auth.html';
    }

    /**
     * 認証が必要なAPIリクエストのヘッダーを取得
     * @returns {Object} 認証ヘッダー
     */
    getAuthHeaders() {
        const token = this.getToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    /**
     * 認証が必要なAPIを呼び出し
     * @param {string} url API URL
     * @param {Object} options fetch オプション
     * @returns {Promise<Response>} レスポンス
     */
    async authenticatedFetch(url, options = {}) {
        const token = this.getToken();
        
        if (!token) {
            throw new Error('認証トークンが見つかりません');
        }

        const authHeaders = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };

        const response = await fetch(url, {
            ...options,
            headers: authHeaders
        });

        // 401エラーの場合はログアウト
        if (response.status === 401) {
            this.logout();
            throw new Error('認証が無効です。再ログインしてください。');
        }

        return response;
    }

    /**
     * ページアクセス時の認証チェック（認証が必要なページ用）
     */
    requireAuth() {
        if (!this.isAuthenticated()) {
            alert('ログインが必要です。ログインページにリダイレクトします。');
            window.location.href = 'auth.html';
            return false;
        }
        return true;
    }

    /**
     * ログイン状態での認証ページアクセス防止
     */
    preventAuthPageAccess() {
        if (this.isAuthenticated()) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }
}

// グローバルインスタンスを作成
const authManager = new AuthManager();

// モジュールとしてエクスポート（ES6モジュール使用時）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}

// ブラウザでのグローバル使用
if (typeof window !== 'undefined') {
    window.AuthManager = AuthManager;
    window.authManager = authManager;
}