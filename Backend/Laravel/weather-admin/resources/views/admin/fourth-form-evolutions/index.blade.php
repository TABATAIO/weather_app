@extends('layouts.admin')

@section('title', '第四形態進化管理')

@section('content')
<div class="container mx-auto px-4 py-8">
    <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold text-gray-800">第四形態進化管理</h1>
            <a href="{{ route('admin.fourth-form-evolutions.create') }}" 
               class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
                新しい第四形態を追加
            </a>
        </div>

        @if(session('success'))
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {{ session('success') }}
            </div>
        @endif

        @if(session('error'))
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {{ session('error') }}
            </div>
        @endif

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <!-- 活発形態からの進化 -->
            <div class="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
                <h2 class="text-xl font-semibold text-orange-800 mb-4">活発形態からの進化</h2>
                <div class="space-y-3">
                    @forelse($evolutions->where('evolution_from', 'active') as $evolution)
                        <div class="bg-white rounded-lg p-4 shadow-sm border">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-3">
                                    @if($evolution->image_path)
                                        <img src="{{ asset('storage/' . $evolution->image_path) }}" 
                                             alt="{{ $evolution->name }}" 
                                             class="w-12 h-12 rounded-lg object-cover">
                                    @else
                                        <div class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                            <span class="text-gray-500 text-xs">画像なし</span>
                                        </div>
                                    @endif
                                    <div>
                                        <h3 class="font-semibold text-gray-800">{{ $evolution->name }}</h3>
                                        <p class="text-sm text-gray-600">{{ $evolution->condition_display_text }}</p>
                                    </div>
                                </div>
                                <div class="flex space-x-2">
                                    <a href="{{ route('admin.fourth-form-evolutions.edit', $evolution) }}" 
                                       class="text-blue-600 hover:text-blue-800">
                                        編集
                                    </a>
                                    <form action="{{ route('admin.fourth-form-evolutions.destroy', $evolution) }}" 
                                          method="POST" 
                                          onsubmit="return confirm('本当に削除しますか？')"
                                          class="inline">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="text-red-600 hover:text-red-800">
                                            削除
                                        </button>
                                    </form>
                                </div>
                            </div>
                            @if($evolution->description)
                                <p class="mt-2 text-sm text-gray-700">{{ $evolution->description }}</p>
                            @endif
                        </div>
                    @empty
                        <p class="text-gray-500 text-center py-4">活発形態からの進化が登録されていません。</p>
                    @endforelse
                </div>
            </div>

            <!-- 穏やか形態からの進化 -->
            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <h2 class="text-xl font-semibold text-blue-800 mb-4">穏やか形態からの進化</h2>
                <div class="space-y-3">
                    @forelse($evolutions->where('evolution_from', 'calm') as $evolution)
                        <div class="bg-white rounded-lg p-4 shadow-sm border">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-3">
                                    @if($evolution->image_path)
                                        <img src="{{ asset('storage/' . $evolution->image_path) }}" 
                                             alt="{{ $evolution->name }}" 
                                             class="w-12 h-12 rounded-lg object-cover">
                                    @else
                                        <div class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                            <span class="text-gray-500 text-xs">画像なし</span>
                                        </div>
                                    @endif
                                    <div>
                                        <h3 class="font-semibold text-gray-800">{{ $evolution->name }}</h3>
                                        <p class="text-sm text-gray-600">{{ $evolution->condition_display_text }}</p>
                                    </div>
                                </div>
                                <div class="flex space-x-2">
                                    <a href="{{ route('admin.fourth-form-evolutions.edit', $evolution) }}" 
                                       class="text-blue-600 hover:text-blue-800">
                                        編集
                                    </a>
                                    <form action="{{ route('admin.fourth-form-evolutions.destroy', $evolution) }}" 
                                          method="POST" 
                                          onsubmit="return confirm('本当に削除しますか？')"
                                          class="inline">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="text-red-600 hover:text-red-800">
                                            削除
                                        </button>
                                    </form>
                                </div>
                            </div>
                            @if($evolution->description)
                                <p class="mt-2 text-sm text-gray-700">{{ $evolution->description }}</p>
                            @endif
                        </div>
                    @empty
                        <p class="text-gray-500 text-center py-4">穏やか形態からの進化が登録されていません。</p>
                    @endforelse
                </div>
            </div>
        </div>

        <div class="text-center">
            <a href="{{ route('admin.dashboard') }}" 
               class="text-blue-600 hover:text-blue-800 font-medium">
                ← 管理画面ダッシュボードに戻る
            </a>
        </div>
    </div>
</div>
@endsection