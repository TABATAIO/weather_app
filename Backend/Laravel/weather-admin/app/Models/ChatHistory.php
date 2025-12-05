<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatHistory extends Model
{
    protected $table = 'chat_history';
    
    protected $fillable = [
        'user_id',
        'user_message', 
        'bot_response',
        'intent',
        'sentiment',
        'weather_data',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    // ユーザープロファイルとの関係
    public function userProfile()
    {
        return $this->belongsTo(UserProfile::class, 'user_id', 'user_id');
    }
}
