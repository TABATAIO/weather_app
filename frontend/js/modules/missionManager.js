/**
 * ミッション管理クラス
 */
class MissionManager {
    constructor() {
        this.missions = [];
        this.completedMissions = [];
        this.init();
    }

    init() {
        this.setupElements();
        this.loadMissions();
        this.loadCompletedMissions();
        this.renderMissions();
    }

    setupElements() {
        this.missionContainer = document.getElementById('mission-container');
        this.missionList = document.getElementById('mission-list');
    }

    /**
     * ミッションをロード（デフォルトまたはAPI）
     */
    loadMissions() {
        // デフォルトミッション
        const defaultMissions = [
            {
                id: 1,
                title: '天気予報を見よう',
                description: 'マスコットと一緒に今日の天気をチェックしましょう',
                type: 'daily',
                completed: false,
                progress: 0,
                maxProgress: 1,
                rewards: {
                    experience: 10,
                    items: []
                }
            },
            {
                id: 2,
                title: 'マスコットとお話ししよう',
                description: 'マスコットに3回話しかけてみましょう',
                type: 'daily',
                completed: false,
                progress: 0,
                maxProgress: 3,
                rewards: {
                    experience: 15,
                    items: ['好物のお菓子']
                }
            },
            {
                id: 3,
                title: 'ご飯をあげよう',
                description: 'マスコットにご飯をあげて満腹度を上げましょう',
                type: 'daily',
                completed: false,
                progress: 0,
                maxProgress: 1,
                rewards: {
                    experience: 5,
                    items: []
                }
            }
        ];

        //発表ようにリロードで達成率をリセット可に　本番では下のコメントアウトを有効化し、こっちをコメントアウト
        this.missions = defaultMissions;

        // // 保存されたミッションがあれば使用、なければデフォルト
        // const savedMissions = Storage.get('missions');
        // if (savedMissions) {
        //     this.missions = savedMissions;
        // } else {
        //     this.missions = defaultMissions;
        //     this.saveMissions();
        // }
    }

    /**
     * 完了済みミッションをロード
     */
    loadCompletedMissions() {
        this.completedMissions = Storage.get('completedMissions') || [];
    }

    /**
     * ミッション一覧を画面に表示
     */
    renderMissions() {
        if (!this.missionList) return;

        this.missionList.innerHTML = '';

        this.missions.forEach(mission => {
            const missionElement = this.createMissionElement(mission);
            this.missionList.appendChild(missionElement);
        });
    }

    /**
     * ミッション要素を作成
     * @param {Object} mission - ミッション情報
     * @returns {HTMLElement} - ミッション要素
     */
    createMissionElement(mission) {
        const element = document.createElement('div');
        element.className = `mission-item ${mission.completed ? 'completed' : ''}`;
        element.dataset.missionId = mission.id;

        const progressPercent = Math.round((mission.progress / mission.maxProgress) * 100);
        
        element.innerHTML = `
            <div class="mission-header">
                <h4 class="mission-title">${mission.title}</h4>
                <div class="mission-status">
                    ${mission.completed ? '✅' : '🔄'}
                </div>
            </div>
            <p class="mission-description">${mission.description}</p>
            <div class="mission-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <span class="progress-text">${mission.progress}/${mission.maxProgress}</span>
            </div>
            <div class="mission-rewards">
                <span class="experience-reward">経験値: +${mission.rewards.experience}</span>
                ${mission.rewards.items.length > 0 ? 
                    `<span class="item-reward">報酬: ${mission.rewards.items.join(', ')}</span>` : ''
                }
            </div>
            ${!mission.completed ? 
                `<button class="complete-mission-btn" onclick="missionManager.checkMissionCompletion(${mission.id})">確認</button>` : 
                '<div class="completed-badge">完了</div>'
            }
        `;

        return element;
    }

    /**
     * ミッション進行を更新
     * @param {number} missionId - ミッションID
     * @param {number} progress - 進行度（省略時は1増加）
     */
    updateMissionProgress(missionId, progress = null) {
        const mission = this.missions.find(m => m.id === missionId);
        if (!mission || mission.completed) return;

        if (progress !== null) {
            mission.progress = Math.min(progress, mission.maxProgress);
        } else {
            mission.progress = Math.min(mission.progress + 1, mission.maxProgress);
        }

        // 完了チェック
        if (mission.progress >= mission.maxProgress) {
            this.completeMission(missionId);
        }

        this.saveMissions();
        this.renderMissions();
    }

