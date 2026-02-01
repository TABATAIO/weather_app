<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $missions = [
            [
                'name' => '今日の天気を見る',
                'description' => '今日の天気情報をチェックしよう',
                'mission_type' => 'weather_check',
                'target_action' => 'view_today_weather',
                'target_params' => null,
                'reward_exp' => 10,
                'icon' => '☀️',
            ],
            [
                'name' => 'キャラクターとの会話する',
                'description' => 'マスコットとチャットで会話してみよう',
                'mission_type' => 'interaction',
                'target_action' => 'chat_with_mascot',
                'target_params' => null,
                'reward_exp' => 15,
                'icon' => '💬',
            ],
            [
                'name' => 'キャラクターをタッチする',
                'description' => 'マスコットをタッチしてコミュニケーション',
                'mission_type' => 'interaction',
                'target_action' => 'touch_mascot',
                'target_params' => json_encode(['count' => 3]),
                'reward_exp' => 12,
                'icon' => '✋',
            ],
            [
                'name' => '降水確率をチェックする',
                'description' => '今日の降水確率を確認しよう',
                'mission_type' => 'weather_check',
                'target_action' => 'check_precipitation',
                'target_params' => null,
                'reward_exp' => 8,
                'icon' => '🌧️',
            ],
            [
                'name' => '雨雲レーダーを見る',
                'description' => '雨雲レーダーで気象情報をチェック',
                'mission_type' => 'external_link',
                'target_action' => 'view_rain_radar',
                'target_params' => json_encode(['url' => 'https://tenki.jp/radar/']),
                'reward_exp' => 10,
                'icon' => '🗾',
            ],
            [
                'name' => '週間天気を開く',
                'description' => '一週間の天気予報を確認してみよう',
                'mission_type' => 'external_link',
                'target_action' => 'view_weekly_weather',
                'target_params' => json_encode(['url' => 'https://tenki.jp/week/']),
                'reward_exp' => 12,
                'icon' => '📅',
            ],
            [
                'name' => '今日の気温を見る',
                'description' => '現在の気温をチェックしよう',
                'mission_type' => 'weather_check',
                'target_action' => 'view_temperature',
                'target_params' => null,
                'reward_exp' => 8,
                'icon' => '🌡️',
            ],
            [
                'name' => '天気ニュース一覧を開く',
                'description' => '最新の気象ニュースをチェック',
                'mission_type' => 'external_link',
                'target_action' => 'view_weather_news',
                'target_params' => json_encode(['url' => 'https://tenki.jp/forecaster/']),
                'reward_exp' => 15,
                'icon' => '📰',
            ],
            [
                'name' => 'キャラクターのセリフをタップ',
                'description' => 'マスコットの吹き出しをタップしてみよう',
                'mission_type' => 'interaction',
                'target_action' => 'tap_mascot_speech',
                'target_params' => null,
                'reward_exp' => 10,
                'icon' => '💭',
            ],
        ];

        foreach ($missions as $mission) {
            DB::table('missions')->insert($mission + [
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
