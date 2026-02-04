@extends('layouts.admin')

@section('title', 'ユーザー編集 - Weather Mascot Admin')

@section('content')
<div class="mb-8">
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="text-3xl font-bold text-gray-800">✏️ ユーザー編集</h1>
            <p class="text-gray-600">{{ $user->name }} ({{ $user->id }})</p>
        </div>
        <div class="space-x-2">
            <a href="{{ route('users.show', $user->id) }}" 
               class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
                ← 戻る
            </a>
        </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
        <form method="POST" action="{{ route('users.update', $user->id) }}">
            @csrf
            @method('PUT')
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- ユーザー名 -->
                <div>
                    <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                        ユーザー名 <span class="text-red-500">*</span>
                    </label>
                    <input type="text" 
                           id="name" 
                           name="name" 
                           value="{{ old('name', $user->name) }}"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 @error('name') border-red-500 @enderror">
                    @error('name')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <!-- メールアドレス -->
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                        メールアドレス <span class="text-red-500">*</span>
                    </label>
                    <input type="email" 
                           id="email" 
                           name="email" 
                           value="{{ old('email', $user->email) }}"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 @error('email') border-red-500 @enderror">
                    @error('email')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>
            </div>

            <!-- 読み取り専用フィールド -->
            <div class="mt-6 pt-6 border-t border-gray-200">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">📋 システム情報（変更不可）</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">ユーザーID</label>
                        <p class="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{{ $user->id }}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">登録日</label>
                        <p class="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{{ $user->created_at->format('Y年m月d日 H:i') }}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">最終更新</label>
                        <p class="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{{ $user->updated_at->format('Y年m月d日 H:i') }}</p>
                    </div>
                </div>
            </div>

            <!-- ボタン -->
            <div class="mt-8 flex justify-end space-x-4">
                <a href="{{ route('users.show', $user->id) }}" 
                   class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    キャンセル
                </a>
                <button type="submit" 
                        class="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    💾 変更を保存
                </button>
            </div>
        </form>

        <!-- 削除ボタン -->
        <div class="mt-8 pt-6 border-t border-gray-200">
            <div class="flex justify-between items-center">
                <div>
                    <h3 class="text-lg font-semibold text-red-800">⚠️ 危険な操作</h3>
                    <p class="text-sm text-gray-600">この操作は元に戻すことができません。</p>
                </div>
                <form method="POST" action="{{ route('users.destroy', $user->id) }}" 
                      onsubmit="return confirm('本当にこのユーザーを削除しますか？\\n\\n関連するチャット履歴もすべて削除されます。\\nこの操作は元に戻すことができません。')">
                    @csrf
                    @method('DELETE')
                    <button type="submit" 
                            class="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                        🗑️ ユーザーを削除
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection