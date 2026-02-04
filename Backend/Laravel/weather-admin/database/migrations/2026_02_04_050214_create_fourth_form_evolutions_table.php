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
        Schema::create('fourth_form_evolutions', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // 第四形態の名前
            $table->string('image_path')->nullable(); // 画像パス
            $table->enum('evolution_from', ['active', 'calm']); // 進化元（活発・穏やか）
            $table->enum('evolution_condition_type', ['level', 'special_item', 'weather_condition', 'time_condition', 'friendship']); // 進化条件の種類
            $table->string('evolution_condition_value')->nullable(); // 進化条件の値
            $table->text('description')->nullable(); // 説明
            $table->boolean('is_active')->default(true); // 有効/無効
            $table->integer('sort_order')->default(0); // 表示順序
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fourth_form_evolutions');
    }
};
