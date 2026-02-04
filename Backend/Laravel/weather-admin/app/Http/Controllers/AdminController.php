<?php

namespace App\Http\Controllers;

use App\Models\UserProfile;
use App\Models\ChatHistory;
use App\Models\WeatherUser;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\MascotSetting;

class AdminController extends Controller
{
    public function dashboard()
    {
        // ダッシュボード統計データを取得
        $recentUsers = UserProfile::latest()->limit(5)->get();
        
        $stats = [
            'total_users' => UserProfile::count(),
            'total_chats' => ChatHistory::count(),
            'active_users_today' => UserProfile::whereDate('updated_at', today())->count(),
            'recent_users' => $recentUsers,
            'recent_chats' => ChatHistory::with('userProfile')->latest()->limit(10)->get(),
        ];

        // 日別のチャット数を取得（過去7日間）
        $chatTrends = ChatHistory::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // 人気の天気場所TOP5 (weather_dataから場所情報を抽出)
        $popularLocations = ChatHistory::whereNotNull('weather_data')
            ->where('weather_data', '!=', '')
            ->get()
            ->map(function ($chat) {
                // weather_dataから場所情報を抽出する簡易的な方法
                $data = $chat->weather_data;
                if (is_string($data) && strpos($data, '場所') !== false) {
                    return (object) ['weather_location' => '天気データあり', 'count' => 1];
                }
                return null;
            })
            ->filter()
            ->groupBy('weather_location')
            ->map(function ($group, $location) {
                return (object) ['weather_location' => $location, 'count' => $group->count()];
            })
            ->sortByDesc('count')
            ->take(5);

        return view('admin.dashboard', compact('stats', 'chatTrends', 'popularLocations'));
    }

    public function userProfiles()
    {
        $users = UserProfile::with([
            'chatHistory' => function ($query) {
                $query->latest()->limit(1);
            }
        ])->paginate(20);

        return view('admin.user-profiles', compact('users'));
    }

    public function chatAnalytics()
    {
        // 感情分析データ（sentimentは文字列形式で保存されているため、テキストベースで集計）
        $sentimentData = (object) [
            'avg_sentiment' => null,
            'positive_count' => ChatHistory::where('sentiment', 'like', '%positive%')->orWhere('sentiment', 'like', '%good%')->orWhere('sentiment', 'like', '%happy%')->count(),
            'negative_count' => ChatHistory::where('sentiment', 'like', '%negative%')->orWhere('sentiment', 'like', '%bad%')->orWhere('sentiment', 'like', '%sad%')->count(),
            'neutral_count' => ChatHistory::where('sentiment', 'like', '%neutral%')->orWhere('sentiment', 'like', '%normal%')->orWhereNull('sentiment')->count(),
        ];

        // インテント別統計
        $intentStats = ChatHistory::select('intent', DB::raw('COUNT(*) as count'))
            ->groupBy('intent')
            ->orderBy('count', 'desc')
            ->get();

        return view('admin.chat-analytics', compact('sentimentData', 'intentStats'));
    }

    // マスコット設定画面表示
    public function mascotSettings()
    {
        $mascot = MascotSetting::getCurrentSetting();
        return view('admin.mascot-settings', compact('mascot'));
    }

