@extends('layouts.admin')

@section('title', '第四形態進化追加')

@section('content')
<div class="container mx-auto px-4 py-8">
    <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold text-gray-800">第四形態進化追加</h1>
            <a href="{{ route('admin.fourth-form-evolutions.index') }}" 
               class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
                一覧に戻る
            </a>
        </div>

        @if(session('error'))
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {{ session('error') }}
            </div>
        @endif

        <form action="{{ route('admin.fourth-form-evolutions.store') }}" method="POST" enctype="multipart/form-data" class="space-y-6">
            @csrf

            <!-- 基本情報 -->
            <div class="bg-gray-50 p-4 rounded-lg">
                <h2 class="text-lg font-semibold text-gray-800 mb-4">基本情報</h2>
                
                <!-- 名前 -->
                <div class="mb-4">
                    <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                        第四形態の名前 <span class="text-red-500">*</span>
                    </label>
                    <input type="text" 
                           id="name" 
                           name="name" 
                           value="{{ old('name') }}"
                           required
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                           placeholder="例: ストームマスター">
                    @error('name')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <!-- 画像アップロード -->
                <div class="mb-4">
                    <label for="image" class="block text-sm font-medium text-gray-700 mb-2">
                        画像
                    </label>
                    <input type="file" 
                           id="image" 
                           name="image" 
                           accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <p class="text-xs text-gray-500 mt-1">形式: JPEG, PNG, GIF, WebP</p>
                    @error('image')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <!-- 説明 -->
                <div class="mb-4">
                    <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                        説明
                    </label>
                    <textarea id="description" 
                              name="description" 
                              rows="3"
                              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="この第四形態の特徴や能力を説明してください...">{{ old('description') }}</textarea>
                    @error('description')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>
            </div>

            <!-- 進化設定 -->
            <div class="bg-blue-50 p-4 rounded-lg">
                <h2 class="text-lg font-semibold text-gray-800 mb-4">進化設定</h2>
                
                <!-- 進化元 -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        進化元 <span class="text-red-500">*</span>
                    </label>
                    <div class="space-y-2">
                        <label class="flex items-center">
                            <input type="radio" 
                                   name="evolution_from" 
                                   value="active" 
                                   {{ old('evolution_from') === 'active' ? 'checked' : '' }}
                                   required
                                   class="form-radio text-orange-500 focus:ring-orange-500">
                            <span class="ml-2 text-orange-700 font-medium">活発形態から進化</span>
                        </label>
                        <label class="flex items-center">
                            <input type="radio" 
                                   name="evolution_from" 
                                   value="calm" 
                                   {{ old('evolution_from') === 'calm' ? 'checked' : '' }}
                                   required
                                   class="form-radio text-blue-500 focus:ring-blue-500">
                            <span class="ml-2 text-blue-700 font-medium">穏やか形態から進化</span>
                        </label>
                    </div>
                    @error('evolution_from')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <!-- 進化条件の種類 -->
                <div class="mb-4">
                    <label for="evolution_condition_type" class="block text-sm font-medium text-gray-700 mb-2">
                        進化条件の種類 <span class="text-red-500">*</span>
                    </label>
                    <select id="evolution_condition_type" 
                            name="evolution_condition_type" 
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        <option value="">条件を選択してください</option>
                        <option value="level" {{ old('evolution_condition_type') === 'level' ? 'selected' : '' }}>レベル条件</option>
                        <option value="special_item" {{ old('evolution_condition_type') === 'special_item' ? 'selected' : '' }}>特別アイテム</option>
                        <option value="weather_condition" {{ old('evolution_condition_type') === 'weather_condition' ? 'selected' : '' }}>天気条件</option>
                        <option value="time_condition" {{ old('evolution_condition_type') === 'time_condition' ? 'selected' : '' }}>時間条件</option>
                        <option value="friendship" {{ old('evolution_condition_type') === 'friendship' ? 'selected' : '' }}>親密度条件</option>
                    </select>
                    @error('evolution_condition_type')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <!-- 進化条件の値 -->
                <div class="mb-4">
                    <label for="evolution_condition_value" class="block text-sm font-medium text-gray-700 mb-2">
                        進化条件の詳細 <span class="text-red-500">*</span>
                    </label>
                    <input type="text" 
                           id="evolution_condition_value" 
                           name="evolution_condition_value" 
                           value="{{ old('evolution_condition_value') }}"
                           required
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                           placeholder="例: 60、雷雨、夜、高親密度など">
                    <p class="text-xs text-gray-500 mt-1">
                        選択した条件の種類に応じて適切な値を入力してください<br>
                        レベル: 数値（例: 60）<br>
                        アイテム: アイテム名（例: 雷の石）<br>
                        天気: 天気の種類（例: 雷雨、晴れ）<br>
                        時間: 時間帯（例: 夜、朝）<br>
                        親密度: 親密度の値（例: 高、最大）
                    </p>
                    @error('evolution_condition_value')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>
            </div>

            <!-- その他の設定 -->
            <div class="bg-gray-50 p-4 rounded-lg">
                <h2 class="text-lg font-semibold text-gray-800 mb-4">その他の設定</h2>
                
                <!-- 表示順序 -->
                <div class="mb-4">
                    <label for="sort_order" class="block text-sm font-medium text-gray-700 mb-2">
                        表示順序
                    </label>
                    <input type="number" 
                           id="sort_order" 
                           name="sort_order" 
                           value="{{ old('sort_order', 0) }}"
                           min="0"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                           placeholder="0">
                    <p class="text-xs text-gray-500 mt-1">数値が小さいほど先に表示されます</p>
                    @error('sort_order')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <!-- 有効/無効 -->
                <div class="mb-4">
                    <label class="flex items-center">
                        <input type="checkbox" 
                               name="is_active" 
                               value="1"
                               {{ old('is_active', true) ? 'checked' : '' }}
                               class="form-checkbox text-green-500 focus:ring-green-500 rounded">
                        <span class="ml-2 text-gray-700">有効にする</span>
                    </label>
                    <p class="text-xs text-gray-500 mt-1">チェックを外すとこの進化が無効になります</p>
                    @error('is_active')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>
            </div>

            <!-- ボタン -->
            <div class="flex justify-end space-x-4 pt-6 border-t">
                <a href="{{ route('admin.fourth-form-evolutions.index') }}" 
                   class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-200">
                    キャンセル
                </a>
                <button type="submit" 
                        class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-200">
                    第四形態を追加
                </button>
            </div>
        </form>
    </div>
</div>
@endsection