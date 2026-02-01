<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SimpleMascotController;
use App\Http\Controllers\MissionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// テスト用ルート
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

// シンプルなマスコット関連API（既存データベース使用）
Route::prefix('mascot')->group(function () {
    Route::get('/name', [SimpleMascotController::class, 'getMascotName']);
    Route::get('/basic', [SimpleMascotController::class, 'getBasicInfo']);
    Route::get('/status', [SimpleMascotController::class, 'getMascotStatus']);
    Route::post('/feed', [SimpleMascotController::class, 'feedMascot']);
    Route::post('/play', [SimpleMascotController::class, 'playWithMascot']);
    Route::post('/pet', [SimpleMascotController::class, 'petMascot']);
    Route::post('/update-name', [SimpleMascotController::class, 'updateMascotName']);
});

// ミッション関連API
Route::prefix('missions')->group(function () {
    Route::get('/today', [MissionController::class, 'getTodayMissions']);
    Route::post('/progress', [MissionController::class, 'updateMissionProgress']);
});

// 認証関連API
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');
    Route::post('/verify-token', [AuthController::class, 'verifyToken']);
});

// 外部API用（Node.jsサーバーからのリクエスト）
Route::prefix('external')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'externalRegister']);
    Route::post('/auth/login', [AuthController::class, 'externalLogin']);
    Route::post('/auth/verify', [AuthController::class, 'externalVerify']);
});