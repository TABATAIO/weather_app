<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MascotSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'initial_name',
        'character_species',
        'character_description',
        'second_form_name',
        'evolution_level_1_to_2',
        'max_level_second_form',
        'image_size',
        'enable_animation',
        'enable_bounce',
        'color_filter'
    ];

    protected $casts = [
        'enable_animation' => 'boolean',
        'enable_bounce' => 'boolean',
        'evolution_level_1_to_2' => 'integer',
        'max_level_second_form' => 'integer',
    ];

    // 現在のマスコットの状態を取得

    public static function getCurrentSetting()
    {
        return self::firstOrCreate(['id' => 1], [
            'initial_name' => 'ウェザーちゃん',
            'character_species' => 'cloud_spirit',
            'character_description' => '',
            'second_form_name' => '',
            'evolution_level_1_to_2' => 11,
            'max_level_second_form' => 25,
            'image_size' => 'medium',
            'enable_animation' => true,
            'enable_bounce' => false,
            'color_filter' => 'none'
        ]);
    }

    //キャラクターの種族の日本語名を取得
    public function getCharacterSpeciesNameAttribute()
    {
        $species = [
            'cloud_spirit' => '☁️ 雲の精霊',
            'weather_fairy' => '🧚‍♀️ 天気の妖精',
            'storm_guardian' => '⛈️ 嵐の守護者',
            'sky_dragon' => '🐉 空の竜'
        ];

        return $species[$this->character_species] ?? $this->character_species;
    }

    //画像サイズの取得
    public function getImageSizePixelsAttribute()  
    {
        $size = [
            'small' => '64×64px',
            'medium' => '128×128px',
            'large' => '256×256px',
        ];

        return $size[$this -> image_size] ?? '128×128px';
    }
}
