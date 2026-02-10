@extends('layouts.admin')

@section('title', 'ユーザー詳細 - Weather Mascot Admin')

@section('content')
<div class="mb-8">
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="text-3xl font-bold text-gray-800">👤 ユーザー詳細</h1>
            <p class="text-gray-600">{{ $user->name }} ({{ $user->id }})</p>
        </div>
        <div class="space-x-2">
            <a href="{{ route('users.edit', $user->id) }}" 
               class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                ✏️ 編集
            </a>
            <a href="{{ route('users.index') }}" 
               class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
                ← 戻る
            </a>
        </div>
    </div>

    <!-- 統計情報 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-2 rounded-full bg-blue-100">
                    <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"></path>
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">総会話数</p>
                    <p class="text-2xl font-bold text-gray-900">{{ number_format($stats['total_conversations']) }}</p>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-2 rounded-full bg-green-100">
                    <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">平均感情スコア</p>
                    <p class="text-2xl font-bold text-gray-900">
                        @if($stats['avg_sentiment'])
                            {{ number_format($stats['avg_sentiment'], 2) }}
                        @else
                            N/A
                        @endif
                    </p>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-2 rounded-full bg-yellow-100">
                    <svg class="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">主なインテント</p>
                    <p class="text-2xl font-bold text-gray-900">{{ $stats['most_common_intent'] }}</p>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-2 rounded-full bg-purple-100">
                    <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">最終活動</p>
                    <p class="text-sm font-bold text-gray-900">
                        @if($stats['last_activity'])
                            {{ $stats['last_activity']->format('Y/m/d H:i') }}
                        @else
                            なし
                        @endif
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- ユーザー情報とチャット履歴 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- ユーザープロファイル -->
        <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">📋 ユーザープロファイル</h3>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">ユーザー名</label>
                    <p class="mt-1 text-sm text-gray-900">{{ $user->name }}</p>
                </div>
                
                @if(isset($user->email))
                <div>
                    <label class="block text-sm font-medium text-gray-700">メールアドレス</label>
                    <p class="mt-1 text-sm text-gray-900">{{ $user->email }}</p>
                </div>
                @endif

                <div>
                    <label class="block text-sm font-medium text-gray-700">登録日</label>
                    <p class="mt-1 text-sm text-gray-900">{{ $user->created_at->format('Y年m月d日 H:i') }}</p>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700">更新日</label>
                    <p class="mt-1 text-sm text-gray-900">{{ $user->updated_at->format('Y年m月d日 H:i') }}</p>
                </div>
            </div>
        </div>

        <!-- チャット履歴 -->
        <div class="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">💬 最近のチャット履歴</h3>
            @if($recentChats->count() > 0)
                <div class="space-y-4 max-h-96 overflow-y-auto">
                    @foreach($recentChats as $chat)
                        <div class="border-l-4 border-blue-500 pl-4 py-2">
                            <div class="flex justify-between items-start mb-2">
                                <div class="flex items-center space-x-2">
                                    @if($chat->intent)
                                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                            {{ $chat->intent }}
                                        </span>
                                    @endif
                                    @if($chat->sentiment_score !== null)
                                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                                            {{ $chat->sentiment_score > 0.5 ? 'bg-green-100 text-green-800' : 
                                               ($chat->sentiment_score < -0.5 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800') }}">
                                            感情: {{ number_format($chat->sentiment_score, 2) }}
                                        </span>
                                    @endif
                                    @if($chat->weather_data)
                                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            🌤️ 天気データ
                                        </span>
                                    @endif
                                </div>
                                <span class="text-xs text-gray-500">{{ $chat->created_at->format('m/d H:i') }}</span>
                            </div>
                            <div class="mb-2">
                                <p class="text-sm text-gray-700"><strong>ユーザー:</strong> {{ $chat->user_message }}</p>
                            </div>
                            <div class="bg-gray-50 p-2 rounded text-sm text-gray-600">
                                <strong>Bot応答:</strong> {{ Str::limit($chat->bot_response, 200) }}
                            </div>
                        </div>
                    @endforeach
                </div>
                
                @if($user->chatHistory()->count() > 20)
                    <div class="mt-4 text-center">
                        <p class="text-sm text-gray-500">
                            他に {{ number_format($user->chatHistory()->count() - 20) }} 件のチャット履歴があります
                        </p>
                    </div>
                @endif
            @else
                <div class="text-center py-8">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900">チャット履歴なし</h3>
                    <p class="mt-1 text-sm text-gray-500">このユーザーはまだチャットをしていません。</p>
                </div>
            @endif
        </div>
    </div>
</div>
@endsection