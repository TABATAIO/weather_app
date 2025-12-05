<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Support\Facades\Route;

// ダッシュボードをホームページに設定
Route::get('/', [AdminController::class, 'dashboard'])->name('admin.dashboard');

// 管理者ルート
Route::prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/user-profiles', [AdminController::class, 'userProfiles'])->name('admin.user-profiles');
    Route::get('/chat-analytics', [AdminController::class, 'chatAnalytics'])->name('admin.chat-analytics');
});

// ユーザー管理ルート
Route::get('/users/export', [UserManagementController::class, 'export'])->name('users.export');
Route::resource('users', UserManagementController::class);