    /**
     * ミッションを完了
     * @param {number} missionId - ミッションID
     */
    completeMission(missionId) {
        const mission = this.missions.find(m => m.id === missionId);
        if (!mission || mission.completed) return;

        mission.completed = true;
        mission.completedAt = new Date().toISOString();

        // 報酬を付与
        this.giveRewards(mission.rewards);

        // 完了済みリストに追加
        this.completedMissions.push({
            ...mission,
            completedDate: new Date().toISOString()
        });

        // 完了通知を表示
        this.showCompletionNotification(mission);

        this.saveMissions();
        this.saveCompletedMissions();
        this.renderMissions();
    }

    /**
     * 報酬を付与
     * @param {Object} rewards - 報酬情報
     */
    giveRewards(rewards) {
        // 経験値を付与
        if (rewards.experience > 0 && window.mascotDisplay) {
            // TODO: マスコットの経験値システム実装
            console.log(`経験値 +${rewards.experience} を獲得!`);
        }

        // アイテムを付与
        if (rewards.items && rewards.items.length > 0) {
            // TODO: アイテム管理システム実装
            console.log(`アイテム獲得: ${rewards.items.join(', ')}`);
        }
    }

    /**
     * 完了通知を表示
     * @param {Object} mission - 完了したミッション
     */
    showCompletionNotification(mission) {
        // 簡単な通知システム
        const notification = document.createElement('div');
        notification.className = 'mission-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h4>🎉 ミッション完了!</h4>
                <p>${mission.title}</p>
                <p>経験値 +${mission.rewards.experience}</p>
            </div>
        `;

        document.body.appendChild(notification);

        // 3秒後に削除
        setTimeout(() => {
            notification.remove();
        }, 3000);

        // マスコットの喜びアニメーション
        if (window.mascotDisplay) {
            mascotDisplay.playHappyAnimation();
        }
    }

    /**
     * ミッション完了チェック
     * @param {number} missionId - ミッションID
     */
    checkMissionCompletion(missionId) {
        const mission = this.missions.find(m => m.id === missionId);
        if (!mission) return;

        // ミッションタイプに応じた完了条件をチェック
        switch (missionId) {
            case 1: // 天気予報を見よう
                this.checkWeatherMission();
                break;
            case 2: // マスコットとお話ししよう
                this.checkChatMission();
                break;
            case 3: // ご飯をあげよう
                this.checkFeedingMission();
                break;
        }
    }

    /**
     * 天気ミッションをチェック
     */
    checkWeatherMission() {
        // 天気データが取得されているかチェック
        // TODO: 実際の天気データ確認ロジック
        this.updateMissionProgress(1);
    }

    /**
     * チャットミッションをチェック
     */
    checkChatMission() {
        // チャット履歴から会話回数を確認
        if (window.chatInterface) {
            const chatCount = chatInterface.conversationHistory.filter(msg => msg.role === 'user').length;
            this.updateMissionProgress(2, chatCount);
        }
    }

    /**
     * 餌やりミッションをチェック
     */
    checkFeedingMission() {
        // 満腹度が一定以上かチェック
        // TODO: 実際の餌やりロジック
        this.updateMissionProgress(3);
    }

    /**
     * イベント駆動でのミッション進行
     * @param {string} eventType - イベントタイプ
     * @param {Object} eventData - イベントデータ
     */
    onGameEvent(eventType, eventData = {}) {
        switch (eventType) {
            case 'chat':
                this.updateMissionProgress(2);
                break;
            case 'weather_check':
                this.updateMissionProgress(1);
                break;
            case 'feeding':
                this.updateMissionProgress(3);
                break;
        }
    }

    /**
     * ミッションをリセット（日次更新用）
     */
    resetDailyMissions() {
        const today = new Date().toDateString();
        const lastReset = Storage.get('lastMissionReset');

        if (lastReset !== today) {
            // 日次ミッションをリセット
            this.missions.forEach(mission => {
                if (mission.type === 'daily') {
                    mission.completed = false;
                    mission.progress = 0;
                }
            });

            Storage.set('lastMissionReset', today);
            this.saveMissions();
            this.renderMissions();
        }
    }

    /**
     * ミッションを保存
     */
    saveMissions() {
        Storage.set('missions', this.missions);
    }

    /**
     * 完了済みミッションを保存
     */
    saveCompletedMissions() {
        Storage.set('completedMissions', this.completedMissions);
    }
}

// グローバルインスタンス
const missionManager = new MissionManager();