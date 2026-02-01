<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserMascot extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'species',
        'health',
        'happiness',
        'energy',
        'total_experience',
        'last_fed_at',
        'last_played_at',
        'last_petted_at',
    ];

    protected $casts = [
        'last_fed_at' => 'datetime',
        'last_played_at' => 'datetime',
        'last_petted_at' => 'datetime',
    ];

    /**
     * レベルを計算
     */
    public function calculateLevel()
    {
        return intval($this->total_experience / 100) + 1;
    }

    /**
     * 経験値を追加
     */
    public function addExperience($amount, $source)
    {
        $this->total_experience += $amount;
        
        // 経験値ログを作成
        ExperienceLog::create([
            'user_mascot_id' => $this->id,
            'experience_gained' => $amount,
            'source' => $source,
            'earned_at' => now(),
        ]);
        
        $this->save();
    }

    /**
     * 体力を更新
     */
    public function updateHealth($newHealth)
    {
        $this->health = max(0, min(100, $newHealth));
        $this->save();
    }

    /**
     * 幸福度を更新
     */
    public function updateHappiness($newHappiness)
    {
        $this->happiness = max(0, min(100, $newHappiness));
        $this->save();
    }

    /**
     * エネルギーを更新
     */
    public function updateEnergy($newEnergy)
    {
        $this->energy = max(0, min(100, $newEnergy));
        $this->save();
    }

    /**
     * ユーザーとのリレーション
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 経験値ログとのリレーション
     */
    public function experienceLogs()
    {
        return $this->hasMany(ExperienceLog::class);
    }

    /**
     * 感情データとのリレーション
     */
    public function emotionData()
    {
        return $this->hasMany(EmotionData::class);
    }
}