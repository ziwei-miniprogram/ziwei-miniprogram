<?php

namespace Database\Seeders;

use App\Models\DailyMetric;
use Illuminate\Database\Seeder;

/**
 * 运营指标日快照（近 14 天），供数据看板 7 日趋势演示。
 */
class MetricSeeder extends Seeder
{
    public function run(): void
    {
        $metrics = DailyMetric::METRICS;
        $base = [
            'checkins' => 120,
            'tourism_checkins' => 40,
            'merit_issued' => 800,
            'ugc_posts' => 20,
        ];

        for ($i = 13; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $wobble = ($i % 3) * 8;        // 制造波动
            $growth = 14 - $i;             // 越近越高
            foreach ($metrics as $m) {
                $value = (int) (($base[$m] + $growth * 12) * (0.8 + $wobble / 200));
                DailyMetric::create([
                    'date' => $date,
                    'metric' => $m,
                    'value' => max(1, $value),
                ]);
            }
        }
    }
}
