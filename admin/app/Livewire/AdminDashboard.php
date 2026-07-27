<?php

namespace App\Livewire;

use App\Services\MeritService;
use App\Services\ReviewService;
use Livewire\Component;

/**
 * 后台总览仪表盘（P0 简化版）：待审数、功德流水快照、异常预警。
 */
class AdminDashboard extends Component
{
    public function render()
    {
        $pending = app(ReviewService::class)->queue('pending', 1)->total();
        $anomalies = app(MeritService::class)->anomalies();
        $levels = app(MeritService::class)->levelDistribution();

        return view('livewire.admin-dashboard', [
            'pendingCount' => $pending,
            'anomalyCount' => $anomalies->count(),
            'levels' => $levels,
        ])->layout('layouts.app');
    }
}
