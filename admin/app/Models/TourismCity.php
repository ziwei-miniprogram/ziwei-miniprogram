<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * 文旅城市运营配置：折扣力度 / 限定优先购窗口 / GPS 围栏半径 / 打卡进度。
 */
class TourismCity extends Model
{
    protected $fillable = [
        'city_key', 'name', 'discount_rate', 'priority_enabled', 'priority_hours',
        'gps_radius', 'checkin_count', 'limited_sku_id', 'reward_note',
    ];

    protected $casts = [
        'discount_rate' => 'decimal:2',
        'priority_enabled' => 'boolean',
        'priority_hours' => 'integer',
        'gps_radius' => 'integer',
        'checkin_count' => 'integer',
        'limited_sku_id' => 'integer',
    ];

    /** 折扣人类可读：0.90 → "9 折" */
    public function discountLabel(): string
    {
        return (int) round($this->discount_rate * 100) . ' 折';
    }
}
