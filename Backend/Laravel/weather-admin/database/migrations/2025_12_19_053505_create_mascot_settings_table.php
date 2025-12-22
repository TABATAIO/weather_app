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
        Schema::create('mascot_settings', function (Blueprint $table) {
            $table->id();

            //キャラクター基本情報
            $table->string('initial_name',30)->default('ウェザーちゃん');
            $table->enum('character_species',['cloud_spirit','storm_guardian','weather_fairy','sky_dragon'])->default('cloud_spirit');
            $table->text('character_description')->nullable();

            //進化設定
            $table->string('second_form_name',50)->nullable();
            $table->integer('evolution_level_1_to_2')->default(11);
            $table->integer('max_level_second_form')->default(25);

            //表示設定
            $table->enum('image_size',['small','medium','large'])->default('medium');
            $table->boolean('enable_animation')->default(true);
            $table->boolean('enable_bounce')->default(false);
            $table->enum('color_filter',['none','warm','cool','sepia','grayscale'])->default('none');

            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mascot_settings');
    }
};
