/**
 * マスコット表示・アニメーション管理クラス
 */
class MascotDisplay {
    constructor() {
        this.mascotElement = null;
        this.currentEmotion = 'normal';
        this.isAnimating = false;
        this.mascotData = null;
        this.lastUpdateTime = 0;
        this.init();
    }

    init() {
        this.mascotElement = document.getElementById('mascot');
        if (!this.mascotElement) {
            console.warn('マスコット要素が見つかりません');
            return;
        }

        // 早期に名前を確認・設定
        this.initializeMascotName();
        
        this.setupMascotInteraction();
        this.loadMascotStatus();
        
        // 定期的にステータスを更新
        setInterval(() => this.loadMascotStatus(), 30000); // 30秒ごと
    }

    /**
     * マスコット名前の初期化（最優先処理）
     */
    async initializeMascotName() {
        try {
            console.log('🔍 マスコット名前を確認中...');
            
            // まずサーバーから最新の名前を取得（優先）
            try {
                console.log('🌐 サーバーから最新名前を取得中...');
                const response = await apiClient.getMascotStatus();
                if (response.success && response.data && response.data.name) {
                    console.log('✅ サーバーから名前を取得:', response.data.name);
                    // サーバーの名前をローカルストレージにも保存して同期
                    Storage.set('mascot-name', response.data.name);
                    this.updateMascotName(response.data.name);
                    return;
                }
            } catch (serverError) {
                console.warn('⚠️ サーバーからの名前取得失敗:', serverError.message);
            }
            
            // サーバーから取得できない場合のみローカルストレージを使用
            const savedName = Storage.get('mascot-name');
            if (savedName) {
                console.log('💾 保存された名前を使用:', savedName);
                this.updateMascotName(savedName);
            } else {
                // デフォルト名前を設定
                console.log('🏷️ デフォルト名前を設定: からめる');
                this.updateMascotName('からめる');
            }
            
        } catch (error) {
            console.warn('⚠️ 名前取得エラー、デフォルト名前を使用:', error);
            this.updateMascotName('からめる');
        }
    }

    /**
     * マスコット名前を更新
     */
    updateMascotName(name) {
        const nameElement = document.getElementById('mascot-name-comment');
        if (nameElement) {
            nameElement.textContent = name;
            console.log('✅ マスコット名前を更新:', name);
        }
    }

    /**
     * マスコットのクリックインタラクションを設定
     */
    setupMascotInteraction() {
        if (!this.mascotElement) return;

        this.mascotElement.addEventListener('click', () => {
            this.playTapAnimation();
            // タップでなでる機能を実行
            this.handlePetAction();
        });
    }

    /**
     * マスコットステータスをサーバーから読み込み
     */
    async loadMascotStatus() {
        try {
            if (typeof apiClient === 'undefined') {
                console.warn('APIクライアントが読み込まれていません');
                return;
            }

            const response = await apiClient.getMascotStatus();
            
            if (response.success) {
                this.mascotData = response.data;
                this.updateMascotDisplay();
            } else {
                console.error('マスコットステータス取得失敗:', response.error);
            }
        } catch (error) {
            console.error('マスコットステータス読み込みエラー:', error);
        }
    }

    /**
     * マスコット表示を更新
     */
    updateMascotDisplay() {
        if (!this.mascotData) return;

        const { name, level, health, happiness, energy, total_experience } = this.mascotData;
        
        console.log('🔄 マスコット表示更新:', { name, level, health, happiness, energy, total_experience });
        
        // 名前は初期化時に設定済みなのでスキップ
        
        // レベルを更新
        this.updateLevel(level, total_experience);
        
        // 経験値バーを更新
        this.updateExperienceBar(total_experience);
        
        // ヘルスを更新
        this.updateHealth(health);
        
        // 満腹度（エネルギー）を更新
        this.updateFullness(energy);
        
        // 幸福度に基づく感情設定
        if (happiness >= 80) {
            this.setEmotion('happy');
            this.updateMood('とても元気！');
        } else if (happiness >= 60) {
            this.setEmotion('normal');
            this.updateMood('元気');
        } else if (happiness >= 40) {
            this.setEmotion('sad');
            this.updateMood('少し疲れ気味');
        } else {
            this.setEmotion('sleepy');
            this.updateMood('お疲れ様');
        }

        console.log('マスコット表示更新:', this.mascotData);
    }

