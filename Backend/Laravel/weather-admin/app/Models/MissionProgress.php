<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MissionProgress extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_mascot_id',
        'mission_type',
        'progress_value',
        'target_value',
        'is_completed',
        'completed_at',
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    /**
     * マスコットとのリレーション
     */
    public function userMascot()
    {
        return $this->belongsTo(UserMascot::class);
    }
}