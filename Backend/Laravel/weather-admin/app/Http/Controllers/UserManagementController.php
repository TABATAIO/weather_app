<?php

namespace App\Http\Controllers;

use App\Models\UserProfile;
use App\Models\ChatHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserManagementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = UserProfile::query();

        // 検索機能
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('user_name', 'like', "%{$search}%")
                  ->orWhere('user_id', 'like', "%{$search}%");
        }

        // フィルター機能
        if ($request->filled('preference_filter')) {
            $query->where('temperature_preference', $request->preference_filter);
        }

        // ソート機能
        $sortBy = $request->get('sort', 'updated_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $users = $query->with(['chatHistory' => function($q) {
            $q->latest()->limit(1);
        }])->paginate(15);

        return view('admin.users.index', compact('users'));
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = UserProfile::with('chatHistory')->findOrFail($id);
        
        // ユーザーの統計データ
        $stats = [
            'total_conversations' => $user->chatHistory()->count(),
            'avg_sentiment' => null, // sentiment is text-based, not numeric
            'most_common_intent' => $user->chatHistory()
                ->select('intent', DB::raw('COUNT(*) as count'))
                ->groupBy('intent')
                ->orderBy('count', 'desc')
                ->first()?->intent ?? 'N/A',
            'last_activity' => $user->chatHistory()->latest()->first()?->created_at,
        ];

        // 最近の会話履歴
        $recentChats = $user->chatHistory()->latest()->limit(20)->get();

        return view('admin.users.show', compact('user', 'stats', 'recentChats'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $user = UserProfile::findOrFail($id);
        return view('admin.users.edit', compact('user'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = UserProfile::findOrFail($id);

        $validated = $request->validate([
            'user_name' => 'required|string|max:255',
            'temperature_preference' => 'in:cold,cool,moderate,warm,hot',
            'activity_preference' => 'in:indoor,outdoor,both',
            'style_preference' => 'in:casual,polite,friendly',
            'weather_sensitivity' => 'in:low,normal,high',
            'favorite_activities' => 'nullable|string',
        ]);

        $user->update($validated);

        return redirect()->route('users.show', $id)
                        ->with('success', 'ユーザープロファイルが更新されました。');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = UserProfile::findOrFail($id);
        
        // 関連するチャット履歴も削除
        $user->chatHistory()->delete();
        $user->delete();

        return redirect()->route('users.index')
                        ->with('success', 'ユーザーが削除されました。');
    }

    /**
     * Export user data to CSV
     */
    public function export(Request $request)
    {
        $users = UserProfile::with('chatHistory')->get();

        $filename = 'user_profiles_' . date('Y-m-d_H-i-s') . '.csv';
        
        return response()->streamDownload(function() use ($users) {
            $output = fopen('php://output', 'w');
            
            // CSVヘッダー
            fputcsv($output, [
                'User ID',
                'User Name', 
                'Temperature Preference',
                'Activity Preference',
                'Style Preference',
                'Weather Sensitivity',
                'Favorite Activities',
                'Total Conversations',
                'Last Activity',
                'Created At'
            ]);

            // データ行
            foreach ($users as $user) {
                fputcsv($output, [
                    $user->user_id,
                    $user->user_name,
                    $user->temperature_preference,
                    $user->activity_preference,
                    $user->style_preference,
                    $user->weather_sensitivity,
                    $user->favorite_activities,
                    $user->chatHistory->count(),
                    $user->chatHistory->first()?->created_at?->format('Y-m-d H:i:s') ?? 'N/A',
                    $user->created_at->format('Y-m-d H:i:s')
                ]);
            }
            
            fclose($output);
        }, $filename, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"'
        ]);
    }
}
