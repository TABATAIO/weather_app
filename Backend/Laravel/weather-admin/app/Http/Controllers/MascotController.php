<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MascotController extends Controller
{
    /**
     * マスコット情報を取得
     */
    public function getMascotInfo(Request $request)
    {
        try {
            $userId = $request->input('user_id', 1); // デフォルトユーザーID
            
            // マスコット基本情報を取得または作成
            $mascot = DB::table('mascots')->where('user_id', $userId)->first();
            
            if (!$mascot) {
                // 新しいマスコットを作成
                $mascotId = DB::table('mascots')->insertGetId([
                    'user_id' => $userId,
                    'name' => 'からめる',
                    'level' => 1,
                    'experience' => 0,
                    'health' => 80,
                    'happiness' => 60,
                    'energy' => 70,
                    'last_fed_at' => Carbon::now(),
                    'last_played_at' => Carbon::now(),
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]);
                
                $mascot = DB::table('mascots')->where('id', $mascotId)->first();
            }
            
            // 時間経過による状態変化を計算
            $now = Carbon::now();
            $lastFed = Carbon::parse($mascot->last_fed_at);
            $lastPlayed = Carbon::parse($mascot->last_played_at);
            
            $hoursSinceFed = $lastFed->diffInHours($now);
            $hoursSincePlayed = $lastPlayed->diffInHours($now);
            
            // 満腹度の減少（1時間で5ポイント減少）
            $currentHappiness = max(0, $mascot->happiness - ($hoursSinceFed * 5));
            
            // エネルギーの減少（1時間で3ポイント減少）
            $currentEnergy = max(0, $mascot->energy - ($hoursSincePlayed * 3));
            
            // 気分の決定
            $mood = $this->calculateMood($currentHappiness, $currentEnergy, $mascot->health);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $mascot->id,
                    'name' => $mascot->name,
                    'level' => $mascot->level,
                    'experience' => $mascot->experience,
                    'health' => $mascot->health,
                    'happiness' => $currentHappiness,
                    'energy' => $currentEnergy,
                    'mood' => $mood,
                    'last_fed_at' => $mascot->last_fed_at,
                    'last_played_at' => $mascot->last_played_at,
                    'created_at' => $mascot->created_at,
                ]
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
     * マスコットの状態を更新
     */
    public function updateMascot(Request $request)
    {
        try {
            $userId = $request->input('user_id', 1);
            $action = $request->input('action'); // 'feed', 'play', 'pet'
            
            $mascot = DB::table('mascots')->where('user_id', $userId)->first();
            
            if (!$mascot) {
                return response()->json([
                    'success' => false,
                    'error' => 'マスコットが見つかりません'
                ], 404);
            }
            
            $updates = ['updated_at' => Carbon::now()];
            
            switch ($action) {
                case 'feed':
                    $updates['happiness'] = min(100, $mascot->happiness + 20);
                    $updates['last_fed_at'] = Carbon::now();
                    break;
                    
                case 'play':
                    $updates['energy'] = min(100, $mascot->energy + 15);
                    $updates['experience'] = $mascot->experience + 5;
                    $updates['last_played_at'] = Carbon::now();
                    break;
                    
                case 'pet':
                    $updates['happiness'] = min(100, $mascot->happiness + 10);
                    $updates['energy'] = min(100, $mascot->energy + 5);
                    break;
            }
            
            // レベルアップチェック
            if (isset($updates['experience'])) {
                $newLevel = floor($updates['experience'] / 100) + 1;
                if ($newLevel > $mascot->level) {
                    $updates['level'] = $newLevel;
                    $updates['health'] = min(100, $mascot->health + 10);
                }
            }
            
            DB::table('mascots')->where('user_id', $userId)->update($updates);
            
            // 更新後のデータを取得
            return $this->getMascotInfo($request);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'マスコット状態の更新に失敗しました',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ミッション一覧を取得
     */
    public function getMissions(Request $request)
    {
        try {
            $userId = $request->input('user_id', 1);
            $today = Carbon::today();
            
            // 今日のミッション一覧
            $missions = [
                [
                    'id' => 1,
                    'title' => '天気をチェックしよう',
                    'description' => '今日の天気を確認してマスコットと一緒に準備しよう',
                    'type' => 'daily',
                    'progress' => 0,
                    'max_progress' => 1,
                    'reward_exp' => 10,
                    'completed' => false,
                ],
                [
                    'id' => 2,
                    'title' => 'マスコットと遊ぼう',
                    'description' => 'マスコットに3回話しかけてみよう',
                    'type' => 'daily',
                    'progress' => 0,
                    'max_progress' => 3,
                    'reward_exp' => 15,
                    'completed' => false,
                ],
                [
                    'id' => 3,
                    'title' => '餌をあげよう',
                    'description' => 'マスコットにご飯をあげて元気にしよう',
                    'type' => 'daily',
                    'progress' => 0,
                    'max_progress' => 1,
                    'reward_exp' => 8,
                    'completed' => false,
                ]
            ];
            
            // ユーザーのミッション進行状況を取得
            $userMissions = DB::table('user_missions')
                ->where('user_id', $userId)
                ->where('date', $today)
                ->get()
                ->keyBy('mission_id');
            
            // ミッション進行状況を反映
            foreach ($missions as &$mission) {
                if (isset($userMissions[$mission['id']])) {
                    $userMission = $userMissions[$mission['id']];
                    $mission['progress'] = $userMission->progress;
                    $mission['completed'] = $userMission->completed;
                }
            }
            
            return response()->json([
                'success' => true,
                'data' => $missions
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'ミッション情報の取得に失敗しました',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 気分を計算する
     */
    private function calculateMood($happiness, $energy, $health)
    {
        if ($happiness >= 80 && $energy >= 80) {
            return '最高に元気！';
        } elseif ($happiness >= 60 && $energy >= 60) {
            return '元気いっぱい♪';
        } elseif ($happiness >= 40 && $energy >= 40) {
            return '普通の気分';
        } elseif ($happiness >= 20 || $energy >= 20) {
            return 'ちょっと疲れた';
        } else {
            return 'お腹すいた...';
        }
    }
}