<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    protected $table = 'weather_users';
    protected $primaryKey = 'user_id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'user_name',
        'temperature_preference',
        'activity_preference', 
        'style_preference',
        'weather_sensitivity',
        'favorite_activities',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // チャット履歴との関係
    public function chatHistory()
    {
        return $this->hasMany(ChatHistory::class, 'user_id', 'user_id');
    }
}
