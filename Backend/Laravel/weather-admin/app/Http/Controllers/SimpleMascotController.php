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
            // user_mascotsテーブルから実際の名前を取得
            $mascot = DB::table('user_mascots')->where('user_id', 1)->first();
            
            if (!$mascot) {
                // マスコットが存在しない場合、デフォルトデータを作成
                DB::table('user_mascots')->insert([
                    'user_id' => 1,
                    'current_name' => 'からめる',
                    'mascot_setting_id' => 1,
                    'health' => 100,
                    'happiness' => 50,
                    'energy' => 80,
                    'current_experience' => 0,
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
                    'name' => $mascot->current_name ?? 'からめる',
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
            $mascot = DB::table('user_mascots')->where('user_id', 1)->first();
            
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
                
                DB::table('user_mascots')->insert([
                    'user_id' => 1,
                    'current_name' => $defaultInfo['name'],
                    'mascot_setting_id' => 1,
                    'health' => $defaultInfo['health'],
                    'happiness' => $defaultInfo['happiness'],
                    'energy' => $defaultInfo['energy'],
                    'current_experience' => 0,
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
                'name' => $mascot->current_name ?? 'からめる',
                'level' => intval(($mascot->current_experience ?? 0) / 100) + 1,
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
            $mascot = DB::table('user_mascots')->where('user_id', 1)->first();
            
            if (!$mascot) {
                // マスコットが存在しない場合、デフォルトデータを作成
                DB::table('user_mascots')->insert([
                    'user_id' => 1,
                    'current_name' => 'からめる',
                    'mascot_setting_id' => 1,
                    'health' => 100,
                    'happiness' => 50,
                    'energy' => 80,
                    'current_experience' => 0,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                $mascot = DB::table('user_mascots')->where('user_id', 1)->first();
            }

            $level = intval(($mascot->current_experience ?? 0) / 100) + 1;

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $mascot->id,
                    'name' => $mascot->current_name ?? 'からめる',
                    'level' => $level,
                    'health' => $mascot->health ?? 100,
                    'happiness' => $mascot->happiness ?? 50,
                    'energy' => $mascot->energy ?? 80,
                    'total_experience' => $mascot->current_experience ?? 0,
                    'last_fed_at' => $mascot->last_fed_at ?? null,
                    'last_played_at' => $mascot->last_played_at ?? null,
                    'last_petted_at' => $mascot->last_pet_at ?? null,
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
     * マスコットにエサをあげる
     */
    public function feedMascot(Request $request)
    {
        try {
            // 直接SQLでマスコットデータを取得
            $mascot = DB::table('user_mascots')->where('user_id', 1)->first();
            
            if (!$mascot) {
                // マスコットが存在しない場合、デフォルトデータを作成
                DB::table('user_mascots')->insert([
                    'user_id' => 1,
                    'current_name' => 'からめる',
                    'mascot_setting_id' => 1,
                    'health' => 100,
                    'happiness' => 50,
                    'energy' => 80,
                    'current_experience' => 0,
                    'last_fed_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                $mascot = DB::table('user_mascots')->where('user_id', 1)->first();
            }

            // エサやりによる経験値とステータス変更
            $expGain = 15;
            $newHealth = min(100, $mascot->health + 20);
            $newEnergy = min(100, $mascot->energy + 10);
            $newExperience = ($mascot->current_experience ?? 0) + $expGain;

            // マスコットステータスを更新
            DB::table('user_mascots')
                ->where('id', $mascot->id)
                ->update([
                    'health' => $newHealth,
                    'energy' => $newEnergy,
                    'current_experience' => $newExperience,
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
            $mascot = DB::table('user_mascots')->where('id', 1)->first();
            
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
            $newExperience = ($mascot->current_experience ?? 0) + $expGain;

            // マスコットステータスを更新
            DB::table('user_mascots')
                ->where('id', $mascot->id)
                ->update([
                    'happiness' => $newHappiness,
                    'energy' => $newEnergy,
                    'current_experience' => $newExperience,
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
                    'current_experience' => $newExperience,
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
            $mascot = DB::table('user_mascots')->where('id', 1)->first();
            
            if (!$mascot) {
                return response()->json([
                    'success' => false,
                    'error' => 'マスコットが見つかりません'
                ], 404);
            }

            // なでることによる経験値とステータス変更
            $expGain = 10;
            $newHappiness = min(100, $mascot->happiness + 15);
            $newExperience = ($mascot->current_experience ?? 0) + $expGain;

            // マスコットステータスを更新
            DB::table('user_mascots')
                ->where('id', $mascot->id)
                ->update([
                    'happiness' => $newHappiness,
                    'current_experience' => $newExperience,
                    'last_pet_at' => now(),
                    'updated_at' => now()
                ]);

            $level = intval($newExperience / 100) + 1;

            return response()->json([
                'success' => true,
                'message' => 'マスコットをなでました！',
                'data' => [
                    'exp_gained' => $expGain,
                    'happiness' => $newHappiness,
                    'current_experience' => $newExperience,
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
            $mascot = DB::table('user_mascots')->where('user_id', 1)->first();
            
            if (!$mascot) {
                // マスコットが存在しない場合、デフォルトデータを作成
                DB::table('user_mascots')->insert([
                    'user_id' => 1,
                    'current_name' => $newName,
                    'mascot_setting_id' => 1,
                    'health' => 100,
                    'happiness' => 50,
                    'energy' => 80,
                    'current_experience' => 0,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            } else {
                // 既存のマスコットの名前を更新
                DB::table('user_mascots')
                    ->where('user_id', 1)
                    ->update([
                        'current_name' => $newName,
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