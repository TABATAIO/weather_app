<header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex justify-between items-center h-16">
            <div class="flex items-center">
                <h1 class="text-2xl font-bold text-gray-900">
                    <i class="fas fa-cloud-sun text-blue-600 mr-3"></i>
                    天気アプリ管理者ダッシュボード
                </h1>
            </div>
            
            <nav class="flex items-center space-x-4">
                @if (Route::has('login'))
                    @auth
                        <a href="{{ route('admin.dashboard') }}" class="nav-item {{ request()->routeIs('admin.dashboard') ? 'active' : '' }}">
                            <i class="fas fa-chart-bar mr-2"></i>ダッシュボード
                        </a>
                        <a href="{{ route('admin.users') }}" class="nav-item {{ request()->routeIs('admin.users*') ? 'active' : '' }}">
                            <i class="fas fa-users mr-2"></i>ユーザー管理
                        </a>
                        <a href="{{ route('admin.chat-analytics') }}" class="nav-item {{ request()->routeIs('admin.chat-analytics') ? 'active' : '' }}">
                            <i class="fas fa-comments mr-2"></i>チャット分析
                        </a>
                        <a href="{{ route('admin.mascot.setting') }}" class="nav-item {{ request()->routeIs('admin.mascot*') ? 'active' : '' }}">
                            <i class="fas fa-paw mr-2"></i>マスコット設定
                        </a>
                        <a href="{{ route('admin.api-settings') }}" class="nav-item {{ request()->routeIs('admin.api-settings') ? 'active' : '' }}">
                            <i class="fas fa-cog mr-2"></i>設定
                        </a>
                        <form method="POST" action="{{ route('logout') }}" class="inline">
                            @csrf
                            <button type="submit" class="nav-item">
                                <i class="fas fa-sign-out-alt mr-2"></i>ログアウト
                            </button>
                        </form>
                    @else
                        <a href="{{ route('login') }}" class="nav-item">
                            <i class="fas fa-sign-in-alt mr-2"></i>ログイン
                        </a>
                        @if (Route::has('register'))
                            <a href="{{ route('register') }}" class="nav-item">
                                <i class="fas fa-user-plus mr-2"></i>登録
                            </a>
                        @endif
                    @endauth
                @endif
            </nav>
        </div>
    </div>
</header>