    /**
     * なでる動作の処理
     */
    async handlePetAction() {
        try {
            if (typeof apiClient === 'undefined') {
                console.warn('APIクライアントが読み込まれていません');
                return;
            }

            const response = await apiClient.petMascot();
            
            if (response.success) {
                console.log('なでる成功:', response.message);
                this.playHappyAnimation();
                
                // 即座に経験値バーを更新
                if (response.data && response.data.current_experience !== undefined) {
                    this.updateExperienceBar(response.data.current_experience);
                    this.updateLevel(response.data.level, response.data.current_experience);
                }
                
                // ステータスを再読み込み
                setTimeout(() => this.loadMascotStatus(), 1000);
                
                // フィードバック表示
                this.showActionFeedback(`+${response.data.exp_gained}EXP! ${response.message}`);
            } else {
                console.error('なでる失敗:', response.error);
            }
        } catch (error) {
            console.error('なでる動作エラー:', error);
        }
    }

    /**
     * 給餌動作の処理
     */
    async handleFeedAction() {
        try {
            if (typeof apiClient === 'undefined') {
                console.warn('APIクライアントが読み込まれていません');
                return;
            }

            const response = await apiClient.feedMascot();
            
            if (response.success) {
                console.log('給餌成功:', response.message);
                this.playHappyAnimation();
                
                // 即座に経験値バーを更新
                if (response.data && response.data.current_experience !== undefined) {
                    this.updateExperienceBar(response.data.current_experience);
                    this.updateLevel(response.data.level, response.data.current_experience);
                }
                
                // ステータスを再読み込み
                setTimeout(() => this.loadMascotStatus(), 1000);
                
                // フィードバック表示
                this.showActionFeedback(`+${response.data.exp_gained}EXP! ${response.message}`);
            } else {
                console.error('給餌失敗:', response.error);
            }
        } catch (error) {
            console.error('給餌動作エラー:', error);
        }
    }

    /**
     * 遊ぶ動作の処理
     */
    async handlePlayAction() {
        try {
            if (typeof apiClient === 'undefined') {
                console.warn('APIクライアントが読み込まれていません');
                return;
            }

            const response = await apiClient.playWithMascot();
            
            if (response.success) {
                console.log('遊ぶ成功:', response.message);
                this.playHappyAnimation();
                
                // 即座に経験値バーを更新
                if (response.data && response.data.current_experience !== undefined) {
                    this.updateExperienceBar(response.data.current_experience);
                    this.updateLevel(response.data.level, response.data.current_experience);
                }
                
                // ステータスを再読み込み
                setTimeout(() => this.loadMascotStatus(), 1000);
                
                // フィードバック表示
                this.showActionFeedback(`+${response.data.exp_gained}EXP! ${response.message}`);
            } else {
                console.error('遊ぶ失敗:', response.error);
            }
        } catch (error) {
            console.error('遊ぶ動作エラー:', error);
        }
    }

