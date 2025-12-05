<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Weather Mascot Admin')</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        /* 基本的なスタイル */
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
    </style>
</head>
<body class="bg-gray-100 font-sans">
    <!-- Navigation -->
    <nav class="bg-blue-600 text-white shadow-lg">
        <div class="container mx-auto px-6 py-3">
            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-4">
                    <h1 class="text-xl font-bold">🌤️ Weather Mascot Admin</h1>
                </div>
                <div class="flex space-x-4">
                    <a href="{{ route('admin.dashboard') }}" 
                       class="px-3 py-2 rounded {{ request()->routeIs('admin.dashboard') ? 'bg-blue-800' : 'hover:bg-blue-700' }}">
                        ダッシュボード
                    </a>
                    <a href="{{ route('users.index') }}" 
                       class="px-3 py-2 rounded {{ request()->routeIs('users.*') ? 'bg-blue-800' : 'hover:bg-blue-700' }}">
                        ユーザー管理
                    </a>
                    <a href="{{ route('admin.chat-analytics') }}" 
                       class="px-3 py-2 rounded {{ request()->routeIs('admin.chat-analytics') ? 'bg-blue-800' : 'hover:bg-blue-700' }}">
                        チャット分析
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="container mx-auto px-6 py-8">
        @if(session('success'))
            <div class="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                {{ session('success') }}
            </div>
        @endif

        @if(session('error'))
            <div class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {{ session('error') }}
            </div>
        @endif

        @yield('content')
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white text-center py-4 mt-12">
        <p>&copy; {{ date('Y') }} Weather Mascot Admin System. All rights reserved.</p>
    </footer>

    @stack('scripts')
</body>
</html>