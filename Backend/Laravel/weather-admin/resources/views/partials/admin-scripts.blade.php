<script>
    // 管理画面共通のJavaScript機能

    // 機能関数
    function showAddUserModal() {
        alert('新規ユーザー追加機能は開発中です。');
    }

    function showSentimentReport() {
        alert('感情分析レポート機能は開発中です。');
    }

    function showSearchHistory() {
        alert('検索履歴表示機能は開発中です。');
    }

    // カードのホバー効果
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('.admin-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    });

    // リアルタイムでデータを更新（5分ごと）
    setInterval(function() {
        location.reload();
    }, 300000); // 5分 = 300000ms

    // ダークモード切り替え（簡易版）
    function toggleDarkMode() {
        document.documentElement.classList.toggle('dark');
    }
</script>