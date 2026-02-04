@extends('layouts.admin')

@section('title', 'ユーザー管理 - Weather Mascot Admin')

@section('content')
<div class="mb-8">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">👤 ユーザー管理</h1>
        <a href="{{ route('users.export') }}" 
           class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">
            📊 CSVエクスポート
        </a>
    </div>

    <!-- 検索・フィルター -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
        <form method="GET" action="{{ route('users.index') }}" class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">検索</label>
                <input type="text" name="search" value="{{ request('search') }}" 
                       placeholder="ユーザー名またはID"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">温度設定</label>
                <select name="preference_filter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">すべて</option>
                    <option value="cold" {{ request('preference_filter') === 'cold' ? 'selected' : '' }}>寒がり</option>
                    <option value="cool" {{ request('preference_filter') === 'cool' ? 'selected' : '' }}>涼しめ</option>
                    <option value="moderate" {{ request('preference_filter') === 'moderate' ? 'selected' : '' }}>普通</option>
                    <option value="warm" {{ request('preference_filter') === 'warm' ? 'selected' : '' }}>暖かめ</option>
                    <option value="hot" {{ request('preference_filter') === 'hot' ? 'selected' : '' }}>暑がり</option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">ソート</label>
                <select name="sort" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="updated_at" {{ request('sort') === 'updated_at' ? 'selected' : '' }}>更新日時</option>
                    <option value="created_at" {{ request('sort') === 'created_at' ? 'selected' : '' }}>作成日時</option>
                    <option value="user_name" {{ request('sort') === 'user_name' ? 'selected' : '' }}>ユーザー名</option>
                </select>
            </div>

            <div class="flex items-end">
                <button type="submit" class="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                    🔍 検索
                </button>
            </div>
        </form>
    </div>

    <!-- ユーザーリスト -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
        @if($users->count() > 0)
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ユーザー情報
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                設定
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                活動状況
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                最終活動
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                アクション
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        @foreach($users as $user)
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div class="text-sm font-medium text-gray-900">{{ $user->user_name }}</div>
                                        <div class="text-sm text-gray-500">ID: {{ $user->user_id }}</div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="space-y-1">
                                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            温度: {{ $user->temperature_preference }}
                                        </span>
                                        <br>
                                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                            活動: {{ $user->activity_preference }}
                                        </span>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-900">
                                        チャット: {{ $user->chatHistory->count() }}回
                                    </div>
                                    <div class="text-sm text-gray-500">
                                        スタイル: {{ $user->style_preference }}
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    @if($user->chatHistory->first())
                                        {{ $user->chatHistory->first()->created_at->format('Y/m/d H:i') }}
                                    @else
                                        活動なし
                                    @endif
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <a href="{{ route('users.show', $user->id) }}" 
                                       class="text-blue-600 hover:text-blue-900">詳細</a>
                                    <a href="{{ route('users.edit', $user->id) }}" 
                                       class="text-indigo-600 hover:text-indigo-900">編集</a>
                                    <form method="POST" action="{{ route('users.destroy', $user->id) }}" 
                                          class="inline" onsubmit="return confirm('本当に削除しますか？')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="text-red-600 hover:text-red-900">削除</button>
                                    </form>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>

            <!-- ページネーション -->
            <div class="px-6 py-4 border-t border-gray-200">
                {{ $users->appends(request()->query())->links() }}
            </div>
        @else
            <div class="text-center py-12">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1h-4"></path>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">ユーザーが見つかりません</h3>
                <p class="mt-1 text-sm text-gray-500">検索条件を変更してください。</p>
            </div>
        @endif
    </div>
</div>
@endsection