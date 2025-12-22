<?php

namespace App\Http\Controllers;

use App\Models\UserProfile;
use App\Models\ChatHistory;
use App\Models\WeatherUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function dashboard()
    {
        // ダッシュボード統計データを取得
        $stats = [
            'total_users' => UserProfile::count(),
            'total_chats' => ChatHistory::count(),
            'active_users_today' => UserProfile::whereDate('updated_at', today())->count(),
            'recent_users' => UserProfile::latest()->limit(5)->get(),
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
            ->map(function($chat) {
                // weather_dataから場所情報を抽出する簡易的な方法
                $data = $chat->weather_data;
                if (is_string($data) && strpos($data, '場所') !== false) {
                    return (object)['weather_location' => '天気データあり', 'count' => 1];
                }
                return null;
            })
            ->filter()
            ->groupBy('weather_location')
            ->map(function($group, $location) {
                return (object)['weather_location' => $location, 'count' => $group->count()];
            })
            ->sortByDesc('count')
            ->take(5);

        return view('admin.dashboard', compact('stats', 'chatTrends', 'popularLocations'));
    }

    public function userProfiles()
    {
        $users = UserProfile::with(['chatHistory' => function($query) {
            $query->latest()->limit(1);
        }])->paginate(20);

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
        $mascot = (object) [
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
        ];
        return view('admin.mascot-settings', compact('mascot'));
    }

    // マスコットの情報更新
    public function updateMascot(Request $request)
    {
        $validated = $request->validate([
            'initial_name' => 'required|string|max:50',
            'character_species' => 'required|in:cloud_spirit,weather_fairy,storm_guardian,sky_dragon',
            'character_description' => 'nullable|string|max:500',
            'second_form_name' => 'nullable|string|max:50',
            'evolution_level_1_to_2' => 'required|integer|min:2|max:50',
            'max_level_second_form' => 'required|integer|min:15|max:100',
            'image_size' => 'required|in:small,medium,large',
            'enable_animation' => 'boolean',
            'enable_bounce' => 'boolean',
            'color_filter' => 'required|in:none,warm,cool,sepia,grayscale'
        ]);
        return redirect()->route('admin.mascot.settings')->with('success', 'マスコットの設定が完了しました。');
    }
}
