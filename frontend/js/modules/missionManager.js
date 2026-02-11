console.log('📁 [SCRIPT-LOAD] missionManager.js読み込み開始...');

/**
 * ミッション管理クラス
 */
class MissionManager {
    constructor() {
        console.log('🏗️ [CONSTRUCTOR-1] MissionManagerコンストラクタ開始...');
        
        try {
            this.missions = [];
            this.missionContainer = null;
            this.missionList = null;
            this.lastUpdate = 0;
            
            console.log('⚙️ [CONSTRUCTOR-2] 基本プロパティ設定完了');
            
            console.log('🚀 [CONSTRUCTOR-3] init メソッド呼び出し開始...');
            this.init().then(() => {
                console.log('✅ [CONSTRUCTOR-4] init メソッド完了');
            }).catch(error => {
                console.error('❌ [CONSTRUCTOR-5] init メソッドでエラー:', error);
            });
            
            console.log('✅ [CONSTRUCTOR-6] コンストラクタ完了');
        } catch (error) {
            console.error('💥 [CONSTRUCTOR-ERROR] コンストラクタエラー:', {
                name: error.name,
                message: error.message,
                stack: error.stack?.split('\n').slice(0, 5)
            });
        }
    }

    async init() {
        console.log('⚙️ [INIT-1] MissionManager init処理開始...');
        
        console.log('🔧 [INIT-2] DOM要素設定中...');
        this.setupElements();
        console.log('✅ [INIT-3] DOM要素設定完了');
        
        console.log('📡 [INIT-4] ミッション読み込み開始...');
        await this.loadTodayMissions();
        console.log('✅ [INIT-5] ミッション読み込み完了');
        
        console.log('🎨 [INIT-6] ミッション表示中...');
        this.renderMissions();
        console.log('✅ [INIT-7] ミッション表示完了');
        
        console.log('⏰ [INIT-8] 定期更新タイマー設定...');
        // 定期的にミッション状況を更新
        setInterval(() => this.checkMissionUpdates(), 30000); // 30秒ごと
        console.log('✅ [INIT-9] init処理全体完了');
    }

    setupElements() {
        console.log('🔍 [SETUP-1] DOM要素検索開始...');
        
        this.missionContainer = document.getElementById('mission-container');
        this.missionList = document.getElementById('mission-list');
        
        console.log('🎨 [SETUP-2] DOM要素検索結果:', {
            missionContainer: this.missionContainer ? '✅ 発見' : '❌ 未発見',
            missionList: this.missionList ? '✅ 発見' : '❌ 未発見'
        });
        
        if (!this.missionList) {
            console.error('❌ [SETUP-3] ミッションリスト要素が見つかりません');
            console.log('📄 [SETUP-4] 利用可能なID要素一覧:', 
                Array.from(document.querySelectorAll('[id]'))
                    .map(el => el.id)
                    .filter(id => id.includes('mission') || id.includes('list'))
            );
        } else {
            console.log('✅ [SETUP-5] ミッションリスト要素発見');
        }
    }

    /**
     * UI状態を更新
     * @param {string} state - 状態: 'loading', 'loaded', 'error'
     */
    updateUI(state) {
        if (!this.missionList) return;

        switch (state) {
            case 'loading':
                this.missionList.innerHTML = '<div class="mission-status">🔄 Laravelからデータ取得中...</div>';
                console.log('UI状態: ローディング中');
                break;
            case 'loaded':
                console.log('UI状態: 読み込み完了 - DOM状態をafter表示に切り替え');
                // ミッションコンテナのbeforeクラスを削除してafterクラスを追加
                if (this.missionContainer) {
                    this.missionContainer.classList.remove('before');
                    this.missionContainer.classList.add('after');
                }
                // mission-list要素も同様に更新
                if (this.missionList) {
                    this.missionList.classList.remove('before');
                    this.missionList.classList.add('after');
                    // ローディング表示をクリア
                    this.missionList.innerHTML = '';
                }
                break;
            case 'error':
                this.missionList.innerHTML = '<div class="mission-status">❌ データ取得に失敗しました</div>';
                console.log('UI状態: エラー');
                break;
            default:
                console.warn('未知のUI状態:', state);
        }
    }