    // マスコットの情報更新
    public function updateMascot(Request $request)
    {
        $validated = $request->validate([
            'initial_name' => 'required|string|max:30',
            'character_species' => 'required|in:cloud_spirit,weather_fairy,storm_guardian,sky_dragon',
            'character_description' => 'nullable|string|max:500',
            'second_form_name' => 'nullable|string|max:50',
            'third_form_active_name' => 'nullable|string|max:50',
            'third_form_calm_name' => 'nullable|string|max:50',
            // 第四形態のフィールド
            'ultimate_form_name' => 'nullable|string|max:50',
            'legendary_form_name' => 'nullable|string|max:50',
            'evolution_level_1_to_2' => 'required|integer|min:2|max:50',
            'evolution_level_2_to_3' => 'required|integer|min:15|max:100|gt:evolution_level_1_to_2',
            'evolution_level_3_to_4' => 'required|integer|min:30|max:80|gt:evolution_level_2_to_3',
            'max_level_third_form' => 'required|integer|min:30|max:150',
            'max_level_fourth_form' => 'required|integer|min:60|max:200|gt:max_level_third_form',
            'personality_threshold' => 'required|integer|min:50|max:90',
            'ultimate_evolution_threshold' => 'required|integer|min:70|max:95',
            'requires_special_item' => 'boolean',
            'special_item_name' => 'nullable|string|max:100',
            'special_abilities' => 'nullable|string|max:1000',
            'weather_control_power' => 'required|integer|min:0|max:100',
            // 画像フィールド（ファイルサイズ制限なし）
            'first_form_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp',
            'second_form_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp',
            'third_form_active_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp',
            'third_form_calm_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp',
            'ultimate_form_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp',
            'legendary_form_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp',
            'image_size' => 'required|in:small,medium,large',
            'enable_animation' => 'boolean',
            'enable_bounce' => 'boolean',
            'color_filter' => 'required|in:none,warm,cool,sepia,grayscale',
        ]);

        $validated['enable_animation'] = $request->has('enable_animation');
        $validated['enable_bounce'] = $request->has('enable_bounce');
        $validated['requires_special_item'] = $request->has('requires_special_item');

        try {
            $mascot = MascotSetting::getCurrentSetting();
            
            //第1形態の画像処理
            if ($request->hasFile('first_form_image')) {
                try {
                    // 古い画像を削除
                    if ($mascot->getAttribute('first_form_image') && Storage::disk('public')->exists($mascot->getAttribute('first_form_image'))) {
                        Storage::disk('public')->delete($mascot->getAttribute('first_form_image'));
                    }
                    // 新しい画像を保存
                    $firstImagePath = $request->file('first_form_image')->store('mascots', 'public');
                    $validated['first_form_image'] = $firstImagePath;
                } catch (\Exception $e) {
                    \Log::error('第1形態画像のアップロードエラー: ' . $e->getMessage());
                    throw new \Exception('第1形態画像のアップロードに失敗しました: ' . $e->getMessage());
                }
            }
            // 第二形態の画像処理
            if ($request->hasFile('second_form_image')) {
                // 古い画像を削除
                if ($mascot->getAttribute('second_form_image') && Storage::disk('public')->exists($mascot->getAttribute('second_form_image'))) {
                    Storage::disk('public')->delete($mascot->getAttribute('second_form_image'));
                }
                // 新しい画像を保存
                $secondImagePath = $request->file('second_form_image')->store('mascots', 'public');
                $validated['second_form_image'] = $secondImagePath;
            }
            // 第三形態（活発）の画像処理
            if ($request->hasFile('third_form_active_image')) {
                // 古い画像を削除
                if ($mascot->getAttribute('third_form_active_image') && Storage::disk('public')->exists($mascot->getAttribute('third_form_active_image'))) {
                    Storage::disk('public')->delete($mascot->getAttribute('third_form_active_image'));
                }
                // 新しい画像を保存
                $thirdActiveImagePath = $request->file('third_form_active_image')->store('mascots', 'public');
                $validated['third_form_active_image'] = $thirdActiveImagePath;
            }
            // 第三形態（穏やか）の画像処理
            if ($request->hasFile('third_form_calm_image')) {
                // 古い画像を削除
                if ($mascot->getAttribute('third_form_calm_image') && Storage::disk('public')->exists($mascot->getAttribute('third_form_calm_image'))) {
                    Storage::disk('public')->delete($mascot->getAttribute('third_form_calm_image'));
                }
                // 新しい画像を保存
                $thirdCalmImagePath = $request->file('third_form_calm_image')->store('mascots', 'public');
                $validated['third_form_calm_image'] = $thirdCalmImagePath;
            }
            // 第四形態（究極）の画像処理
            if ($request->hasFile('ultimate_form_image')) {
                // 古い画像を削除
                if ($mascot->getAttribute('ultimate_form_image') && Storage::disk('public')->exists($mascot->getAttribute('ultimate_form_image'))) {
                    Storage::disk('public')->delete($mascot->getAttribute('ultimate_form_image'));
                }
                // 新しい画像を保存
                $ultimateImagePath = $request->file('ultimate_form_image')->store('mascots', 'public');
                $validated['ultimate_form_image'] = $ultimateImagePath;
            }
            // 第四形態（伝説）の画像処理
            if ($request->hasFile('legendary_form_image')) {
                // 古い画像を削除
                if ($mascot->getAttribute('legendary_form_image') && Storage::disk('public')->exists($mascot->getAttribute('legendary_form_image'))) {
                    Storage::disk('public')->delete($mascot->getAttribute('legendary_form_image'));
                }
                // 新しい画像を保存
                $legendaryImagePath = $request->file('legendary_form_image')->store('mascots', 'public');
                $validated['legendary_form_image'] = $legendaryImagePath;
            }

            $mascot->update($validated);

            return redirect()->route('admin.mascot.settings')->with('success', 'マスコットの設定が正常に保存されました。');
        } catch (\Exception $e) {
            \Log::error('マスコットの設定の保存中にエラーが発生しました。', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            return redirect()->route('admin.mascot.settings')->with('error', 'マスコットの設定の保存中にエラーが発生しました: ' . $e->getMessage());
        }
    }
}
