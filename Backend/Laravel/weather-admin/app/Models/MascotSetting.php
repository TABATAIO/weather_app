<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Storage;

class MascotSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'initial_name',
        'character_species',
        'character_description',
        'second_form_name',
        'third_form_active_name',
        'third_form_calm_name',
        'evolution_level_1_to_2',
        'evolution_level_2_to_3',
        'max_level_second_form',
        'max_level_third_form',
        'personality_threshold',
        'image_size',
        'enable_animation',
        'enable_bounce',
        'color_filter',
        'first_form_image',
        'second_form_image',
        'third_form_active_image',
        'third_form_calm_image',
    ];

    protected $casts = [
        'enable_animation' => 'boolean',
        'enable_bounce' => 'boolean',
        'evolution_level_1_to_2' => 'integer',
        'evolution_level_2_to_3' => 'integer',
        'max_level_second_form' => 'integer',
        'max_level_third_form' => 'integer',
        'personality_threshold' => 'integer',
    ];

    // 現在のマスコットの状態を取得
    public static function getCurrentSetting()
    {
        return self::firstOrCreate(['id' => 1], [
            'initial_name' => 'ウェザーちゃん',
            'character_species' => 'cloud_spirit',
            'character_description' => '',
            'second_form_name' => '',
            'third_form_active_name' => '',
            'third_form_calm_name' => '',
            'evolution_level_1_to_2' => 11,
            'evolution_level_2_to_3' => 25,
            'max_level_second_form' => 24,
            'max_level_third_form' => 50,
            'personality_threshold' => 60,
            'image_size' => 'medium',
            'enable_animation' => true,
            'enable_bounce' => false,
            'color_filter' => 'none',
            'first_form_image' => null,
            'second_form_image' => null,
            'third_form_active_image' => null,
            'third_form_calm_image' => null,
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

    //第一形態の画像urlを取得
    public function getFirstFormImageUrlAttribute()
    {
        if ($this->first_form_image && Storage::disk('public')->exists($this->first_form_image)) {
            return Storage::disk('public')->url($this->first_form_image);
        }
        return asset('images/character01.png');
    }

    //第二形態の画像urlを取得
    public function getSecondFormImageUrlAttribute()
    {
        if ($this->second_form_image && Storage::disk('public')->exists($this->second_form_image)) {
            return Storage::disk('public')->url($this->second_form_image);
        }
        return asset('images/character02.png');
    }

    //第三形態（活発）の画像urlを取得
    public function getThirdFormActiveImageUrlAttribute()
    {
        if ($this->third_form_active_image && Storage::disk('public')->exists($this->third_form_active_image)) {
            return Storage::disk('public')->url($this->third_form_active_image);
        }
        return asset('images/character03_active.jpg');
    }

    //第三形態（穏やか）の画像urlを取得
    public function getThirdFormCalmImageUrlAttribute()
    {
        if ($this->third_form_calm_image && Storage::disk('public')->exists($this->third_form_calm_image)) {
            return Storage::disk('public')->url($this->third_form_calm_image);
        }
        return asset('images/character03_calm.jpg');
    }

    //性格による第三形態の判断
    public function getThirdFormTypeAttribute()
    {
        return 'active';
    }

    //現在の性格に基づく第三形態の名前を取得
    public function getCurrentThirdFormNameAttribute()
    {
        return $this->third_form_type === 'active' 
            ? $this->third_form_active_name
            : $this->third_form_calm_name;
    }

    //現在の性格に基づく画像URLを取得
    public function getCurrentThirdFormImageUrlAttribute()
    {
        return $this->third_form_type === 'active' 
            ? $this->third_form_active_image_url
            : $this->third_form_calm_image_url;
    }
}