    /**
     * 今日のミッションを読み込み
     */
    async loadTodayMissions() {
        try {
            console.log('🎯 [MM-1] ミッションマネージャー開始...');
            
            if (typeof apiClient === 'undefined') {
                console.warn('❌ [MM-2] APIクライアントが読み込まれていません');
                this.loadDefaultMissions();
                return;
            }

            console.log('📡 [MM-3] APIクライアント確認OK、ミッション取得開始...');
            this.updateUI('loading'); // ローディング状態を表示
            console.log('🔄 [MM-4] UI状態をローディングに更新');
            
            console.log('⏳ [MM-5] APIクライアント呼び出し中...');
            const response = await apiClient.getTodayMissions();
            console.log('📦 [MM-6] APIからのレスポンス受信:', {
                responseType: typeof response,
                hasSuccess: response && 'success' in response,
                successValue: response?.success,
                responseKeys: response ? Object.keys(response) : 'null'
            });
            
            if (response.success) {
                console.log('✅ [MM-7] ミッション取得成功、データ設定中...');
                this.missions = response.data;
                console.log('📝 [MM-8] ミッションデータ設定完了:', {
                    missionCount: this.missions.length,
                    missionIds: this.missions.map(m => m.id || m.name).slice(0, 3)
                });
                
                console.log('🎨 [MM-9] UI状態を読み込み完了に更新...');
                this.updateUI('loaded');
                
                console.log('🖼️ [MM-10] ミッション表示メソッド呼び出し...');
                this.display();
                console.log('✅ [MM-11] 全処理完了');
            } else {
                console.error('❌ [MM-ERROR-1] ミッション読み込み失敗:', response.error);
                this.updateUI('error');
                this.loadDefaultMissions();
            }
        } catch (error) {
            console.error('💥 [MM-ERROR-2] ミッション読み込み例外:', {
                errorName: error.name,
                errorMessage: error.message,
                errorStack: error.stack?.split('\n').slice(0, 3)
            });
            this.updateUI('error');
            this.loadDefaultMissions();
        }
    }

    /**
     * デフォルトミッション（APIが利用できない場合）
     */
    loadDefaultMissions() {
        console.log('🔧 デフォルトミッションを読み込み中...');
        this.missions = [
            {
                id: 'default-1',
                name: '今日の天気を見る',
                description: '今日の天気情報をチェックしよう',
                mission_type: 'weather_check',
                target_action: 'view_today_weather',
                reward_exp: 10,
                icon: '☀️',
                is_completed: false,
                progress: 0,
                target_count: 1,
                progress_percentage: 0
            },
            {
                id: 'default-2',
                name: 'キャラクターをタッチする',
                description: 'マスコットをタッチしてコミュニケーション',
                mission_type: 'interaction',
                target_action: 'touch_mascot',
                reward_exp: 12,
                icon: '✋',
                is_completed: false,
                progress: 0,
                target_count: 3,
                progress_percentage: 0
            },
            {
                id: 'default-3',
                name: 'キャラクターのセリフをタップ',
                description: 'マスコットの吹き出しをタップしてみよう',
                mission_type: 'interaction',
                target_action: 'tap_mascot_speech',
                reward_exp: 10,
                icon: '💭',
                is_completed: false,
                progress: 0,
                target_count: 1,
                progress_percentage: 0
            }
        ];
        console.log('🔄 デフォルトミッション読み込み:', this.missions);
        this.updateUI('loaded'); // デフォルトミッション読み込み完了
        this.display(); // 実際のミッション表示を実行
    }

