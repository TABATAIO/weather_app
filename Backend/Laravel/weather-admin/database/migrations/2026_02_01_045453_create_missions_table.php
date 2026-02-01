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
        Schema::create('missions', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // ミッション名
            $table->string('description'); // ミッション説明
            $table->string('mission_type'); // ミッションタイプ
            $table->string('target_action'); // 対象アクション
            $table->json('target_params')->nullable(); // 対象パラメータ
            $table->integer('reward_exp')->default(0); // 報酬経験値
            $table->string('icon')->default('🎯'); // アイコン
            $table->boolean('is_active')->default(true); // アクティブフラグ
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('missions');
    }
};
