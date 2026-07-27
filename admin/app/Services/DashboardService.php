<?php

namespace App\Services;

use App\Models\DailyMetric;
use App\Models\MeritTxn;
use App\Models\Product;
use App\Models\ReviewItem;
use App\Models\TourismCity;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

/**
 * 数据看板服务：KPI 汇总 + 近 N 日趋势 + 文旅打卡进度。
 * 趋势来自 daily_metrics 演示快照（支付/订单模块 P3 上线后接入真实转化漏斗）。
 */
class DashboardService
{
    public function kpis(): array
    {
        return [
            'users' => User::count(),
            'merit_total' => (int) MeritTxn::where('delta', '>', 0)->sum('delta'),
            'products_active' => Product::where('status', 'active')->count(),
            'products_total' => Product::count(),
            'limited' => Product::where('is_limited', true)->count(),
            'cities' => TourismCity::count(),
            'pending_reviews' => ReviewItem::where('status', 'pending')->count(),
        ];
    }

    /** 近 $days 日趋势（按 metric 分组），用于 CSS 条形图 */
    public function trend(int $days = 7): array
    {
        $since = now()->subDays($days - 1)->startOfDay();
        $rows = DailyMetric::where('date', '>=', $since)->get();

        $out = [];
        foreach (DailyMetric::METRICS as $m) {
            $series = [];
            for ($i = 0; $i < $days; $i++) {
                $d = $since->copy()->addDays($i);
                $val = (int) $rows->where('metric', $m)->where('date', $d->toDateString())->sum('value');
                $series[] = ['date' => $d->format('m-d'), 'value' => $val];
            }
            $out[$m] = [
                'total' => array_sum(array_column($series, 'value')),
                'series' => $series,
            ];
        }

        return $out;
    }

    public function cityProgress(): Collection
    {
        return TourismCity::orderBy('id')->get();
    }
}
