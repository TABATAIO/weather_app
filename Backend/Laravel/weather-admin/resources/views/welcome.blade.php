<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>天気アプリ管理者ダッシュボード</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
    
    <!-- Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

    @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    @else
        @include('partials.admin-styles')
    @endif
</head>
<body class="bg-gray-50 min-h-screen">
    <!-- Header -->
    @include('partials.admin-header')

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-8">
        @auth
            @php
                // リアルタイム統計データを取得
                $totalUsers = \App\Models\UserProfile::count();
                $todayChats = \App\Models\ChatHistory::whereDate('created_at', today())->count();
                $weatherSearches = \App\Models\ChatHistory::where('intent', 'weather_query')->count();
                $activeRate = $totalUsers > 0 ? round((\App\Models\UserProfile::whereDate('updated_at', '>=', now()->subDays(7))->count() / $totalUsers) * 100) : 0;
                
                $recentUsers = \App\Models\UserProfile::latest()->limit(5)->get();
                $recentChats = \App\Models\ChatHistory::with('userProfile')->latest()->limit(5)->get();
            @endphp
            
            <!-- 統計カード -->
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <x-stat-card 
                    icon="fas fa-users" 
                    title="総ユーザー数" 
                    :value="number_format($totalUsers)" 
                    color="blue" 
                />
                
                <x-stat-card 
                    icon="fas fa-comment-dots" 
                    title="今日のチャット" 
                    :value="number_format($todayChats)" 
                    color="green" 
                />
                
                <x-stat-card 
                    icon="fas fa-cloud" 
                    title="天気検索数" 
                    :value="number_format($weatherSearches)" 
                    color="yellow" 
                />
                
                <x-stat-card 
                    icon="fas fa-chart-line" 
                    title="アクティブ率" 
                    :value="$activeRate . '%'" 
                    color="purple" 
                />
            </div>

            <!-- 機能カード -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <x-feature-card 
                    title="ユーザー管理"
                    icon="fas fa-users"
                    description="登録ユーザーの管理、プロフィール確認、アクティビティ監視を行えます。"
                    :buttons="[
                        [
                            'type' => 'link',
                            'url' => route('admin.users'),
                            'icon' => 'fas fa-eye',
                            'text' => 'ユーザー一覧を見る'
                        ],
                        [
                            'type' => 'button',
                            'onclick' => 'showAddUserModal()',
                            'icon' => 'fas fa-plus',
                            'text' => '新規ユーザー追加'
                        ]
                    ]"
                />
                
                <x-feature-card 
                    title="チャット分析"
                    icon="fas fa-chart-bar"
                    description="ユーザーとのチャット履歴、感情分析、インテント解析を確認できます。"
                    :buttons="[
                        [
                            'type' => 'link',
                            'url' => route('admin.chat-analytics'),
                            'icon' => 'fas fa-comments',
                            'text' => 'チャット履歴'
                        ],
                        [
                            'type' => 'button',
                            'onclick' => 'showSentimentReport()',
                            'icon' => 'fas fa-heart',
                            'text' => '感情分析レポート'
                        ]
                    ]"
                />
                
                <x-feature-card 
                    title="天気データ管理"
                    icon="fas fa-cloud-sun"
                    description="天気API設定、データキャッシュ管理、検索履歴の確認を行えます。"
                    :buttons="[
                        [
                            'type' => 'link',
                            'url' => route('admin.api-settings'),
                            'icon' => 'fas fa-cog',
                            'text' => 'API設定'
                        ],
                        [
                            'type' => 'button',
                            'onclick' => 'showSearchHistory()',
                            'icon' => 'fas fa-search',
                            'text' => '検索履歴'
                        ]
                    ]"
                />
            </div>

            <!-- 最近のアクティビティ -->
            @include('partials.recent-activity', ['recentUsers' => $recentUsers, 'recentChats' => $recentChats])

        @else
            <!-- ログインしていない場合の表示 -->
            @include('partials.login-required')
        @endauth
    </main>

    <!-- Footer -->
    @include('partials.admin-footer')

    @include('partials.admin-scripts')
</body>
</html>
