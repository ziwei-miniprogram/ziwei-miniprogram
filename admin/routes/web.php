<?php

use App\Http\Controllers\Auth\LoginController;
use App\Livewire\AdminDashboard;
use App\Livewire\ReviewQueue;
use App\Livewire\MeritLedger;
use App\Livewire\AuditLog;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| 后台 Web 路由（Livewire + 自定义 CSS，设计令牌与小程序同源）
|--------------------------------------------------------------------------
| 登录访客可访问；后台页需 auth；按模块叠加 RBAC（role 中间件别名）。
*/

// 登录 / 登出
Route::get('/login', [LoginController::class, 'show'])->name('login');
Route::post('/login', [LoginController::class, 'store']);
Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');

// 后台（需登录）
Route::middleware(['auth'])->group(function () {
    Route::get('/admin', AdminDashboard::class)->name('admin.dashboard');
    Route::get('/admin/review', ReviewQueue::class)->name('admin.review')
        ->middleware('role:reviewer,super');
    Route::get('/admin/merit', MeritLedger::class)->name('admin.merit')
        ->middleware('role:operator,super');
    Route::get('/admin/audit', AuditLog::class)->name('admin.audit')
        ->middleware('role:super');
});

// 小程序 API 入口（P2 真实 API 对接时启用；Sanctum token 鉴权）
Route::middleware(['auth:sanctum'])->prefix('api')->group(function () {
    // 例：Route::get('/merit/ledger', [MeritApiController::class, 'index']);
});

Route::get('/', fn () => redirect()->route('admin.dashboard'));
