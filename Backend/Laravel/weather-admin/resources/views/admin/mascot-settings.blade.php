@extends('layouts.admin')

@section('title', 'マスコット基本設定 - 天気アプリ管理者ダッシュボード')

@section('content')
<div class="max-w-4xl mx-auto">
    <!-- ページヘッダー -->
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
            <i class="fas fa-robot text-blue-600 mr-3"></i>
            マスコット基本設定
        </h1>
        <p class="text-gray-600">
            天気アプリのマスコットキャラクターの基本情報を管理します。第一・第二進化までの共通設定を行えます。
        </p>
    </div>

    <!-- フラッシュメッセージ -->
    @if (session('success'))
        <div class="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
            <i class="fas fa-check-circle text-green-600 mr-3"></i>
            <div>
                <strong>成功：</strong> {{ session('success') }}
            </div>
        </div>
    @endif

    @if (session('error'))
        <div class="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center">
            <i class="fas fa-exclamation-circle text-red-600 mr-3"></i>
            <div>
                <strong>エラー：</strong> {{ session('error') }}
            </div>
        </div>
    @endif

    <form action="{{ route('admin.mascot.update') }}" method="POST" enctype="multipart/form-data" class="space-y-8">
        @csrf
        @method('PUT')

        <!-- キャラクター基本情報 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <i class="fas fa-id-card text-blue-600 mr-2"></i>
                キャラクター基本情報
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- 初期形態名前 -->
                <div>
                    <label for="initial_name" class="block text-sm font-medium text-gray-700 mb-2">
                        初期形態名前
                    </label>
                    <input type="text" 
                           id="initial_name" 
                           name="initial_name" 
                           value="{{ old('initial_name', $mascot->initial_name ?? 'ウェザーちゃん') }}"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           placeholder="例: ウェザーちゃん">
                    @error('initial_name')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <!-- キャラクター種族/タイプ -->
                <div>
                    <label for="character_species" class="block text-sm font-medium text-gray-700 mb-2">
                        キャラクター種族
                    </label>
                    <select id="character_species" 
                            name="character_species" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="cloud_spirit" {{ old('character_species', $mascot->character_species ?? '') == 'cloud_spirit' ? 'selected' : '' }}>
                            ☁️ 雲の精霊
                        </option>
                        <option value="weather_fairy" {{ old('character_species', $mascot->character_species ?? '') == 'weather_fairy' ? 'selected' : '' }}>
                            🧚‍♀️ 天気の妖精
                        </option>
                        <option value="storm_guardian" {{ old('character_species', $mascot->character_species ?? '') == 'storm_guardian' ? 'selected' : '' }}>
                            ⛈️ 嵐の守護者
                        </option>
                        <option value="sky_dragon" {{ old('character_species', $mascot->character_species ?? '') == 'sky_dragon' ? 'selected' : '' }}>
                            🐉 空の竜
                        </option>
                    </select>
                </div>
            </div>

            <!-- キャラクター説明 -->
            <div class="mt-6">
                <label for="character_description" class="block text-sm font-medium text-gray-700 mb-2">
                    キャラクター説明
                </label>
                <textarea id="character_description" 
                          name="character_description" 
                          rows="3"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="キャラクターの背景や特徴を入力してください...">{{ old('character_description', $mascot->character_description ?? '') }}</textarea>
                @error('character_description')
                    <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                @enderror
            </div>
        </div>

        <!-- 進化ルート設定（第一・第二・第三進化） -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <i class="fas fa-arrow-up text-purple-600 mr-2"></i>
                進化ルート設定（共通・分岐）
            </h2>
            
            <!-- 進化ステージ表示 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- 第一形態（初期） -->
                <div class="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <div class="mb-4 flex justify-center">
                        <img src="{{ asset('images/character01.png') }}" 
                             alt="第一形態" 
                             class="w-20 h-20 object-contain rounded-lg bg-white p-2 shadow-sm"
                             id="character1-image">
                    </div>
                    <h3 class="font-semibold text-gray-900">第一形態（初期）</h3>
                    <p class="text-sm text-gray-600 mt-1" id="stage1-name">ウェザーちゃん</p>
                    <div class="mt-2">
                        <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            レベル 1-10
                        </span>
                    </div>
                </div>

                <!-- 第二形態 -->
                <div class="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <div class="mb-4 flex justify-center">
                        <img src="{{ asset('images/character02.png') }}" 
                             alt="第二形態" 
                             class="w-20 h-20 object-contain rounded-lg bg-white p-2 shadow-sm"
                             id="character2-image">
                    </div>
                    <h3 class="font-semibold text-gray-900">第二形態</h3>
                    <div class="mt-2">
                        <input type="text" 
                               id="second_form_name" 
                               name="second_form_name" 
                               value="{{ old('second_form_name', $mascot->second_form_name ?? '') }}"
                               class="w-full text-center px-2 py-1 border border-gray-300 rounded text-sm"
                               placeholder="第二形態の名前">
                    </div>
                    <div class="mt-2">
                        <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs" id="stage2-level">
                            レベル 11-25
                        </span>
                    </div>
                    @error('second_form_name')
                        <p class="mt-1 text-xs text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <!-- 第三形態以降（分岐有り） -->
                <div class="text-center p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                    <div class="mb-4 flex justify-center">
                        <div class="w-20 h-20 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                            🌟
                        </div>
                    </div>
                    <h3 class="font-semibold text-gray-900">第三形態（分岐）</h3>
                    <p class="text-sm text-gray-600 mt-1">性格によって2つのルートに分岐</p>
                    <div class="mt-2">
                        <span class="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                            レベル 26以上
                        </span>
                    </div>
                </div>
            </div>

            <!-- 第三形態分岐設定 -->
            <div class="mt-8">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <i class="fas fa-code-branch text-purple-600 mr-2"></i>
                    第三形態分岐設定（性格分岐）
                </h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- 進化タイプ１（活発・エネルギッシュ） -->
                    <div class="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 border-2 border-orange-200">
                        <div class="flex items-center mb-4">
                            <div class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                01
                            </div>
                            <h4 class="text-lg font-semibold text-gray-900">活発タイプ</h4>
                        </div>
                        
                        <div class="space-y-4">
                            <!-- 第三形態名前（活発） -->
                            <div>
                                <label for="third_form_active_name" class="block text-sm font-medium text-gray-700 mb-2">
                                    活発系第三形態名
                                </label>
                                <input type="text" 
                                       id="third_form_active_name" 
                                       name="third_form_active_name" 
                                       value="{{ old('third_form_active_name', $mascot->third_form_active_name ?? '') }}"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                       placeholder="例: サンダーウェザー">
                                @error('third_form_active_name')
                                    <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                                @enderror
                            </div>
                            
                            <!-- プレビュー画像エリア -->
                            <div class="text-center">
                                <div class="mb-2">
                                    <img src="{{ asset('images/character03_active.jpg') }}" 
                                         alt="活発系第三形態" 
                                         class="w-16 h-16 object-contain mx-auto rounded-lg bg-white p-2 shadow-sm"
                                         id="character3-active-image">
                                </div>
                                <p class="text-xs text-gray-600">エネルギッシュな性格</p>
                            </div>
                        </div>
                    </div>

                    <!-- 進化タイプ２（穏やか・平和的） -->
                    <div class="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-6 border-2 border-blue-200">
                        <div class="flex items-center mb-4">
                            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                02
                            </div>
                            <h4 class="text-lg font-semibold text-gray-900">穏やかタイプ</h4>
                        </div>
                        
                        <div class="space-y-4">
                            <!-- 第三形態名前（穏やか） -->
                            <div>
                                <label for="third_form_calm_name" class="block text-sm font-medium text-gray-700 mb-2">
                                    穏やか系第三形態名
                                </label>
                                <input type="text" 
                                       id="third_form_calm_name" 
                                       name="third_form_calm_name" 
                                       value="{{ old('third_form_calm_name', $mascot->third_form_calm_name ?? '') }}"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                       placeholder="例: セレニティウェザー">
                                @error('third_form_calm_name')
                                    <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                                @enderror
                            </div>
                            
                            <!-- プレビュー画像エリア -->
                            <div class="text-center">
                                <div class="mb-2">
                                    <img src="{{ asset('images/character03_calm.jpg') }}" 
                                         alt="穏やか系第三形態" 
                                         class="w-16 h-16 object-contain mx-auto rounded-lg bg-white p-2 shadow-sm"
                                         id="character3-calm-image">
                                </div>
                                <p class="text-xs text-gray-600">平和的な性格</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 進化条件設定 -->
            <div class="mt-8">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <i class="fas fa-sliders-h text-blue-600 mr-2"></i>
                    進化条件設定
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="evolution_level_1_to_2" class="block text-sm font-medium text-gray-700 mb-2">
                            第一→第二進化レベル
                        </label>
                        <input type="number" 
                               id="evolution_level_1_to_2" 
                               name="evolution_level_1_to_2" 
                               value="{{ old('evolution_level_1_to_2', $mascot->evolution_level_1_to_2 ?? 11) }}"
                               min="2" 
                               max="50"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        @error('evolution_level_1_to_2')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>
                    <!-- 第二→第三進化レベル -->
                    <div>
                        <label for="evolution_level_2_to_3" class="block text-sm font-medium text-gray-700 mb-2">
                            第二→第三進化レベル
                        </label>
                        <input type="number" 
                               id="evolution_level_2_to_3" 
                               name="evolution_level_2_to_3" 
                               value="{{ old('evolution_level_2_to_3', $mascot->evolution_level_2_to_3 ?? 25) }}"
                               min="15" 
                               max="100"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        @error('evolution_level_2_to_3')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>
                    <!-- 性格判断しきい値(%) -->
                    <div>
                        <label for="personality_threshold" class="block text-sm font-medium text-gray-700 mb-2">
                            性格判断しきい値(%)
                        </label>
                        <input type="number"
                               id="personality_threshold"
                               name="personality_threshold"
                               value="{{ old('personality_threshold', $mascot->personality_threshold ?? 60) }}"
                               min="50"
                               max="90"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <p class="text-xs text-gray-500 mt-1">60以上で活発、未満で穏やか</p>
                        @error('personality_threshold')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>
                    <!-- 第三形態最大レベル -->
                    <div>
                        <label for="max_level_third_form" class="block text-sm font-medium text-gray-700 mb-2">
                            第三形態最大レベル
                        </label>
                        <input type="number" 
                               id="max_level_third_form" 
                               name="max_level_third_form" 
                               value="{{ old('max_level_third_form', $mascot->max_level_third_form ?? 50) }}"
                               min="30" 
                               max="100"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                        @error('max_level_third_form')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>
                </div>
            </div>
        </div>

        <!-- 第四形態設定 -->
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-sm border border-purple-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <i class="fas fa-crown text-purple-600 mr-2"></i>
                第四形態設定（最終進化）
            </h2>
            <p class="text-sm text-gray-600 mb-6">
                最終進化形態の設定です。究極型と伝説型の2つの分岐を設定できます。
            </p>

            <div class="space-y-6">
                <!-- 第四形態基本設定 -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- 究極型名前 -->
                    <div>
                        <label for="fourth_form_ultimate_name" class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-star text-yellow-500 mr-1"></i>
                            究極型形態名
                        </label>
                        <input type="text" 
                               id="fourth_form_ultimate_name" 
                               name="fourth_form_ultimate_name" 
                               value="{{ old('fourth_form_ultimate_name', $mascot->fourth_form_ultimate_name ?? '') }}"
                               class="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                               placeholder="例: アルティメットウェザーマスター">
                        @error('fourth_form_ultimate_name')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- 伝説型名前 -->
                    <div>
                        <label for="fourth_form_legendary_name" class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-gem text-purple-500 mr-1"></i>
                            伝説型形態名
                        </label>
                        <input type="text" 
                               id="fourth_form_legendary_name" 
                               name="fourth_form_legendary_name" 
                               value="{{ old('fourth_form_legendary_name', $mascot->fourth_form_legendary_name ?? '') }}"
                               class="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                               placeholder="例: レジェンダリーウェザーゴッド">
                        @error('fourth_form_legendary_name')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>
                </div>

                <!-- 進化条件設定 -->
                <div class="bg-white rounded-lg border border-purple-200 p-4">
                    <h3 class="font-semibold text-gray-900 mb-4">
                        <i class="fas fa-chart-line text-purple-600 mr-2"></i>
                        第四形態進化条件
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <!-- 第四形態へのレベル -->
                        <div>
                            <label for="evolution_level_3_to_4" class="block text-sm font-medium text-gray-700 mb-2">
                                進化必要レベル
                            </label>
                            <input type="number" 
                                   id="evolution_level_3_to_4" 
                                   name="evolution_level_3_to_4" 
                                   value="{{ old('evolution_level_3_to_4', $mascot->evolution_level_3_to_4 ?? 50) }}"
                                   min="30" 
                                   max="80"
                                   class="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            @error('evolution_level_3_to_4')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- 第四形態最大レベル -->
                        <div>
                            <label for="max_level_fourth_form" class="block text-sm font-medium text-gray-700 mb-2">
                                最大レベル
                            </label>
                            <input type="number" 
                                   id="max_level_fourth_form" 
                                   name="max_level_fourth_form" 
                                   value="{{ old('max_level_fourth_form', $mascot->max_level_fourth_form ?? 100) }}"
                                   min="60" 
                                   max="200"
                                   class="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            @error('max_level_fourth_form')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- 究極進化しきい値 -->
                        <div>
                            <label for="ultimate_evolution_threshold" class="block text-sm font-medium text-gray-700 mb-2">
                                究極進化しきい値
                            </label>
                            <input type="number" 
                                   id="ultimate_evolution_threshold" 
                                   name="ultimate_evolution_threshold" 
                                   value="{{ old('ultimate_evolution_threshold', $mascot->ultimate_evolution_threshold ?? 80) }}"
                                   min="70" 
                                   max="95"
                                   class="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            <p class="text-xs text-gray-500 mt-1">80以上で究極型、未満で伝説型</p>
                            @error('ultimate_evolution_threshold')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>

                    <!-- 特別アイテム設定 -->
                    <div class="mt-4 p-4 bg-purple-50 rounded-lg">
                        <div class="flex items-center mb-2">
                            <input type="checkbox" 
                                   id="requires_special_item" 
                                   name="requires_special_item" 
                                   value="1"
                                   {{ old('requires_special_item', $mascot->requires_special_item ?? false) ? 'checked' : '' }}
                                   class="mr-2 text-purple-600">
                            <label for="requires_special_item" class="text-sm font-medium text-gray-700">
                                特別アイテム必須
                            </label>
                        </div>
                        
                        <div id="special_item_container" class="mt-2" style="display: {{ old('requires_special_item', $mascot->requires_special_item ?? false) ? 'block' : 'none' }};">
                            <input type="text" 
                                   id="special_item_name" 
                                   name="special_item_name" 
                                   value="{{ old('special_item_name', $mascot->special_item_name ?? '') }}"
                                   placeholder="例: ミスティックエナジー、クリスタルコア"
                                   class="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                        </div>
                    </div>
                </div>

                <!-- 第四形態画像アップロード -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- 究極型画像 -->
                    <div class="bg-white rounded-lg border border-yellow-200 p-4">
                        <h4 class="font-medium text-gray-900 mb-3 flex items-center">
                            <i class="fas fa-star text-yellow-500 mr-2"></i>
                            究極型形態画像
                        </h4>
                        
                        @if(!empty($mascot->ultimate_form_image))
                            <div class="mb-3">
                                <img src="{{ asset('storage/' . $mascot->ultimate_form_image) }}" 
                                     alt="現在の究極型画像"
                                     class="w-20 h-20 object-cover rounded-lg border">
                                <p class="text-xs text-gray-500 mt-1">現在の画像</p>
                            </div>
                        @endif
                        
                        <input type="file" 
                               id="ultimate_form_image" 
                               name="ultimate_form_image" 
                               accept="image/*"
                               class="w-full px-3 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
                        <p class="text-xs text-gray-500 mt-1">推奨: PNG, JPG (500x500px以下)</p>
                        @error('ultimate_form_image')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- 伝説型画像 -->
                    <div class="bg-white rounded-lg border border-purple-200 p-4">
                        <h4 class="font-medium text-gray-900 mb-3 flex items-center">
                            <i class="fas fa-gem text-purple-500 mr-2"></i>
                            伝説型形態画像
                        </h4>
                        
                        @if(!empty($mascot->legendary_form_image))
                            <div class="mb-3">
                                <img src="{{ asset('storage/' . $mascot->legendary_form_image) }}" 
                                     alt="現在の伝説型画像"
                                     class="w-20 h-20 object-cover rounded-lg border">
                                <p class="text-xs text-gray-500 mt-1">現在の画像</p>
                            </div>
                        @endif
                        
                        <input type="file" 
                               id="legendary_form_image" 
                               name="legendary_form_image" 
                               accept="image/*"
                               class="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                        <p class="text-xs text-gray-500 mt-1">推奨: PNG, JPG (500x500px以下)</p>
                        @error('legendary_form_image')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>
                </div>

                <!-- 第四形態特別能力 -->
                <div class="bg-white rounded-lg border border-purple-200 p-4">
                    <h4 class="font-medium text-gray-900 mb-3 flex items-center">
                        <i class="fas fa-magic text-purple-600 mr-2"></i>
                        特別能力設定
                    </h4>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- 特別能力説明 -->
                        <div>
                            <label for="fourth_form_special_abilities" class="block text-sm font-medium text-gray-700 mb-2">
                                特別能力説明
                            </label>
                            <textarea id="fourth_form_special_abilities" 
                                      name="fourth_form_special_abilities" 
                                      rows="3"
                                      class="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                      placeholder="第四形態の特別な能力や特徴を説明してください...">{{ old('fourth_form_special_abilities', $mascot->fourth_form_special_abilities ?? '') }}</textarea>
                            @error('fourth_form_special_abilities')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- 天気制御力 -->
                        <div>
                            <label for="weather_control_power" class="block text-sm font-medium text-gray-700 mb-2">
                                天気制御力 (0-100)
                            </label>
                            <input type="number" 
                                   id="weather_control_power" 
                                   name="weather_control_power" 
                                   value="{{ old('weather_control_power', $mascot->weather_control_power ?? 0) }}"
                                   min="0" 
                                   max="100"
                                   class="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            <p class="text-xs text-gray-500 mt-1">0: 通常, 50: 強力, 100: 全天候制御</p>
                            @error('weather_control_power')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 外見・表示設定 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <i class="fas fa-image text-orange-600 mr-2"></i>
                表示設定
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- 画像表示設定 -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">画像表示サイズ</label>
                    <select id="image_size" 
                            name="image_size" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="small" {{ old('image_size', $mascot->image_size ?? 'medium') == 'small' ? 'selected' : '' }}>
                            小サイズ (64x64px)
                        </option>
                        <option value="medium" {{ old('image_size', $mascot->image_size ?? 'medium') == 'medium' ? 'selected' : '' }}>
                            中サイズ (128x128px)
                        </option>
                        <option value="large" {{ old('image_size', $mascot->image_size ?? 'medium') == 'large' ? 'selected' : '' }}>
                            大サイズ (256x256px)
                        </option>
                    </select>
                </div>

                <!-- アニメーション設定 -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">アニメーション効果</label>
                    <div class="space-y-2">
                        <label class="flex items-center">
                            <input type="checkbox" 
                                   name="enable_animation" 
                                   value="1" 
                                   {{ old('enable_animation', $mascot->enable_animation ?? true) ? 'checked' : '' }}
                                   class="mr-2 text-blue-600">
                            <span class="text-sm">ホバー時のアニメーション</span>
                        </label>
                        <label class="flex items-center">
                            <input type="checkbox" 
                                   name="enable_bounce" 
                                   value="1" 
                                   {{ old('enable_bounce', $mascot->enable_bounce ?? false) ? 'checked' : '' }}
                                   class="mr-2 text-blue-600">
                            <span class="text-sm">進化時のバウンス効果</span>
                        </label>
                    </div>
                </div>
            </div>

            <!-- カラーフィルター -->
            <div class="mt-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">カラーフィルター（オプション）</label>
                <div class="grid grid-cols-2 md:grid-cols-5 gap-2">
                    @foreach(['none' => 'なし', 'warm' => '暖色', 'cool' => '寒色', 'sepia' => 'セピア', 'grayscale' => 'モノクロ'] as $filter => $label)
                    <label class="flex items-center p-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                        <input type="radio" 
                               name="color_filter" 
                               value="{{ $filter }}" 
                               {{ old('color_filter', $mascot->color_filter ?? 'none') == $filter ? 'checked' : '' }}
                               class="mr-2 text-blue-600">
                        <span class="text-sm">{{ $label }}</span>
                    </label>
                    @endforeach
                </div>
            </div>
        </div>

        <!-- 画像アップロード設定 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <i class="fas fa-upload text-green-600 mr-2"></i>
                カスタム画像アップロード（オプション）
            </h2>
            <p class="text-sm text-gray-600 mb-6">各形態のカスタム画像をアップロードできます。アップロードしない場合はデフォルト画像が使用されます。</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- 第一形態画像 -->
                <div>
                    <label for="first_form_image" class="block text-sm font-medium text-gray-700 mb-2">
                        第一形態画像
                    </label>
                    <input type="file" 
                           id="first_form_image" 
                           name="first_form_image" 
                           accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <p class="text-xs text-gray-500 mt-1">形式: JPEG, PNG, GIF, WebP / 最大: 5MB</p>
                    @error('first_form_image')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <!-- 第二形態画像 -->
                <div>
                    <label for="second_form_image" class="block text-sm font-medium text-gray-700 mb-2">
                        第二形態画像
                    </label>
                    <input type="file" 
                           id="second_form_image" 
                           name="second_form_image" 
                           accept="image/jpeg,image/png,image/jpg,image/gif"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <p class="text-xs text-gray-500 mt-1">形式: JPEG, PNG, GIF</p>
                    @error('second_form_image')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <!-- 第三形態（活発）画像 -->
                <div>
                    <label for="third_form_active_image" class="block text-sm font-medium text-gray-700 mb-2">
                        第三形態（活発タイプ）画像
                    </label>
                    <input type="file" 
                           id="third_form_active_image" 
                           name="third_form_active_image" 
                           accept="image/jpeg,image/png,image/jpg,image/gif"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <p class="text-xs text-gray-500 mt-1">形式: JPEG, PNG, GIF</p>
                    @error('third_form_active_image')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <!-- 第三形態（穏やか）画像 -->
                <div>
                    <label for="third_form_calm_image" class="block text-sm font-medium text-gray-700 mb-2">
                        第三形態（穏やかタイプ）画像
                    </label>
                    <input type="file" 
                           id="third_form_calm_image" 
                           name="third_form_calm_image" 
                           accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <p class="text-xs text-gray-500 mt-1">形式: JPEG, PNG, GIF, WebP / 最大: 5MB</p>
                    @error('third_form_calm_image')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <!-- 第四形態（究極）画像 -->
                <div>
                    <label for="ultimate_form_image" class="block text-sm font-medium text-gray-700 mb-2">
                        🦄 第四形態（究極）画像
                    </label>
                    <input type="file" 
                           id="ultimate_form_image" 
                           name="ultimate_form_image" 
                           accept="image/jpeg,image/png,image/jpg,image/gif"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <p class="text-xs text-gray-500 mt-1">形式: JPEG, PNG, GIF</p>
                    @error('ultimate_form_image')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <!-- 第四形態（伝説）画像 -->
                <div>
                    <label for="legendary_form_image" class="block text-sm font-medium text-gray-700 mb-2">
                        🌟 第四形態（伝説）画像
                    </label>
                    <input type="file" 
                           id="legendary_form_image" 
                           name="legendary_form_image" 
                           accept="image/jpeg,image/png,image/jpg,image/gif"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
                    <p class="text-xs text-gray-500 mt-1">形式: JPEG, PNG, GIF</p>
                    @error('legendary_form_image')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>
            </div>
        </div>

        <!-- プレビューエリア -->
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <i class="fas fa-eye text-blue-600 mr-2"></i>
                キャラクター進化プレビュー
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- 第一形態プレビュー -->
                <div class="bg-white rounded-lg p-6 shadow-sm">
                    <div class="text-center mb-4">
                        <div class="mb-3">
                            <img src="{{ asset('images/character01.png') }}" 
                                 alt="第一形態プレビュー" 
                                 class="w-24 h-24 object-contain mx-auto rounded-lg bg-gray-50 p-2 shadow-sm transition-transform hover:scale-105"
                                 id="preview-image1">
                        </div>
                        <h4 class="font-medium text-gray-900 text-lg" id="preview-name1">ウェザーちゃん</h4>
                        <p class="text-sm text-gray-600">第一形態（レベル 1-10）</p>
                        <div class="mt-2">
                            <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                初期形態
                            </span>
                        </div>
                    </div>
                </div>

                <!-- 第二形態プレビュー -->
                <div class="bg-white rounded-lg p-6 shadow-sm">
                    <div class="text-center mb-4">
                        <div class="mb-3">
                            <img src="{{ asset('images/character02.png') }}" 
                                 alt="第二形態プレビュー" 
                                 class="w-24 h-24 object-contain mx-auto rounded-lg bg-gray-50 p-2 shadow-sm transition-transform hover:scale-105"
                                 id="preview-image2">
                        </div>
                        <h4 class="font-medium text-gray-900 text-lg" id="preview-name2">未設定</h4>
                        <p class="text-sm text-gray-600" id="preview-level2">第二形態（レベル 11-25）</p>
                        <div class="mt-2">
                            <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                進化形態
                            </span>
                        </div>
                    </div>
                </div>

                <!-- 第三形態（活発）プレビュー -->
                <div class="bg-white rounded-lg p-6 shadow-sm">
                    <div class="text-center mb-4">
                        <div class="mb-3">
                            <img src="{{ asset('images/character03_active.jpg') }}" 
                                 alt="第三形態（活発）プレビュー" 
                                 class="w-24 h-24 object-contain mx-auto rounded-lg bg-gray-50 p-2 shadow-sm transition-transform hover:scale-105"
                                 id="preview-image3-active">
                        </div>
                        <h4 class="font-medium text-gray-900 text-lg" id="preview-name3-active">未設定</h4>
                        <p class="text-sm text-gray-600">第三形態（活発系）</p>
                        <div class="mt-2">
                            <span class="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                                活発タイプ
                            </span>
                        </div>
                    </div>
                </div>

                <!-- 第三形態（穏やか）プレビュー -->
                <div class="bg-white rounded-lg p-6 shadow-sm">
                    <div class="text-center mb-4">
                        <div class="mb-3">
                            <img src="{{ asset('images/character03_calm.jpg') }}" 
                                 alt="第三形態（穏やか）プレビュー" 
                                 class="w-24 h-24 object-contain mx-auto rounded-lg bg-gray-50 p-2 shadow-sm transition-transform hover:scale-105"
                                 id="preview-image3-calm">
                        </div>
                        <h4 class="font-medium text-gray-900 text-lg" id="preview-name3-calm">未設定</h4>
                        <p class="text-sm text-gray-600">第三形態（穏やか系）</p>
                        <div class="mt-2">
                            <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                穏やかタイプ
                            </span>
                        </div>
                    </div>
                </div>

                <!-- 第四形態（究極）プレビュー -->
                <div class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 shadow-sm border-2 border-yellow-200">
                    <div class="text-center mb-4">
                        <div class="mb-3">
                            @if($mascot && $mascot->ultimate_form_image)
                                <img src="{{ asset('storage/' . $mascot->ultimate_form_image) }}" 
                                     alt="第四形態（究極）プレビュー" 
                                     class="w-24 h-24 object-contain mx-auto rounded-lg bg-gradient-to-br from-yellow-100 to-orange-100 p-2 shadow-sm transition-transform hover:scale-105"
                                     id="preview-image4-ultimate">
                            @else
                                <div class="w-24 h-24 mx-auto rounded-lg bg-gradient-to-br from-yellow-100 to-orange-100 p-2 shadow-sm border-2 border-dashed border-yellow-300 flex items-center justify-center">
                                    <div class="text-center">
                                        <i class="fas fa-image text-yellow-400 text-2xl mb-1"></i>
                                        <p class="text-xs text-yellow-600 font-medium">画像なし</p>
                                    </div>
                                </div>
                            @endif
                        </div>
                        <h4 class="font-medium text-gray-900 text-lg" id="preview-name4-ultimate">
                            {{ $mascot && $mascot->ultimate_form_name ? $mascot->ultimate_form_name : '未設定' }}
                        </h4>
                        <p class="text-sm text-gray-600">第四形態（究極系）</p>
                        <div class="mt-2">
                            <span class="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-xs font-medium shadow-sm">
                                <i class="fas fa-star mr-1"></i>究極型
                            </span>
                        </div>
                    </div>
                </div>

                <!-- 第四形態（伝説）プレビュー -->
                <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 shadow-sm border-2 border-purple-200">
                    <div class="text-center mb-4">
                        <div class="mb-3">
                            @if($mascot && $mascot->legendary_form_image)
                                <img src="{{ asset('storage/' . $mascot->legendary_form_image) }}" 
                                     alt="第四形態（伝説）プレビュー" 
                                     class="w-24 h-24 object-contain mx-auto rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 p-2 shadow-sm transition-transform hover:scale-105"
                                     id="preview-image4-legendary">
                            @else
                                <div class="w-24 h-24 mx-auto rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 p-2 shadow-sm border-2 border-dashed border-purple-300 flex items-center justify-center">
                                    <div class="text-center">
                                        <i class="fas fa-image text-purple-400 text-2xl mb-1"></i>
                                        <p class="text-xs text-purple-600 font-medium">画像なし</p>
                                    </div>
                                </div>
                            @endif
                        </div>
                        <h4 class="font-medium text-gray-900 text-lg" id="preview-name4-legendary">
                            {{ $mascot && $mascot->legendary_form_name ? $mascot->legendary_form_name : '未設定' }}
                        </h4>
                        <p class="text-sm text-gray-600">第四形態（伝説系）</p>
                        <div class="mt-2">
                            <span class="px-3 py-1 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full text-xs font-medium shadow-sm">
                                <i class="fas fa-gem mr-1"></i>伝説型
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 保存ボタン -->
        <div class="flex justify-end space-x-4">
            <button type="button" 
                    onclick="resetForm()" 
                    class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500">
                <i class="fas fa-undo mr-2"></i>リセット
            </button>
            <button type="submit" 
                    class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <i class="fas fa-save mr-2"></i>基本設定を保存
            </button>
        </div>
    </form>
