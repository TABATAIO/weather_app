<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- 最近のユーザー -->
    <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
            <i class="fas fa-user-plus text-blue-600 mr-2"></i>
            最近の新規ユーザー
        </h3>
        <div class="space-y-3">
            @forelse($recentUsers as $user)
            <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-user text-blue-600 text-sm"></i>
                    </div>
                    <div>
                        <p class="font-medium text-gray-900">{{ $user->user_name ?? 'ユーザー' . $user->user_id }}</p>
                        <p class="text-sm text-gray-500">{{ $user->created_at->format('Y/m/d H:i') }}</p>
                    </div>
                </div>
                <span class="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                    新規
                </span>
            </div>
            @empty
            <p class="text-gray-500 text-center py-4">まだユーザーがいません</p>
            @endforelse
        </div>
    </div>

    <!-- 最近のチャット -->
    <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
            <i class="fas fa-comment text-green-600 mr-2"></i>
            最近のチャット
        </h3>
        <div class="space-y-3">
            @forelse($recentChats as $chat)
            <div class="py-2 border-b border-gray-100 last:border-b-0">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <p class="font-medium text-gray-900 text-sm">
                            {{ $chat->userProfile->user_name ?? 'ユーザー' . $chat->user_id }}
                        </p>
                        <p class="text-sm text-gray-600 mt-1">
                            {{ Str::limit($chat->user_message, 50) }}
                        </p>
                        <p class="text-xs text-gray-500 mt-1">
                            {{ $chat->created_at->format('H:i') }}
                        </p>
                    </div>
                    <span class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full ml-2">
                        {{ $chat->intent ?? '一般' }}
                    </span>
                </div>
            </div>
            @empty
            <p class="text-gray-500 text-center py-4">まだチャットがありません</p>
            @endforelse
        </div>
    </div>
</div>