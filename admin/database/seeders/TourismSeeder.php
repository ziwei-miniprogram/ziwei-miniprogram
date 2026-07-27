<?php

namespace Database\Seeders;

use App\Models\TourismCity;
use Illuminate\Database\Seeder;

/**
 * 文旅 6 城运营配置：折扣力度 / 限定优先购 / GPS 围栏 / 打卡进度。
 * 对齐小程序 utils/checkin.js 的 CITIES。
 */
class TourismSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            ['city_key' => 'hangzhou', 'name' => '杭州', 'discount_rate' => 0.90, 'priority_enabled' => true, 'priority_hours' => 24, 'gps_radius' => 1500, 'checkin_count' => 1240, 'reward_note' => '集满 6 城解锁全国守护礼·大漆星图杯'],
            ['city_key' => 'chengdu', 'name' => '成都', 'discount_rate' => 0.90, 'priority_enabled' => true, 'priority_hours' => 24, 'gps_radius' => 1500, 'checkin_count' => 860, 'reward_note' => ''],
            ['city_key' => 'dali', 'name' => '大理', 'discount_rate' => 0.88, 'priority_enabled' => true, 'priority_hours' => 48, 'gps_radius' => 2000, 'checkin_count' => 540, 'reward_note' => ''],
            ['city_key' => 'dunhuang', 'name' => '敦煌', 'discount_rate' => 0.92, 'priority_enabled' => true, 'priority_hours' => 24, 'gps_radius' => 1500, 'checkin_count' => 320, 'reward_note' => ''],
            ['city_key' => 'putuoshan', 'name' => '普陀山', 'discount_rate' => 0.90, 'priority_enabled' => false, 'priority_hours' => 24, 'gps_radius' => 1200, 'checkin_count' => 410, 'reward_note' => ''],
            ['city_key' => 'suzhou', 'name' => '苏州', 'discount_rate' => 0.90, 'priority_enabled' => true, 'priority_hours' => 24, 'gps_radius' => 1500, 'checkin_count' => 980, 'reward_note' => ''],
        ];

        foreach ($rows as $r) {
            TourismCity::create($r);
        }
    }
}