</div>
@endsection

@push('scripts')
<script>
    // リアルタイムプレビュー更新
    function updatePreview() {
        // 第一形態
        const firstName = document.getElementById('initial_name').value || 'ウェザーちゃん';
        document.getElementById('preview-name1').textContent = firstName;
        document.getElementById('stage1-name').textContent = firstName;

        // 第二形態
        const secondName = document.getElementById('second_form_name').value || '未設定';
        const evolutionLevel = document.getElementById('evolution_level_1_to_2').value || '11';
        const thirdEvolutionLevel = document.getElementById('evolution_level_2_to_3').value || '25';
        const thirdEvoLevel = parseInt(thirdEvolutionLevel) || 25;
        
        document.getElementById('preview-name2').textContent = secondName;
        document.getElementById('preview-level2').textContent = `第二形態（レベル ${evolutionLevel}-${thirdEvoLevel - 1}）`;
        document.getElementById('stage2-level').textContent = `レベル ${evolutionLevel}-${thirdEvoLevel - 1}`;

        // 第三形態（活発）
        const thirdActiveName = document.getElementById('third_form_active_name').value || '未設定';
        document.getElementById('preview-name3-active').textContent = thirdActiveName;

        // 第三形態（穏やか）
        const thirdCalmName = document.getElementById('third_form_calm_name').value || '未設定';
        document.getElementById('preview-name3-calm').textContent = thirdCalmName;

        // 第四形態（究極）
        const fourthUltimateName = document.getElementById('fourth_form_ultimate_name').value || '未設定';
        if (document.getElementById('preview-name4-ultimate')) {
            document.getElementById('preview-name4-ultimate').textContent = fourthUltimateName;
        }

        // 第四形態（伝説）
        const fourthLegendaryName = document.getElementById('fourth_form_legendary_name').value || '未設定';
        if (document.getElementById('preview-name4-legendary')) {
            document.getElementById('preview-name4-legendary').textContent = fourthLegendaryName;
        }

        // 画像サイズ設定の反映
        const imageSize = document.getElementById('image_size').value;
        const sizeClasses = {
            'small': 'w-16 h-16',
            'medium': 'w-24 h-24', 
            'large': 'w-32 h-32'
        };
        
        document.querySelectorAll('#preview-image1, #preview-image2, #preview-image3-active, #preview-image3-calm, #preview-image4-ultimate, #preview-image4-legendary').forEach(img => {
            img.className = img.className.replace(/w-\d+\s+h-\d+/, sizeClasses[imageSize]);
        });

        // カラーフィルターの適用
        const colorFilter = document.querySelector('input[name="color_filter"]:checked')?.value || 'none';
        const filterClasses = {
            'none': '',
            'warm': 'sepia-[0.3] hue-rotate-[10deg]',
            'cool': 'sepia-[0.3] hue-rotate-[190deg]',
            'sepia': 'sepia-[0.8]',
            'grayscale': 'grayscale'
        };

        document.querySelectorAll('#preview-image1, #preview-image2, #preview-image3-active, #preview-image3-calm, #preview-image4-ultimate, #preview-image4-legendary').forEach(img => {
            // 既存のフィルタークラスを削除
            img.className = img.className.replace(/sepia-\[[\d.]+\]|hue-rotate-\[[\d]+deg\]|grayscale/g, '');
            if (filterClasses[colorFilter]) {
                img.className += ' ' + filterClasses[colorFilter];
            }
        });

        // アニメーション設定
        const enableAnimation = document.querySelector('input[name="enable_animation"]:checked');
        const enableBounce = document.querySelector('input[name="enable_bounce"]:checked');
        
        document.querySelectorAll('#preview-image1, #preview-image2, #preview-image3-active, #preview-image3-calm, #preview-image4-ultimate, #preview-image4-legendary').forEach(img => {
            if (enableAnimation) {
                img.classList.add('transition-transform', 'hover:scale-105');
            } else {
                img.classList.remove('transition-transform', 'hover:scale-105');
            }
            
            if (enableBounce) {
                img.classList.add('hover:animate-bounce');
            } else {
                img.classList.remove('hover:animate-bounce');
            }
        });
    }

    // フォームの各要素にイベントリスナーを追加
    document.addEventListener('DOMContentLoaded', function() {
        const inputs = [
            'initial_name', 'second_form_name', 
            'third_form_active_name', 'third_form_calm_name',
            'fourth_form_ultimate_name', 'fourth_form_legendary_name',
            'evolution_level_1_to_2', 'evolution_level_2_to_3', 'evolution_level_3_to_4',
            'image_size'
        ];
        
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', updatePreview);
            }
        });

        // チェックボックス・ラジオボタンのイベントリスナー
        document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
            input.addEventListener('change', updatePreview);
        });
        
        // 特別アイテム必須の切り替え
        const requiresSpecialItem = document.getElementById('requires_special_item');
        const specialItemContainer = document.getElementById('special_item_container');
        
        if (requiresSpecialItem && specialItemContainer) {
            requiresSpecialItem.addEventListener('change', function() {
                specialItemContainer.style.display = this.checked ? 'block' : 'none';
            });
        }
        
        updatePreview(); // 初期表示
    });

    // フォームリセット
    function resetForm() {
        if (confirm('設定を初期値に戻しますか？')) {
            document.querySelector('form').reset();
            updatePreview();
        }
    }
</script>
@endpush