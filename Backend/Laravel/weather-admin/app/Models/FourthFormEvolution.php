<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FourthFormEvolution extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'image_path',
        'evolution_from',
        'evolution_condition_type',
        'evolution_condition_value',
        'description',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * 活発形態から進化する第四形態を取得
     */
    public static function getActiveEvolutions()
    {
        return self::where('evolution_from', 'active')
                   ->where('is_active', true)
                   ->orderBy('sort_order')
                   ->orderBy('name')
                   ->get();
    }

    /**
     * 穏やか形態から進化する第四形態を取得
     */
    public static function getCalmEvolutions()
    {
        return self::where('evolution_from', 'calm')
                   ->where('is_active', true)
                   ->orderBy('sort_order')
                   ->orderBy('name')
                   ->get();
    }

    /**
     * 進化条件の表示用テキストを取得
     */
    public function getConditionDisplayTextAttribute()
    {
        switch ($this->evolution_condition_type) {
            case 'level':
                return "レベル {$this->evolution_condition_value} で進化";
            case 'special_item':
                return "{$this->evolution_condition_value} を使用して進化";
            case 'weather_condition':
                return "{$this->evolution_condition_value} の天気で進化";
            case 'time_condition':
                return "{$this->evolution_condition_value} に進化";
            case 'friendship':
                return "親密度 {$this->evolution_condition_value} で進化";
            default:
                return '特別な条件で進化';
        }
    }

    /**
     * 進化元の表示用テキストを取得
     */
    public function getEvolutionFromDisplayTextAttribute()
    {
        return $this->evolution_from === 'active' ? '活発形態' : '穏やか形態';
    }
}
