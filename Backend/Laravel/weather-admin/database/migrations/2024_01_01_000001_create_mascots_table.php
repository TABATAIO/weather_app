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
        Schema::create('mascots', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->default(1);
            $table->string('name')->default('からめる');
            $table->integer('level')->default(1);
            $table->integer('experience')->default(0);
            $table->integer('health')->default(100);
            $table->integer('happiness')->default(50);
            $table->integer('energy')->default(50);
            $table->timestamp('last_fed_at')->nullable();
            $table->timestamp('last_played_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id']);
        });

        Schema::create('user_missions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->integer('mission_id');
            $table->date('date');
            $table->integer('progress')->default(0);
            $table->boolean('completed')->default(false);
            $table->timestamps();
            
            $table->unique(['user_id', 'mission_id', 'date']);
            $table->index(['user_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_missions');
        Schema::dropIfExists('mascots');
    }
};