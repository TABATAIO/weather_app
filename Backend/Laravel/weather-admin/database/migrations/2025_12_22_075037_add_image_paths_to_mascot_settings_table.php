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
            $table->string('first_form_image')->nullable()->after('character_discription');
            $table->string('second_form_image')->nullable()->after('first_form_image');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mascot_settings', function (Blueprint $table) {
            $table->dropColumn(['first_form_image', 'second_form_image']);
        });
    }
};
