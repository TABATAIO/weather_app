/**
 * マスコット表示・アニメーション管理クラス
 */
class MascotDisplay {
    constructor() {
        this.mascotElement = null;
        this.currentEmotion = 'normal';
        this.isAnimating = false;
        this.init();
    }

    init() {
        this.mascotElement = document.getElementById('mascot');
        if (!this.mascotElement) {
            console.warn('マスコット要素が見つかりません');
            return;
        }

        this.setupMascotInteraction();
    }

    /**
     * マスコットのクリックインタラクションを設定
     */
    setupMascotInteraction() {
        if (!this.mascotElement) return;

        this.mascotElement.addEventListener('click', () => {
            this.playTapAnimation();
        });
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
     */
    updateLevel(level) {
        const levelElement = document.getElementById('mascot-level');
        if (levelElement) {
            levelElement.textContent = `Lv.${level}`;
        }

        // レベルに応じたサイズ変更（オプション）
        if (this.mascotElement) {
            const scale = Math.min(1 + (level - 1) * 0.05, 1.5); // 最大1.5倍
            this.mascotElement.style.transform = `scale(${scale})`;
        }
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
}

// グローバルインスタンス
const mascotDisplay = new MascotDisplay();