    /**
     * ミッション表示メイン処理
     */
    display() {
        console.log('📺 [DISPLAY-1] ミッション表示メイン処理開始...');
        
        // UI状態を確実に'loaded'に切り替え
        console.log('🔄 [DISPLAY-2] UI状態をloaded状態に強制切り替え...');
        if (this.missionContainer) {
            this.missionContainer.classList.remove('before');
            this.missionContainer.classList.add('after');
            console.log('✅ [DISPLAY-3] missionContainer状態切り替え完了');
        }
        if (this.missionList) {
            this.missionList.classList.remove('before');
            this.missionList.classList.add('after');
            console.log('✅ [DISPLAY-4] missionList状態切り替え完了');
        }
        
        this.renderMissions();
        console.log('✅ [DISPLAY-5] ミッション表示メイン処理完了');
    }

    /**
     * ミッション表示を更新
     */
    renderMissions() {
        console.log('🖼️ [RENDER-1] ミッション表示処理開始...');
        
        if (!this.missionList) {
            console.error('❌ [RENDER-2] missionList要素が見つかりません');
            return;
        }
        
        console.log('📋 [RENDER-3] ミッションデータ確認:', {
            missionCount: this.missions.length,
            missionListElement: this.missionList ? 'OK' : 'NG',
            missions: this.missions.map(m => ({ 
                id: m.id, 
                name: m.name, 
                completed: m.is_completed 
            }))
        });

        const missionHTML = this.missions.map((mission, index) => {
            console.log(`🎯 [RENDER-4-${index}] ミッション${index + 1}処理中:`, mission.name);
            const progressText = this.getProgressText(mission);
            const statusClass = mission.is_completed ? 'completed' : 
                               mission.progress > 0 ? 'in-progress' : 'not-started';
            
            const actionButton = this.getActionButton(mission);
            
            return `
                <div class="mission-item ${statusClass}" data-mission-id="${mission.id}" data-index="${index}">
                    <div class="mission-icon">${this.getMissionIcon(mission)}</div>
                    <div class="mission-content">
                        <div class="mission-name">${mission.name}</div>
                        <div class="mission-description">${mission.description}</div>
                        <div class="mission-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${mission.progress_percentage || 0}%"></div>
                            </div>
                            <span class="progress-text">${progressText}</span>
                        </div>
                    </div>
                    <div class="mission-reward">
                        <span class="exp-reward">EXP +${mission.reward_exp}</span>
                        ${mission.is_completed ? '<span class="completed-mark">✓</span>' : ''}
                    </div>
                    ${actionButton}
                </div>
            `;
        }).join('');

        console.log('📝 [RENDER-5] HTML生成完了、DOM更新中...');
        console.log('📏 [RENDER-6] 生成されたHTML長さ:', missionHTML.length);
        
        this.missionList.innerHTML = missionHTML;
        console.log('✅ [RENDER-7] DOM更新完了');
        
        console.log('🔗 [RENDER-8] イベントアタッチ開始...');
        this.attachMissionEvents();
        console.log('✅ [RENDER-9] 全レンダリング処理完了');
    }

    /**
     * ミッションの進捗テキストを取得
     */
    getProgressText(mission) {
        if (mission.is_completed) {
            return '完了！';
        }
        
        const currentProgress = mission.progress || 0;
        const targetCount = mission.target_count || 1;
        
        return `${currentProgress}/${targetCount}`;
    }

    /**
     * ミッションアイコンを取得
     */
    getMissionIcon(mission) {
        const iconMap = {
            'view_today_weather': '☀️',
            'chat_with_mascot': '💬',
            'touch_mascot': '✋',
            'check_precipitation': '🌧️',
            'view_rain_radar': '📡',
            'view_weekly_weather': '📅',
            'view_temperature': '🌡️',
            'view_weather_news': '📰',
            'tap_mascot_speech': '💭'
        };
        
        return mission.icon || iconMap[mission.target_action] || '📋';
    }
    /**
     * ミッションアクションボタンを取得
     */
    getActionButton(mission) {
        if (mission.is_completed) {
            return '';
        }

        const buttonText = this.getActionButtonText(mission);
        const isExternal = this.isExternalAction(mission.target_action);
        
        return `
            <button class="mission-action-btn ${isExternal ? 'external' : 'internal'}" 
                    data-action="${mission.target_action}" 
                    data-mission-id="${mission.id}">
                ${buttonText}
            </button>
        `;
    }

