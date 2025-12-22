<div class="text-center py-12">
    <div class="max-w-md mx-auto">
        <div class="admin-card">
            <div class="text-center">
                <i class="fas fa-lock text-4xl text-white/80 mb-4"></i>
                <h2 class="text-2xl font-bold mb-4">管理者ログインが必要です</h2>
                <p class="text-white/80 mb-6">
                    天気アプリの管理機能をご利用いただくには、管理者アカウントでのログインが必要です。
                </p>
                <div class="space-y-3">
                    <a href="{{ route('login') }}" class="block w-full bg-white/20 hover:bg-white/30 text-white py-3 px-6 rounded-lg transition-colors">
                        <i class="fas fa-sign-in-alt mr-2"></i>
                        管理者ログイン
                    </a>
                    @if (Route::has('register'))
                        <a href="{{ route('register') }}" class="block w-full bg-white/20 hover:bg-white/30 text-white py-3 px-6 rounded-lg transition-colors">
                            <i class="fas fa-user-plus mr-2"></i>
                            新規登録
                        </a>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>