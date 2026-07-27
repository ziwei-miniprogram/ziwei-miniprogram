<?php

use App\Livewire\AdminDashboard;
use App\Livewire\ReviewQueue;
use App\Livewire\MeritLedger;
use App\Livewire\AuditLog;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| 后台 Web 路由（Livewire + FluxUI）
|--------------------------------------------------------------------------
| 所有后台页需登录。审核/功德账本/审计为 P0；RBAC 通过 'role' 中间件控制。
*/

Route::middleware(['auth'])->group(function () {
    Route::get('/admin', AdminDashboard::class)->name('admin.dashboard');
    Route::get('/admin/review', ReviewQueue::class)->name('admin.review');
    Route::get('/admin/merit', MeritLedger::class)->name('admin.merit');
    Route::get('/admin/audit', AuditLog::class)->name('admin.audit');
});

// 小程序 API 入口（P2 真实 API 对接时启用；Sanctum token 鉴权）
Route::middleware(['auth:sanctum'])->prefix('api')->group(function () {
    // 例：Route::get('/merit/ledger', [MeritApiController::class, 'index']);
});

Route::get('/', fn () => redirect()->route('admin.dashboard'));
