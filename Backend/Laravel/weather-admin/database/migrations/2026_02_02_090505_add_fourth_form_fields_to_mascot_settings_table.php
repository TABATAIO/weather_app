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
        Schema::table('mascot_settings', function (Blueprint $table) {
            // 第四形態の名前設定
            $table->string('fourth_form_ultimate_name')->nullable()->after('third_form_calm_image');
            $table->string('fourth_form_legendary_name')->nullable()->after('fourth_form_ultimate_name');

            // 第四形態への進化設定
            $table->integer('evolution_level_3_to_4')->default(50)->after('max_level_third_form');
            $table->integer('max_level_fourth_form')->default(100)->after('evolution_level_3_to_4');

            // 第四形態の特別条件
            $table->integer('ultimate_evolution_threshold')->default(80)->after('personality_threshold');
            $table->boolean('requires_special_item')->default(false)->after('ultimate_evolution_threshold');
            $table->string('special_item_name')->nullable()->after('requires_special_item');

            // 第四形態の画像
            $table->string('fourth_form_ultimate_image')->nullable()->after('third_form_calm_image');
            $table->string('fourth_form_legendary_image')->nullable()->after('fourth_form_ultimate_image');

            // 第四形態の特別能力
            $table->text('fourth_form_special_abilities')->nullable()->after('fourth_form_legendary_image');
            $table->integer('weather_control_power')->default(0)->after('fourth_form_special_abilities');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mascot_settings', function (Blueprint $table) {
            $table->dropColumn([
                'fourth_form_ultimate_name',
                'fourth_form_legendary_name',
                'evolution_level_3_to_4',
                'max_level_fourth_form',
                'ultimate_evolution_threshold',
                'requires_special_item',
                'special_item_name',
                'fourth_form_ultimate_image',
                'fourth_form_legendary_image',
                'fourth_form_special_abilities',
                'weather_control_power',
            ]);
        });
    }
};