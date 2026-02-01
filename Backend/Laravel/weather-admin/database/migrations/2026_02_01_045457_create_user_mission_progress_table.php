<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_mission_progress', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // ユーザーID
            $table->unsignedBigInteger('mission_id'); // ミッションID
            $table->date('assigned_date'); // 割り当て日
            $table->boolean('is_completed')->default(false); // 完了フラグ
            $table->timestamp('completed_at')->nullable(); // 完了時刻
            $table->integer('progress')->default(0); // 進捗
            $table->integer('target_count')->default(1); // 目標回数
            $table->timestamps();
            
            // インデックス
            $table->index(['user_id', 'assigned_date']);
            $table->unique(['user_id', 'mission_id', 'assigned_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_mission_progress');
    }
};
