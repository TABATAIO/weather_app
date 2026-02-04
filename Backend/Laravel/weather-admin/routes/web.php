<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\FourthFormEvolutionController;
use Illuminate\Support\Facades\Route;

// ダッシュボードをホームページに設定
Route::get('/', [AdminController::class, 'dashboard'])->name('home');

// 管理者ルート
Route::prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/user-profiles', [AdminController::class, 'userProfiles'])->name('admin.user-profiles');
    Route::get('/chat-analytics', [AdminController::class, 'chatAnalytics'])->name('admin.chat-analytics');
    //マスコット設定ルート
    Route::get('/mascot/settings', [AdminController::class, 'mascotSettings'])->name('admin.mascot.settings');
    Route::put('/mascot/update', [AdminController::class, 'updateMascot'])->name('admin.mascot.update');
    
    // 第四形態進化管理ルート
    Route::resource('fourth-form-evolutions', FourthFormEvolutionController::class, [
        'names' => [
            'index' => 'admin.fourth-form-evolutions.index',
            'create' => 'admin.fourth-form-evolutions.create',
            'store' => 'admin.fourth-form-evolutions.store',
            'show' => 'admin.fourth-form-evolutions.show',
            'edit' => 'admin.fourth-form-evolutions.edit',
            'update' => 'admin.fourth-form-evolutions.update',
            'destroy' => 'admin.fourth-form-evolutions.destroy'
        ]
    ]);
});

// ユーザー管理ルート
Route::get('/users/export', [UserManagementController::class, 'export'])->name('users.export');
Route::resource('users', UserManagementController::class);
