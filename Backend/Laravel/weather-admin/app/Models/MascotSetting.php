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
        // 第四形態のフィールド
        'ultimate_form_name',
        'legendary_form_name',
        'evolution_level_1_to_2',
        'evolution_level_2_to_3',
        'evolution_level_3_to_4',
        'max_level_second_form',
        'max_level_third_form',
        'max_level_fourth_form',
        'personality_threshold',
        'ultimate_evolution_threshold',
        'requires_special_item',
        'special_item_name',
        'special_abilities',
        'weather_control_power',
        'image_size',
        'enable_animation',
        'enable_bounce',
        'color_filter',
        'first_form_image',
        'second_form_image',
        'third_form_active_image',
        'third_form_calm_image',
        'ultimate_form_image',
        'legendary_form_image',
    ];

    protected $casts = [
        'enable_animation' => 'boolean',
        'enable_bounce' => 'boolean',
        'requires_special_item' => 'boolean',
        'evolution_level_1_to_2' => 'integer',
        'evolution_level_2_to_3' => 'integer',
        'evolution_level_3_to_4' => 'integer',
        'max_level_second_form' => 'integer',
        'max_level_third_form' => 'integer',
        'max_level_fourth_form' => 'integer',
        'personality_threshold' => 'integer',
        'ultimate_evolution_threshold' => 'integer',
        'weather_control_power' => 'integer',
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
        $imagePath = $this->getAttribute('first_form_image');
        if ($imagePath && Storage::disk('public')->exists($imagePath)) {
            return asset('storage/' . $imagePath);
        }
        return asset('images/character01.png');
    }

    //第二形態の画像urlを取得
    public function getSecondFormImageUrlAttribute()
    {
        $imagePath = $this->getAttribute('second_form_image');
        if ($imagePath && Storage::disk('public')->exists($imagePath)) {
            return asset('storage/' . $imagePath);
        }
        return asset('images/character02.png');
    }

    //第三形態（活発）の画像urlを取得
    public function getThirdFormActiveImageUrlAttribute()
    {
        $imagePath = $this->getAttribute('third_form_active_image');
        if ($imagePath && Storage::disk('public')->exists($imagePath)) {
            return asset('storage/' . $imagePath);
        }
        return asset('images/character03_active.jpg');
    }

    //第三形態（穏やか）の画像urlを取得
    public function getThirdFormCalmImageUrlAttribute()
    {
        $imagePath = $this->getAttribute('third_form_calm_image');
        if ($imagePath && Storage::disk('public')->exists($imagePath)) {
            return asset('storage/' . $imagePath);
        }
        return asset('images/character03_calm.jpg');
    }

    /**
     * Determine the personality type for third form evolution.
     * Returns 'active' or 'calm' based on stored type, personality score, or default.
     *
     * @return string
     */
    public function getThirdFormTypeAttribute()
    {
        // まず、データベース上に third_form_type が明示的に保存されている場合はそれを優先
        $storedType = $this->attributes['third_form_type'] ?? null;
        if (in_array($storedType, ['active', 'calm'], true)) {
            return $storedType;
        }

        // 明示的な値がない場合は、性格スコアと閾値に基づいて判定（存在する場合）
        $score = $this->attributes['personality_score'] ?? null;
        $threshold = $this->personality_threshold ?? null;

        if (is_numeric($score) && is_numeric($threshold)) {
            return $score >= $threshold ? 'active' : 'calm';
        }

        // データがない場合のフォールバック（従来挙動を維持）
        return 'active';
    }

    /**
     * Get the current third form name based on personality type.
     *
     * @return string|null
     */
    public function getCurrentThirdFormNameAttribute()
    {
        return $this->third_form_type === 'active' 
            ? $this->third_form_active_name
            : $this->third_form_calm_name;
    }

    /**
     * Get the current third form image URL based on personality type.
     *
     * @return string
     */
    public function getCurrentThirdFormImageUrlAttribute()
    {
        return $this->third_form_type === 'active' 
            ? $this->third_form_active_image_url
            : $this->third_form_calm_image_url;
    }
}
