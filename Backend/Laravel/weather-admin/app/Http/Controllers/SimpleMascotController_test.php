<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SimpleMascotController_test extends Controller
{
    /**
     * マスコットのテスト状態を取得
     */
    public function testStatus(Request $request)
    {
        try {
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => 1,
                    'name' => 'からめる',
                    'level' => 1,
                    'health' => 100,
                    'happiness' => 50,
                    'energy' => 80,
                    'total_experience' => 0
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'テストに失敗しました',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}