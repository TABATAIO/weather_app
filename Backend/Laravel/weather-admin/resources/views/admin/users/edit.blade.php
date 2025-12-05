@extends('layouts.admin')

@section('title', 'ユーザー編集 - Weather Mascot Admin')

@section('content')
<div class="mb-8">
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="text-3xl font-bold text-gray-800">✏️ ユーザー編集</h1>
            <p class="text-gray-600">{{ $user->user_name }} ({{ $user->user_id }})</p>
        </div>
        <div class="space-x-2">
            <a href="{{ route('users.show', $user->user_id) }}" 
               class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
                ← 戻る
            </a>
        </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
        <form method="POST" action="{{ route('users.update', $user->user_id) }}">
            @csrf
            @method('PUT')
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- ユーザー名 -->
                <div>
                    <label for="user_name" class="block text-sm font-medium text-gray-700 mb-2">
                        ユーザー名 <span class="text-red-500">*</span>
                    </label>
                    <input type="text" 
                           id="user_name" 
                           name="user_name" 
                           value="{{ old('user_name', $user->user_name) }}"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 @error('user_name') border-red-500 @enderror">
                    @error('user_name')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <!-- 温度設定 -->
                <div>
                    <label for="temperature_preference" class="block text-sm font-medium text-gray-700 mb-2">
                        温度設定
                    </label>
                    <select id="temperature_preference" 
                            name="temperature_preference"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 @error('temperature_preference') border-red-500 @enderror">
                        <option value="cold" {{ old('temperature_preference', $user->temperature_preference) === 'cold' ? 'selected' : '' }}>寒がり</option>
                        <option value="cool" {{ old('temperature_preference', $user->temperature_preference) === 'cool' ? 'selected' : '' }}>涼しめ</option>
                        <option value="moderate" {{ old('temperature_preference', $user->temperature_preference) === 'moderate' ? 'selected' : '' }}>普通</option>
                        <option value="warm" {{ old('temperature_preference', $user->temperature_preference) === 'warm' ? 'selected' : '' }}>暖かめ</option>
                        <option value="hot" {{ old('temperature_preference', $user->temperature_preference) === 'hot' ? 'selected' : '' }}>暑がり</option>
                    </select>
                    @error('temperature_preference')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <!-- 活動設定 -->
                <div>
                    <label for="activity_preference" class="block text-sm font-medium text-gray-700 mb-2">
                        活動設定
                    </label>
                    <select id="activity_preference" 
                            name="activity_preference"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 @error('activity_preference') border-red-500 @enderror">
                        <option value="indoor" {{ old('activity_preference', $user->activity_preference) === 'indoor' ? 'selected' : '' }}>屋内派</option>
                        <option value="outdoor" {{ old('activity_preference', $user->activity_preference) === 'outdoor' ? 'selected' : '' }}>屋外派</option>
                        <option value="both" {{ old('activity_preference', $user->activity_preference) === 'both' ? 'selected' : '' }}>どちらも</option>
                    </select>
                    @error('activity_preference')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <!-- スタイル設定 -->
                <div>
                    <label for="style_preference" class="block text-sm font-medium text-gray-700 mb-2">
                        スタイル設定
                    </label>
                    <select id="style_preference" 
                            name="style_preference"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 @error('style_preference') border-red-500 @enderror">
                        <option value="casual" {{ old('style_preference', $user->style_preference) === 'casual' ? 'selected' : '' }}>カジュアル</option>
                        <option value="polite" {{ old('style_preference', $user->style_preference) === 'polite' ? 'selected' : '' }}>丁寧</option>
                        <option value="friendly" {{ old('style_preference', $user->style_preference) === 'friendly' ? 'selected' : '' }}>フレンドリー</option>
                    </select>
                    @error('style_preference')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <!-- 天気感度 -->
                <div>
                    <label for="weather_sensitivity" class="block text-sm font-medium text-gray-700 mb-2">
                        天気感度
                    </label>
                    <select id="weather_sensitivity" 
                            name="weather_sensitivity"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 @error('weather_sensitivity') border-red-500 @enderror">
                        <option value="low" {{ old('weather_sensitivity', $user->weather_sensitivity) === 'low' ? 'selected' : '' }}>低</option>
                        <option value="normal" {{ old('weather_sensitivity', $user->weather_sensitivity) === 'normal' ? 'selected' : '' }}>普通</option>
                        <option value="high" {{ old('weather_sensitivity', $user->weather_sensitivity) === 'high' ? 'selected' : '' }}>高</option>
                    </select>
                    @error('weather_sensitivity')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <!-- 好きな活動 -->
                <div class="md:col-span-2">
                    <label for="favorite_activities" class="block text-sm font-medium text-gray-700 mb-2">
                        好きな活動
                    </label>
                    <textarea id="favorite_activities" 
                              name="favorite_activities" 
                              rows="3"
                              placeholder="好きな活動や趣味を入力してください"
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 @error('favorite_activities') border-red-500 @enderror">{{ old('favorite_activities', $user->favorite_activities) }}</textarea>
                    @error('favorite_activities')
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
                        <p class="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{{ $user->user_id }}</p>
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
                <a href="{{ route('users.show', $user->user_id) }}" 
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
                <form method="POST" action="{{ route('users.destroy', $user->user_id) }}" 
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