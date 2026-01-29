<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class WeatherUser extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'user_profiles';
    
    protected $fillable = [
        'user_name',
        'email',
        'password',
        'role',
        'is_active',
        'user_id',
        'temperature_preference',
        'activity_preference',
        'style_preference',
        'weather_sensitivity',
        'favorite_activities',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active' => 'boolean',
        'favorite_activities' => 'json',
    ];

    // user_nameフィールドをnameとしてアクセスできるようにする
    public function getNameAttribute()
    {
        return $this->user_name;
    }

    public function setNameAttribute($value)
    {
        $this->user_name = $value;
    }

    // 権限管理
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isManager()
    {
        return in_array($this->role, ['admin', 'manager']);
    }
}