    /**
     * アクションフィードバックを表示
     * @param {string} message - 表示メッセージ
     */
    showActionFeedback(message) {
        // 既存のフィードバック要素があれば削除
        const existingFeedback = document.getElementById('action-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }

        // フィードバック要素を作成
        const feedback = document.createElement('div');
        feedback.id = 'action-feedback';
        feedback.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 123, 255, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-size: 16px;
            font-weight: bold;
            z-index: 1000;
            animation: feedbackFade 2s ease-in-out forwards;
        `;
        feedback.textContent = message;

        // CSS animation を追加
        const style = document.createElement('style');
        style.textContent = `
            @keyframes feedbackFade {
                0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                20% { opacity: 1; transform: translateX(-50%) translateY(0); }
                80% { opacity: 1; transform: translateX(-50%) translateY(0); }
                100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            }
        `;
        if (!document.head.querySelector('style[data-feedback]')) {
            style.setAttribute('data-feedback', '');
            document.head.appendChild(style);
        }

        document.body.appendChild(feedback);

        // 2秒後に削除
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 2000);
    }

    /**
     * マスコットの感情を設定
     * @param {string} emotion - 感情（normal, happy, sad, excited, sleepy）
     */
    setEmotion(emotion) {
        if (!this.mascotElement) return;

        this.currentEmotion = emotion;
        
        // 既存の感情クラスを削除
        this.mascotElement.classList.remove('normal', 'happy', 'sad', 'excited', 'sleepy');
        
        // 新しい感情クラスを追加
        this.mascotElement.classList.add(emotion);
    }

    /**
     * マスコットレベルを更新
     * @param {number} level - マスコットのレベル
     * @param {number} totalExperience - 総経験値（オプション）
     */
    updateLevel(level, totalExperience = null) {
        const levelElement = document.getElementById('mascot-level');
        if (levelElement) {
            levelElement.textContent = `Lv.${level}`;
        }

        // レベルに応じたサイズ変更（オプション）
        if (this.mascotElement) {
            const scale = Math.min(1 + (level - 1) * 0.05, 1.5); // 最大1.5倍
            this.mascotElement.style.transform = `scale(${scale})`;
        }

        // 経験値バーも更新（経験値が提供された場合）
        if (totalExperience !== null) {
            this.updateExperienceBar(totalExperience);
        }
    }

    /**
     * 経験値バーを更新
     * @param {number} totalExperience - 総経験値
     */
    updateExperienceBar(totalExperience) {
        const levelFill = document.getElementById('level-fill');
        if (!levelFill) return;

        // 現在のレベルと次のレベルまでの経験値を計算
        const currentLevel = Math.floor(totalExperience / 100) + 1;
        const expInCurrentLevel = totalExperience % 100;
        const expForNextLevel = 100;
        
        // バーの幅を計算（0-100%）
        const progressPercentage = (expInCurrentLevel / expForNextLevel) * 100;
        
        // アニメーション付きで更新
        levelFill.style.width = `${progressPercentage}%`;
        
        console.log(`経験値バー更新: ${totalExperience}EXP → Lv.${currentLevel} (${expInCurrentLevel}/${expForNextLevel}) → ${progressPercentage.toFixed(1)}%`);
    }

    /**
     * 体力ゲージを更新
     * @param {number} health - 現在の体力（0-100）
     */
    updateHealth(health) {
        const healthBar = document.getElementById('health-bar');
        const healthFill = document.getElementById('health-fill');
        
        if (healthFill) {
            healthFill.style.width = Math.max(0, Math.min(100, health)) + '%';
            
            // 体力に応じて色を変更
            if (health < 25) {
                healthFill.className = 'health-fill low';
            } else if (health < 50) {
                healthFill.className = 'health-fill medium';
            } else {
                healthFill.className = 'health-fill high';
            }
        }
    }

    /**
     * 満腹度を更新
     * @param {number} fullness - 満腹度（0-100）
     */
    updateFullness(fullness) {
        const stars = document.querySelectorAll('.fullness-star');
        const filledStars = Math.ceil((fullness / 100) * stars.length);

        stars.forEach((star, index) => {
            if (index < filledStars) {
                star.classList.add('filled');
                star.textContent = '⭐';
            } else {
                star.classList.remove('filled');
                star.textContent = '☆';
            }
        });
    }

    /**
     * 気分を更新
     * @param {string} mood - 気分のテキスト
     */
    updateMood(mood) {
        const moodElement = document.getElementById('mascot-mood');
        if (moodElement) {
            moodElement.textContent = mood;
        }
    }

    /**
     * タップアニメーションを再生
     */
    playTapAnimation() {
        if (!this.mascotElement || this.isAnimating) return;

        this.isAnimating = true;
        
        // ジャンプアニメーション
        this.mascotElement.classList.add('tap-animation');
        
        // 効果音の再生（オプション）
        this.playSound('tap');

        setTimeout(() => {
            this.mascotElement.classList.remove('tap-animation');
            this.isAnimating = false;
        }, 500);
    }

    /**
     * 喜びアニメーションを再生
     */
    playHappyAnimation() {
        if (!this.mascotElement || this.isAnimating) return;

        this.isAnimating = true;
        this.setEmotion('happy');
        
        this.mascotElement.classList.add('happy-animation');
        this.playSound('happy');

        setTimeout(() => {
            this.mascotElement.classList.remove('happy-animation');
            this.setEmotion('normal');
            this.isAnimating = false;
        }, 1000);
    }

    /**
     * 疲労アニメーションを再生
     */
    playTiredAnimation() {
        if (!this.mascotElement || this.isAnimating) return;

        this.isAnimating = true;
        this.setEmotion('sleepy');
        
        this.mascotElement.classList.add('tired-animation');

        setTimeout(() => {
            this.mascotElement.classList.remove('tired-animation');
            this.setEmotion('normal');
            this.isAnimating = false;
        }, 2000);
    }

    /**
     * サウンド再生（将来の実装用）
     * @param {string} soundType - サウンドタイプ
     */
    playSound(soundType) {
        // TODO: サウンドファイルの実装
        console.log(`Playing sound: ${soundType}`);
    }

    /**
     * ハートエフェクトを表示
     * @param {string} heartType - ハートの種類（❤️、💚、💙など）
     */
    showHeartEffect(heartType = '❤️') {
        const heartContainer = document.getElementById('heartEffects');
        if (!heartContainer) return;

        // ランダムな位置でハートを生成
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.className = 'heart';
                heart.textContent = heartType;
                
                // ランダムな開始位置
                const startX = 20 + Math.random() * 60; // 20-80%
                const startY = 30 + Math.random() * 40; // 30-70%
                
                heart.style.left = `${startX}%`;
                heart.style.top = `${startY}%`;
                
                heartContainer.appendChild(heart);
                
                // アニメーション終了後に削除
                setTimeout(() => {
                    if (heart.parentNode) {
                        heart.parentNode.removeChild(heart);
                    }
                }, 2000);
            }, i * 200); // 200msずつずらして表示
        }
    }

    /**
     * 餌やりハンドラー
     * @param {string} foodType - 餌の種類
     * @param {string} effectHeart - ハートエフェクトの種類
     * @param {number} fullnessValue - 満腹度の増加値
     */
    async handleFeedAction(foodType = 'riceball', effectHeart = '❤️', fullnessValue = 20) {
        try {
            console.log(`🍙 餌やり実行: ${foodType}`);
            
            // ハートエフェクトを表示
            this.showHeartEffect(effectHeart);
            
            // マスコットアニメーション
            this.setEmotion('happy');
            this.playMoveAnimation();
            
            // API呼び出し（餌やり）
            if (typeof apiClient !== 'undefined') {
                const response = await apiClient.feedMascot(foodType, fullnessValue);
                if (response.success) {
                    console.log('✅ 餌やり成功:', response.data);
                    
                    // ステータス更新
                    if (response.data.fullness !== undefined) {
                        this.updateFullness(response.data.fullness);
                    }
                    if (response.data.mood !== undefined) {
                        this.updateMood(response.data.mood);
                    }
                } else {
                    console.warn('⚠️ 餌やり失敗:', response.error);
                }
            }
            
            // ミッション進捗記録
            if (window.missionManager) {
                await window.missionManager.recordAction('feed_mascot');
            }
            
            // しばらくして通常の表情に戻す
            setTimeout(() => {
                this.setEmotion('normal');
            }, 3000);
            
        } catch (error) {
            console.error('❌ 餌やりエラー:', error);
        }
    }

    /**
     * 撫でるハンドラー
     */
    async handlePetAction() {
        try {
            console.log('✋ 撫でる実行');
            
            // ハートエフェクトを表示
            this.showHeartEffect('💖');
            
            // マスコットアニメーション
            this.setEmotion('happy');
            this.playTouchAnimation();
            
            // API呼び出し（撫でる）
            if (typeof apiClient !== 'undefined') {
                const response = await apiClient.petMascot();
                if (response.success) {
                    console.log('✅ 撫でる成功:', response.data);
                    
                    // ステータス更新
                    if (response.data.mood !== undefined) {
                        this.updateMood(response.data.mood);
                    }
                } else {
                    console.warn('⚠️ 撫でる失敗:', response.error);
                }
            }
            
            // ミッション進捗記録
            if (window.missionManager) {
                await window.missionManager.recordAction('pet_mascot');
            }
            
            // しばらくして通常の表情に戻す
            setTimeout(() => {
                this.setEmotion('normal');
            }, 3000);
            
        } catch (error) {
            console.error('❌ 撫でるエラー:', error);
        }
    }

    /**
     * マスコットの状態を一括更新
     * @param {Object} status - ステータス情報
     */
    updateStatus(status) {
        if (status.level !== undefined) {
            this.updateLevel(status.level);
        }
        if (status.health !== undefined) {
            this.updateHealth(status.health);
        }
        if (status.fullness !== undefined) {
            this.updateFullness(status.fullness);
        }
        if (status.mood !== undefined) {
            this.updateMood(status.mood);
        }
        if (status.emotion !== undefined) {
            this.setEmotion(status.emotion);
        }
    }

    /**
     * タッチアニメーションを再生
     */
    playTouchAnimation() {
        try {
            console.log('🎬 タッチアニメーション開始');
            
            const mascotElement = document.getElementById('mascot');
            if (mascotElement) {
                // マスコット画像を小さく拡大して元に戻すアニメーション
                mascotElement.style.transition = 'transform 0.15s ease-in-out';
                mascotElement.style.transform = 'scale(1.05)'; // 1.1から1.05に小さく
                
                setTimeout(() => {
                    mascotElement.style.transform = 'scale(1)';
                    
                    setTimeout(() => {
                        mascotElement.style.transition = '';
                    }, 150);
                }, 150);
            }
            
            // ハートエフェクト追加
            this.createFloatingHeart();
            
            console.log('✅ タッチアニメーション完了');
        } catch (error) {
            console.error('❌ タッチアニメーションエラー:', error);
        }
    }

    /**
     * 移動アニメーションを再生（餌やり時）
     */
    playMoveAnimation() {
        try {
            console.log('🎬 移動アニメーション開始');
            
            const mascotElement = document.getElementById('mascot');
            if (mascotElement) {
                // マスコット画像を左右に軽く揺らすアニメーション
                mascotElement.style.transition = 'transform 0.3s ease-in-out';
                
                // 左に揺れる
                mascotElement.style.transform = 'translateX(-5px) rotate(-2deg)';
                
                setTimeout(() => {
                    // 右に揺れる
                    mascotElement.style.transform = 'translateX(5px) rotate(2deg)';
                    
                    setTimeout(() => {
                        // 中央に戻る
                        mascotElement.style.transform = 'translateX(0) rotate(0deg)';
                        
                        setTimeout(() => {
                            mascotElement.style.transition = '';
                        }, 300);
                    }, 300);
                }, 300);
            }
            
            // 食べ物エフェクト追加
            this.createFoodEffect();
            
            console.log('✅ 移動アニメーション完了');
        } catch (error) {
            console.error('❌ 移動アニメーションエラー:', error);
        }
    }

    /**
     * フローティングハートエフェクトを作成
     */
    createFloatingHeart() {
        try {
            const mascotContainer = document.querySelector('.mascot-display') || document.body;
            
            // ハートエレメントを作成
            const heart = document.createElement('div');
            heart.innerHTML = '💕';
            heart.style.position = 'absolute';
            heart.style.fontSize = '24px';
            heart.style.zIndex = '9999';
            heart.style.pointerEvents = 'none';
            heart.style.userSelect = 'none';
            
            // ランダムな初期位置
            const rect = mascotContainer.getBoundingClientRect();
            heart.style.left = (rect.width * 0.5 + Math.random() * 50 - 25) + 'px';
            heart.style.top = (rect.height * 0.3 + Math.random() * 30 - 15) + 'px';
            
            // アニメーションスタイル
            heart.style.animation = 'floatUp 2s ease-out forwards';
            
            // CSSアニメーションが存在しない場合は作成
            this.ensureFloatUpAnimation();
            
            mascotContainer.appendChild(heart);
            
            // 2秒後にハートを削除
            setTimeout(() => {
                if (heart && heart.parentNode) {
                    heart.parentNode.removeChild(heart);
                }
            }, 2000);
            
        } catch (error) {
            console.error('❌ ハートエフェクトエラー:', error);
        }
    }

    /**
     * 食べ物エフェクトを作成
     */
    createFoodEffect() {
        try {
            const mascotContainer = document.querySelector('.mascot-display') || document.body;
            
            // 食べ物エレメントを作成（複数パターン）
            const foodEmojis = ['🍙', '🥟', '🍰', '🍪', '🧀'];
            const foodEmoji = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
            
            const food = document.createElement('div');
            food.innerHTML = foodEmoji;
            food.style.position = 'absolute';
            food.style.fontSize = '20px';
            food.style.zIndex = '9999';
            food.style.pointerEvents = 'none';
            food.style.userSelect = 'none';
            
            // ランダムな初期位置（マスコットの近く）
            const rect = mascotContainer.getBoundingClientRect();
            food.style.left = (rect.width * 0.4 + Math.random() * rect.width * 0.2) + 'px';
            food.style.top = (rect.height * 0.6 + Math.random() * 20 - 10) + 'px';
            
            // アニメーションスタイル（斜めに飛んでいく）
            food.style.animation = 'foodFly 1.5s ease-out forwards';
            
            // CSSアニメーションが存在しない場合は作成
            this.ensureFoodFlyAnimation();
            
            mascotContainer.appendChild(food);
            
            // 1.5秒後に食べ物を削除
            setTimeout(() => {
                if (food && food.parentNode) {
                    food.parentNode.removeChild(food);
                }
            }, 1500);
            
        } catch (error) {
            console.error('❌ 食べ物エフェクトエラー:', error);
        }
    }

    /**
     * floatUpアニメーションのCSSを確保
     */
    ensureFloatUpAnimation() {
        // アニメーションが既に存在するかチェック
        const existingStyle = document.getElementById('mascot-animations');
        if (existingStyle) return;
        
        // CSSアニメーションを追加
        const style = document.createElement('style');
        style.id = 'mascot-animations';
        style.textContent = `
            @keyframes floatUp {
                0% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                50% {
                    opacity: 0.8;
                    transform: translateY(-20px) scale(1.1);
                }
                100% {
                    opacity: 0;
                    transform: translateY(-50px) scale(0.8);
                }
            }
            @keyframes foodFly {
                0% {
                    opacity: 1;
                    transform: translate(0, 0) scale(1) rotate(0deg);
                }
                50% {
                    opacity: 0.8;
                    transform: translate(15px, -10px) scale(1.2) rotate(180deg);
                }
                100% {
                    opacity: 0;
                    transform: translate(30px, -5px) scale(0.5) rotate(360deg);
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * foodFlyアニメーションのCSSを確保
     */
    ensureFoodFlyAnimation() {
        // floatUpAnimationと同じスタイルシートを使用
        this.ensureFloatUpAnimation();
    }
}

// グローバルインスタンス
const mascotDisplay = new MascotDisplay();