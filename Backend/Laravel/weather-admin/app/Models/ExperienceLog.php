<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExperienceLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_mascot_id',
        'experience_gained',
        'source',
        'earned_at',
    ];

    protected $casts = [
        'earned_at' => 'datetime',
    ];

    /**
     * マスコットとのリレーション
     */
    public function userMascot()
    {
        return $this->belongsTo(UserMascot::class);
    }
}