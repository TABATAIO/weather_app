<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MissionController extends Controller
{
    /**
     * 今日のミッション一覧を取得
     */
    public function getTodayMissions(Request $request)
    {
        try {
            $userId = $request->get('user_id', 1); // デフォルトユーザー
            $today = Carbon::today();

            // 今日のミッション進捗を取得
            $userMissions = DB::table('user_mission_progress as ump')
                ->join('missions as m', 'ump.mission_id', '=', 'm.id')
                ->where('ump.user_id', $userId)
                ->where('ump.assigned_date', $today)
                ->select(
                    'm.id',
                    'm.name',
                    'm.description',
                    'm.mission_type',
                    'm.target_action',
                    'm.target_params',
                    'm.reward_exp',
                    'm.icon',
                    'ump.is_completed',
                    'ump.progress',
                    'ump.target_count',
                    'ump.completed_at'
                )
                ->get();

            // 今日のミッションが未割り当ての場合、ランダムに3つ選択
            if ($userMissions->isEmpty()) {
                $this->assignTodayMissions($userId, $today);
                
                // 再取得
                $userMissions = DB::table('user_mission_progress as ump')
                    ->join('missions as m', 'ump.mission_id', '=', 'm.id')
                    ->where('ump.user_id', $userId)
                    ->where('ump.assigned_date', $today)
                    ->select(
                        'm.id',
                        'm.name',
                        'm.description',
                        'm.mission_type',
                        'm.target_action',
                        'm.target_params',
                        'm.reward_exp',
                        'm.icon',
                        'ump.is_completed',
                        'ump.progress',
                        'ump.target_count',
                        'ump.completed_at'
                    )
                    ->get();
            }

            return response()->json([
                'success' => true,
                'data' => $userMissions->map(function ($mission) {
                    return [
                        'id' => $mission->id,
                        'name' => $mission->name,
                        'description' => $mission->description,
                        'mission_type' => $mission->mission_type,
                        'target_action' => $mission->target_action,
                        'target_params' => json_decode($mission->target_params),
                        'reward_exp' => $mission->reward_exp,
                        'icon' => $mission->icon,
                        'is_completed' => (bool)$mission->is_completed,
                        'progress' => $mission->progress,
                        'target_count' => $mission->target_count,
                        'completed_at' => $mission->completed_at,
                        'progress_percentage' => $mission->target_count > 0 
                            ? round(($mission->progress / $mission->target_count) * 100, 1) 
                            : 0
                    ];
                })
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'ミッション取得に失敗しました',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 今日のミッションをランダムに3つ割り当て
     */
    private function assignTodayMissions($userId, $date)
    {
        // 利用可能なミッション一覧を取得
        $availableMissions = DB::table('missions')
            ->where('is_active', true)
            ->inRandomOrder()
            ->limit(3)
            ->get();

        foreach ($availableMissions as $mission) {
            // target_paramsからtarget_countを取得
            $targetParams = json_decode($mission->target_params, true);
            $targetCount = isset($targetParams['count']) ? $targetParams['count'] : 1;

            DB::table('user_mission_progress')->insert([
                'user_id' => $userId,
                'mission_id' => $mission->id,
                'assigned_date' => $date,
                'target_count' => $targetCount,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }

    /**
     * ミッション進捗を更新
     */
    public function updateMissionProgress(Request $request)
    {
        try {
            $userId = $request->get('user_id', 1);
            $action = $request->get('action');
            $today = Carbon::today();

            if (!$action) {
                return response()->json([
                    'success' => false,
                    'error' => 'アクションが指定されていません'
                ], 400);
            }

            // 該当するミッションを検索
            $mission = DB::table('user_mission_progress as ump')
                ->join('missions as m', 'ump.mission_id', '=', 'm.id')
                ->where('ump.user_id', $userId)
                ->where('ump.assigned_date', $today)
                ->where('m.target_action', $action)
                ->where('ump.is_completed', false)
                ->select('ump.*', 'm.name as mission_name', 'm.reward_exp')
                ->first();

            if (!$mission) {
                return response()->json([
                    'success' => false,
                    'error' => '該当するミッションが見つかりません'
                ]);
            }

            // 進捗を更新
            $newProgress = $mission->progress + 1;
            $isCompleted = $newProgress >= $mission->target_count;

            $updateData = [
                'progress' => $newProgress,
                'updated_at' => now()
            ];

            if ($isCompleted) {
                $updateData['is_completed'] = true;
                $updateData['completed_at'] = now();
            }

            DB::table('user_mission_progress')
                ->where('id', $mission->id)
                ->update($updateData);

            // ミッション完了時はマスコットに経験値を付与
            if ($isCompleted) {
                $this->awardMissionReward($userId, $mission->reward_exp);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'mission_name' => $mission->mission_name,
                    'progress' => $newProgress,
                    'target_count' => $mission->target_count,
                    'is_completed' => $isCompleted,
                    'reward_exp' => $isCompleted ? $mission->reward_exp : 0,
                    'message' => $isCompleted 
                        ? "ミッション「{$mission->mission_name}」完了！ +{$mission->reward_exp}EXP"
                        : "進捗更新: {$newProgress}/{$mission->target_count}"
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'ミッション進捗更新に失敗しました',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ミッション報酬をマスコットに付与
     */
    private function awardMissionReward($userId, $rewardExp)
    {
        try {
            $mascot = DB::table('user_mascots')->where('user_id', $userId)->first();
            
            if ($mascot) {
                $newExperience = $mascot->current_experience + $rewardExp;
                
                DB::table('user_mascots')
                    ->where('user_id', $userId)
                    ->update([
                        'current_experience' => $newExperience,
                        'updated_at' => now()
                    ]);
            }
        } catch (\Exception $e) {
            // エラーログに記録するが、ミッション完了は成功として扱う
            error_log("ミッション報酬付与エラー: " . $e->getMessage());
        }
    }
}
