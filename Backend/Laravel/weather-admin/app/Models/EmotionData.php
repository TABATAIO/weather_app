<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmotionData extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_mascot_id',
        'emotion_source',
        'emotion_state',
        'intensity_level',
        'recorded_at',
    ];

    protected $casts = [
        'recorded_at' => 'datetime',
    ];

    /**
     * マスコットとのリレーション
     */
    public function userMascot()
    {
        return $this->belongsTo(UserMascot::class);
    }
}