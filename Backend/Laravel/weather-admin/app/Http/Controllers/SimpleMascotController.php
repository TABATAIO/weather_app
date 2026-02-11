<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\EmotionData;

class SimpleMascotController extends Controller
{
    public function getMascotName(Request $request)
    {
        try {
            // mascotsテーブルから実際の名前を取得
            $mascot = DB::table('mascots')->where('user_id', 1)->first();
            
            if (!$mascot) {
                // マスコットが存在しない場合、デフォルトデータを作成
                DB::table('mascots')->insert([
                    'user_id' => 1,
                    'name' => 'からめる',
                    'level' => 1,
                    'health' => 100,
                    'happiness' => 50,
                    'energy' => 80,
                    'experience' => 0,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                
                return response()->json([
                    'success' => true,
                    'data' => [
                        'name' => 'からめる',
                        'species' => 'cloud_spirit',
                    ]
                ]);
            }
            
            // 実際のマスコット情報を返す
            return response()->json([
                'success' => true,
                'data' => [
                    'name' => $mascot->name ?? 'からめる',
                    'species' => 'cloud_spirit',
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'マスコット名の取得に失敗しました',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    public function getBasicInfo(Request $request)
    {
        try {
            // データベースから実際のマスコット情報を取得
            $mascot = DB::table('mascots')->where('user_id', 1)->first();
            
            if (!$mascot) {
                // マスコットが存在しない場合、デフォルトデータを作成
                $defaultInfo = [
                    'name' => 'からめる',
                    'level' => 1,
                    'species' => 'cloud_spirit',
                    'health' => 80,
                    'happiness' => 60,
                    'energy' => 70,
                    'mood' => '元気いっぱい♪'
                ];
                
                DB::table('mascots')->insert([
                    'user_id' => 1,
                    'name' => $defaultInfo['name'],
                    'level' => 1,
                    'health' => $defaultInfo['health'],
                    'happiness' => $defaultInfo['happiness'],
                    'energy' => $defaultInfo['energy'],
                    'experience' => 0,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                
                return response()->json([
                    'success' => true,
                    'data' => $defaultInfo
                ]);
            }
            
            // 既存のマスコット情報を返す
            $mascotInfo = [
                'name' => $mascot->name ?? 'からめる',
                'level' => intval(($mascot->experience ?? 0) / 100) + 1,
                'species' => 'cloud_spirit',
                'health' => $mascot->health ?? 80,
                'happiness' => $mascot->happiness ?? 60,
                'energy' => $mascot->energy ?? 70,
                'mood' => '元気いっぱい♪'
            ];
            
            return response()->json([
                'success' => true,
                'data' => $mascotInfo
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'マスコット情報の取得に失敗しました',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * マスコットの詳細ステータスを取得
     */
    public function getMascotStatus(Request $request)
    {
        try {
            // デフォルトユーザー（ID: 1）のマスコットを取得または作成
            $mascot = DB::table('mascots')->where('user_id', 1)->first();
            
            if (!$mascot) {
                // マスコットが存在しない場合、デフォルトデータを作成
                DB::table('mascots')->insert([
                    'user_id' => 1,
                    'name' => 'からめる',
                    'level' => 1,
                    'health' => 100,
                    'happiness' => 50,
                    'energy' => 80,
                    'experience' => 0,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                $mascot = DB::table('mascots')->where('user_id', 1)->first();
            }

            $totalExp = $mascot->experience ?? 0;
            $level = intval($totalExp / 100) + 1;
            $currentLevelExp = $totalExp % 100; // 現在のレベル内での経験値
            $expToNextLevel = 100 - $currentLevelExp; // 次のレベルまでの経験値
            $expProgress = ($currentLevelExp / 100) * 100; // パーセンテージ

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $mascot->id,
                    'name' => $mascot->name ?? 'からめる',
                    'level' => $level,
                    'health' => $mascot->health ?? 100,
                    'happiness' => $mascot->happiness ?? 50,
                    'energy' => $mascot->energy ?? 80,
                    'total_experience' => $totalExp,
                    'current_level_exp' => $currentLevelExp,
                    'exp_to_next_level' => $expToNextLevel,
                    'exp_progress_percentage' => $expProgress,
                    'last_fed_at' => $mascot->last_fed_at ?? null,
                    'last_played_at' => $mascot->last_played_at ?? null,
                    'last_petted_at' => null, // mascotsテーブルにlast_petted_atカラムが存在しないのでnull
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'マスコットステータスの取得に失敗しました',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 時間帯に応じたマスコットの挨拶を取得
     */
    public function getGreeting(Request $request)
    {
        try {
            // マスコットデータを取得
            $mascot = DB::table('mascots')->where('user_id', 1)->first();
            $mascotName = $mascot ? $mascot->name : 'からめる';
            
            // 日本時間で現在時刻を取得
            $now = now()->setTimezone('Asia/Tokyo');
            $hour = $now->hour;
            
            // 時間帯を判定
            $timeOfDay = '';
            if ($hour >= 5 && $hour < 12) {
                $timeOfDay = 'morning';
            } elseif ($hour >= 12 && $hour < 17) {
                $timeOfDay = 'afternoon';
            } elseif ($hour >= 17 && $hour < 21) {
                $timeOfDay = 'evening';
            } else {
                $timeOfDay = 'night';
            }
            
            // 時間帯別の挨拶メッセージ
            $greetings = [
                'morning' => [
                    'おはようございます！素敵な一日になりますように✨',
                    'おはようございます！今日も頑張りましょう〜♪',
                    '朝だよ〜！元気いっぱいでいこうね！',
                    'おはよう！いい天気だといいな〜☀️'
                ],
                'afternoon' => [
                    'こんにちは！お昼ごはんは食べた？🍽️',
                    'やっほー！午後も頑張ろうね〜',
                    'こんにちは〜！いい感じに進んでる？',
                    'お昼だね〜リフレッシュしよう！'
                ],
                'evening' => [
                    'おつかれさま！今日も一日頑張ったね✨',
                    'こんばんは〜！夕方の風が気持ちいいね',
                    'お疲れさま！少しゆっくりしよう♪',
                    '夕方だね〜！リラックスタイムだよ〜'
                ],
                'night' => [
                    'こんばんは！今日も一日お疲れさま〜🌙',
                    '夜だね〜！星が見えるかな〜✨',
                    'おやすみ前に一緒におしゃべりしよ？',
                    '静かな夜だね〜ゆっくり過ごそう♪'
                ]
            ];
            
            // ランダムに挨拶を選択
            $messages = $greetings[$timeOfDay];
            $greeting = $messages[array_rand($messages)];
            
            return response()->json([
                'success' => true,
                'data' => [
                    'greeting' => $greeting,
                    'mascot_name' => $mascotName,
                    'time_of_day' => $timeOfDay,
                    'current_hour' => $hour,
                    'current_time' => $now->format('H:i'),
                    'timezone' => 'Asia/Tokyo'
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => '挨拶の取得に失敗しました',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * マスコットにエサをあげる
     */
    public function feedMascot(Request $request)
    {
        try {
            // 直接SQLでマスコットデータを取得
            $mascot = DB::table('mascots')->where('user_id', 1)->first();
            
            if (!$mascot) {
                // マスコットが存在しない場合、デフォルトデータを作成
                DB::table('mascots')->insert([
                    'user_id' => 1,
                    'name' => 'からめる',
                    'level' => 1,
                    'health' => 100,
                    'happiness' => 50,
                    'energy' => 80,
                    'experience' => 0,
                    'last_fed_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                $mascot = DB::table('mascots')->where('user_id', 1)->first();
            }

            // エサやりによる経験値とステータス変更
            $expGain = 15;
            $newHealth = min(100, $mascot->health + 20);
            $newEnergy = min(100, $mascot->energy + 10);
            $newExperience = ($mascot->experience ?? 0) + $expGain;

            // マスコットステータスを更新
            DB::table('mascots')
                ->where('id', $mascot->id)
                ->update([
                    'health' => $newHealth,
                    'energy' => $newEnergy,
                    'experience' => $newExperience,
                    'last_fed_at' => now(),
                    'updated_at' => now()
                ]);

            $level = intval($newExperience / 100) + 1;

            return response()->json([
                'success' => true,
                'message' => 'エサをあげました！',
                'data' => [
                    'exp_gained' => $expGain,
                    'health' => $newHealth,
                    'energy' => $newEnergy,
                    'current_experience' => $newExperience,
                    'level' => $level
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'エサやりに失敗しました',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * マスコットと遊ぶ
     */
    public function playWithMascot(Request $request)
    {
        try {
            $mascot = DB::table('mascots')->where('id', 1)->first();
            
            if (!$mascot) {
                return response()->json([
                    'success' => false,
                    'error' => 'マスコットが見つかりません'
                ], 404);
            }

            // 遊びによる経験値とステータス変更
            $expGain = 25;
            $newHappiness = min(100, $mascot->happiness + 30);
            $newEnergy = max(0, $mascot->energy - 15);
            $newExperience = ($mascot->experience ?? 0) + $expGain;

            // マスコットステータスを更新
            DB::table('mascots')
                ->where('id', $mascot->id)
                ->update([
                    'happiness' => $newHappiness,
                    'energy' => $newEnergy,
                    'experience' => $newExperience,
                    'last_played_at' => now(),
                    'updated_at' => now()
                ]);

            $level = intval($newExperience / 100) + 1;

            return response()->json([
                'success' => true,
                'message' => '一緒に遊びました！',
                'data' => [
                    'exp_gained' => $expGain,
                    'happiness' => $newHappiness,
                    'energy' => $newEnergy,
                    'experience' => $newExperience,
                    'level' => $level
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => '遊びに失敗しました',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * マスコットをなでる
     */
    public function petMascot(Request $request)
    {
        try {
            $mascot = DB::table('mascots')->where('id', 1)->first();
            
            if (!$mascot) {
                return response()->json([
                    'success' => false,
                    'error' => 'マスコットが見つかりません'
                ], 404);
            }

            // なでることによる経験値とステータス変更
            $expGain = 10;
            $newHappiness = min(100, $mascot->happiness + 15);
            $newExperience = ($mascot->experience ?? 0) + $expGain;

            // マスコットステータスを更新
            DB::table('mascots')
                ->where('id', $mascot->id)
                ->update([
                    'happiness' => $newHappiness,
                    'experience' => $newExperience,
                    'last_played_at' => now(),
                    'updated_at' => now()
                ]);

            $level = intval($newExperience / 100) + 1;

            return response()->json([
                'success' => true,
                'message' => 'マスコットをなでました！',
                'data' => [
                    'exp_gained' => $expGain,
                    'happiness' => $newHappiness,
                    'experience' => $newExperience,
                    'level' => $level
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'なでるのに失敗しました',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * マスコットの名前を更新する
     */
    public function updateMascotName(Request $request)
    {
        try {
            // バリデーション
            $request->validate([
                'name' => 'required|string|min:1|max:20'
            ]);

            $newName = $request->input('name');

            // マスコットデータを取得（存在しない場合は作成）
            $mascot = DB::table('mascots')->where('user_id', 1)->first();
            
            if (!$mascot) {
                // マスコットが存在しない場合、デフォルトデータを作成
                DB::table('mascots')->insert([
                    'user_id' => 1,
                    'name' => $newName,
                    'level' => 1,
                    'health' => 100,
                    'happiness' => 50,
                    'energy' => 80,
                    'experience' => 0,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            } else {
                // 既存のマスコットの名前を更新
                DB::table('mascots')
                    ->where('user_id', 1)
                    ->update([
                        'name' => $newName,
                        'updated_at' => now()
                    ]);
            }

            return response()->json([
                'success' => true,
                'message' => '名前を更新しました！',
                'data' => [
                    'name' => $newName
                ]
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'error' => 'バリデーションエラー',
                'message' => $e->validator->errors()->first()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => '名前の更新に失敗しました',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}