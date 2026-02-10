@extends('layouts.admin')

@section('title', 'ダッシュボード - Weather Mascot Admin')

@section('content')
<div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">📊 管理者ダッシュボード</h1>
    
    <!-- 統計カード -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-2 rounded-full bg-blue-100">
                    <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">総ユーザー数</p>
                    <p class="text-2xl font-bold text-gray-900">{{ number_format($stats['total_users']) }}</p>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-2 rounded-full bg-green-100">
                    <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"></path>
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">総チャット数</p>
                    <p class="text-2xl font-bold text-gray-900">{{ number_format($stats['total_chats']) }}</p>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-2 rounded-full bg-yellow-100">
                    <svg class="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">今日のアクティブユーザー</p>
                    <p class="text-2xl font-bold text-gray-900">{{ number_format($stats['active_users_today']) }}</p>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-2 rounded-full bg-purple-100">
                    <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path>
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">人気の場所</p>
                    <p class="text-2xl font-bold text-gray-900">{{ $popularLocations->first()->weather_location ?? 'N/A' }}</p>
                </div>
            </div>
        </div>
    </div>

    <!-- クイックアクション -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">⚡ クイックアクション</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a href="{{ route('admin.mascot.settings') }}" 
               class="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all duration-200">
                <div class="p-2 rounded-full bg-blue-100 mr-3">
                    <i class="fas fa-robot text-blue-600 text-lg"></i>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-900">マスコット設定</h4>
                    <p class="text-sm text-gray-600">キャラクター基本設定・画像管理</p>
                </div>
            </a>
            
            <a href="{{ route('admin.fourth-form-evolutions.index') }}" 
               class="flex items-center p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg hover:from-orange-100 hover:to-red-100 transition-all duration-200">
                <div class="p-2 rounded-full bg-orange-100 mr-3">
                    <i class="fas fa-star text-orange-600 text-lg"></i>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-900">第四形態管理</h4>
                    <p class="text-sm text-gray-600">進化先追加・編集管理</p>
                </div>
            </a>
            
            <a href="{{ route('users.index') }}" 
               class="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-all duration-200">
                <div class="p-2 rounded-full bg-green-100 mr-3">
                    <i class="fas fa-users text-green-600 text-lg"></i>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-900">ユーザー管理</h4>
                    <p class="text-sm text-gray-600">ユーザー一覧・詳細管理</p>
                </div>
            </a>
            
            <a href="{{ route('admin.chat-analytics') }}" 
               class="flex items-center p-4 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg hover:from-purple-100 hover:to-violet-100 transition-all duration-200">
                <div class="p-2 rounded-full bg-purple-100 mr-3">
                    <i class="fas fa-chart-line text-purple-600 text-lg"></i>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-900">チャット分析</h4>
                    <p class="text-sm text-gray-600">会話データ・感情分析</p>
                </div>
            </a>
        </div>
    </div>

    <!-- チャートとテーブル -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- チャット推移グラフ -->
        <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">📈 チャット数推移（過去7日間）</h3>
            <canvas id="chatTrendChart" width="400" height="200"></canvas>
        </div>

        <!-- 人気の天気場所 -->
        <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">🌍 人気の天気場所 TOP5</h3>
            @if($popularLocations->count() > 0)
                <div class="space-y-2">
                    @foreach($popularLocations as $location)
                        <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span class="font-medium">{{ $location->weather_location }}</span>
                            <span class="text-sm text-gray-600">{{ number_format($location->count) }}回</span>
                        </div>
                    @endforeach
                </div>
            @else
                <p class="text-gray-500">データがありません。</p>
            @endif
        </div>
    </div>

    <!-- 最新ユーザーと最新チャット -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 最新ユーザー -->
        <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">👤 最新ユーザー</h3>
            @if($stats['recent_users']->count() > 0)
                <div class="space-y-3">
                    @foreach($stats['recent_users'] as $user)
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div>
                                <p class="font-medium">{{ $user->name }}</p>
                                <p class="text-sm text-gray-600">登録: {{ $user->created_at->format('Y-m-d') }}</p>
                            </div>
                            <a href="{{ route('users.show', $user->id) }}" 
                               class="text-blue-500 hover:text-blue-700 font-medium">詳細</a>
                        </div>
                    @endforeach
                </div>
            @else
                <p class="text-gray-500">最新ユーザーがありません。</p>
            @endif
        </div>

        <!-- 最新チャット -->
        <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">💬 最新チャット</h3>
            @if($stats['recent_chats']->count() > 0)
                <div class="space-y-3">
                    @foreach($stats['recent_chats'] as $chat)
                        <div class="p-3 bg-gray-50 rounded">
                            <p class="text-sm text-gray-800">{{ Str::limit($chat->message, 50) }}</p>
                            <p class="text-xs text-gray-500 mt-1">
                                {{ $chat->created_at->format('Y-m-d H:i') }}
                                @if($chat->weather_data)
                                    | 天気情報あり
                                @endif
                            </p>
                        </div>
                    @endforeach
                </div>
            @else
                <p class="text-gray-500">最新チャットがありません。</p>
            @endif
        </div>
    </div>
</div>

@push('scripts')
<script>
// チャット推移グラフ
const ctx = document.getElementById('chatTrendChart').getContext('2d');
const chartData = @json($chatTrends);

new Chart(ctx, {
    type: 'line',
    data: {
        labels: chartData.map(item => item.date),
        datasets: [{
            label: 'チャット数',
            data: chartData.map(item => item.count),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
</script>
@endpush
@endsection