    /**
     * アクションボタンのテキストを取得
     */
    getActionButtonText(mission) {
        const buttonTextMap = {
            'view_today_weather': '天気を見る',
            'chat_with_mascot': 'チャット',
            'touch_mascot': 'タッチする',
            'check_precipitation': '降水確認',
            'view_rain_radar': '雨雲レーダー',
            'view_weekly_weather': '週間予報',
            'view_temperature': '気温確認',
            'view_weather_news': '天気ニュース',
            'tap_mascot_speech': 'セリフタップ'
        };
        
        return buttonTextMap[mission.target_action] || '実行';
    }

    /**
     * 外部リンクかどうかを判定
     */
    isExternalAction(action) {
        const externalActions = [
            'view_today_weather',
            'check_precipitation',
            'view_rain_radar',
            'view_weekly_weather',
            'view_temperature',
            'view_weather_news'
        ];
        
        return externalActions.includes(action);
    }

    /**
     * ミッションイベントをアタッチ
     */
    attachMissionEvents() {
        const actionButtons = this.missionList.querySelectorAll('.mission-action-btn');
        
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const action = button.dataset.action;
                const missionId = button.dataset.missionId;
                this.executeMissionAction(action, missionId);
            });
        });
    }

    /**
     * ミッションアクションを実行
     */
    async executeMissionAction(action, missionId) {
        console.log('🎯 ミッションアクション実行:', action, missionId);
        
        try {
            // 外部リンクアクション
            if (this.isExternalAction(action)) {
                this.openExternalLink(action);
            } else {
                // 内部アクション
                this.executeInternalAction(action);
            }
            
            // ミッション進捗を更新
            await this.updateMissionProgress(missionId);
            
        } catch (error) {
            console.error('ミッションアクション実行エラー:', error);
        }
    }

    /**
     * 外部リンクを開く
     */
    openExternalLink(action) {
        const linkMap = {
            'view_today_weather': 'https://weathernews.jp/onebox/',
            'check_precipitation': 'https://weathernews.jp/radar/',
            'view_rain_radar': 'https://weathernews.jp/radar/',
            'view_weekly_weather': 'https://weathernews.jp/forecast/',
            'view_temperature': 'https://weathernews.jp/onebox/',
            'view_weather_news': 'https://weathernews.jp/news/'
        };
        
        const url = linkMap[action];
        if (url) {
            window.open(url, '_blank');
            console.log('🔗 外部リンク開いた:', url);
        }
    }

    /**
     * 内部アクションを実行
     */
    executeInternalAction(action) {
        switch (action) {
            case 'chat_with_mascot':
                // チャットページに移動
                window.location.href = 'chat_page.html';
                break;
            case 'touch_mascot':
                // マスコットタッチイベントを発火
                this.triggerMascotTouch();
                break;
            case 'tap_mascot_speech':
                // マスコットのセリフをタップ
                this.triggerSpeechTap();
                break;
            default:
                console.log('未定義の内部アクション:', action);
        }
    }

    /**
     * マスコットタッチを発火
     */
    triggerMascotTouch() {
        const mascotElement = document.querySelector('.mascot, #mascot, .mascot-display');
        if (mascotElement) {
            mascotElement.click();
            console.log('👆 マスコットタッチを実行');
        } else {
            console.warn('マスコット要素が見つかりません');
        }
    }

    /**
     * マスコットセリフタップを発火
     */
    triggerSpeechTap() {
        const speechElement = document.querySelector('.speech-bubble, .mascot-speech, .dialog-bubble');
        if (speechElement) {
            speechElement.click();
            console.log('💭 マスコットセリフタップを実行');
        } else {
            console.warn('セリフ要素が見つかりません');
        }
    }

    /**
     * ミッション進捗を更新
     */
    async updateMissionProgress(missionId) {
        try {
            if (typeof apiClient === 'undefined') {
                console.warn('APIクライアントが利用できません');
                this.updateLocalProgress(missionId);
                return;
            }

            const response = await apiClient.updateMissionProgress(missionId);
            
            if (response.success) {
                console.log('📈 ミッション進捗更新:', response.data);
                
                // ローカルのミッション状態を更新
                this.updateLocalMissionState(missionId, response.data);
                
                // 完了時の処理
                if (response.data.is_completed && !response.data.was_already_completed) {
                    this.showMissionCompleteNotification(response.data);
                }
                
                // 表示を更新
                this.renderMissions();
            } else {
                console.error('ミッション進捗更新失敗:', response.error);
                this.updateLocalProgress(missionId);
            }
        } catch (error) {
            console.error('ミッション進捗更新エラー:', error);
            this.updateLocalProgress(missionId);
        }
    }

    /**
     * ローカルのミッション状態を更新
     */
    updateLocalMissionState(missionId, updatedMission) {
        const missionIndex = this.missions.findIndex(m => m.id == missionId);
        if (missionIndex !== -1) {
            this.missions[missionIndex] = { ...this.missions[missionIndex], ...updatedMission };
        }
    }

    /**
     * ローカル進捗更新（APIが利用できない場合）
     */
    updateLocalProgress(missionId) {
        const mission = this.missions.find(m => m.id == missionId);
        if (mission && !mission.is_completed) {
            mission.progress = Math.min((mission.progress || 0) + 1, mission.target_count || 1);
            mission.progress_percentage = (mission.progress / (mission.target_count || 1)) * 100;
            
            if (mission.progress >= (mission.target_count || 1)) {
                mission.is_completed = true;
                mission.progress_percentage = 100;
                this.showMissionCompleteNotification(mission);
            }
            
            this.renderMissions();
            console.log('📊 ローカル進捗更新:', mission);
        }
    }

    /**
     * ミッション完了通知を表示
     */
    showMissionCompleteNotification(mission) {
        const notification = document.createElement('div');
        notification.className = 'mission-complete-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">🎉</div>
                <div class="notification-text">
                    <strong>ミッション完了！</strong><br>
                    ${mission.name}<br>
                    <span class="exp-gained">EXP +${mission.reward_exp}</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // アニメーション効果
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        console.log('🎊 ミッション完了通知:', mission.name);
    }

    /**
     * ミッション状況を定期チェック
     */
    async checkMissionUpdates() {
        // API経由でミッション状況をチェック
        if (Date.now() - this.lastUpdate > 60000) { // 1分以上経過
            await this.loadTodayMissions();
            this.lastUpdate = Date.now();
        }
    }

    /**
     * 特定のアクションに対してミッション進捗を記録
     */
    async recordAction(actionType) {
        console.log('📝 アクション記録:', actionType);
        
        // 該当するミッションを探す
        const relevantMissions = this.missions.filter(
            mission => mission.target_action === actionType && !mission.is_completed
        );
        
        // 該当ミッションの進捗を更新
        for (const mission of relevantMissions) {
            await this.updateMissionProgress(mission.id);
        }
    }

    /**
     * ミッション状況を取得
     */
    getMissionStats() {
        const total = this.missions.length;
        const completed = this.missions.filter(m => m.is_completed).length;
        const inProgress = this.missions.filter(m => m.progress > 0 && !m.is_completed).length;
        
        return {
            total,
            completed,
            inProgress,
            remaining: total - completed,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }
}

// グローバルに公開
window.MissionManager = MissionManager;

console.log('✅ [SCRIPT-LOAD] missionManager.js読み込み完了、MissionManagerクラス公開');
console.log('🔍 [SCRIPT-LOAD] window.MissionManager:', typeof window.MissionManager);