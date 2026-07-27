<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * 运营指标日快照（数据看板趋势源）。
 */
class DailyMetric extends Model
{
    protected $fillable = ['date', 'metric', 'value'];

    protected $casts = [
        'date' => 'date',
        'value' => 'integer',
    ];

    public const METRICS = ['checkins', 'tourism_checkins', 'merit_issued', 'ugc_posts'];
}
