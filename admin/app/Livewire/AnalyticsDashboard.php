<?php

namespace App\Livewire;

use App\Services\DashboardService;
use Livewire\Component;

/**
 * 数据看板：KPI 汇总 + 近 7 日趋势（CSS 条形图）+ 文旅打卡进度。
 * 全员可见（auth 即可，不叠加 role 中间件）。
 */
class AnalyticsDashboard extends Component
{
    public function render()
    {
        $svc = app(DashboardService::class);
        $trend = $svc->trend(7);
        $maxMap = collect($trend)->map(
            fn (array $b) => max(1, ...array_column($b['series'], 'value'))
        )->all();

        return view('livewire.analytics-dashboard', [
            'kpis' => $svc->kpis(),
            'trend' => $trend,
            'maxMap' => $maxMap,
            'labels' => [
                'checkins' => '签到数',
                'tourism_checkins' => '文旅打卡',
                'merit_issued' => '功德发放',
                'ugc_posts' => 'UGC 发布',
            ],
            'cities' => $svc->cityProgress(),
        ])->layout('layouts.app');
    }
}
