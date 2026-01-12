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
            $table->string('third_form_active_name')->nullable()->after('second_form_name');
            $table->string('third_form_calm_name')->nullable()->after('third_form_active_name');

            $table->integer('evolution_level_2_to_3')->default(25)->after('evolution_level_1_to_2');
            $table->integer('max_level_third_form')->default(50)->after('max_level_second_form');

            $table->integer('personality_threshold')->default(60)->after('max_level_third_form');

            $table->string('third_form_active_image')->nullable()->after('second_form_image');
            $table->string('third_form_calm_image')->nullable()->after('third_form_active_image');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mascot_settings', function (Blueprint $table) {
            $table->dropColumn([
                'third_form_active_name',
                'third_form_calm_name',
                'evolution_level_2_to_3',
                'max_level_third_form',
                'personality_threshold',
                'third_form_active_image',
                'third_form_calm_image',
            ]);
        });
    }
};
