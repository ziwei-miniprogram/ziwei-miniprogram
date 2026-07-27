<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * 功德流水（全局账本）：每一次增减均留痕，便于异常监测与对账。
 * delta 可正可负；balance_after 为当时余额快照。
 *
 * 合规红线：服务端强制「功德虚拟、不可提现/交易/购买」，
 * 任何 redeem 类操作在此层必须被拒绝（见 MeritService）。
 */
class MeritTxn extends Model
{
    protected $fillable = [
        'user_id',
        'delta',
        'reason',         // addMerit / spendMerit / checkin / dailyDeed ...
        'balance_after',
        'source',         // miniprogram | admin | system
    ];

    protected $casts = [
        'delta' => 'integer',
        'balance_after' => 'integer',
        'created_at' => 'immutable_datetime',
    ];

    public function scopeAnomaly($query)
    {
        // 异常：单用户 1 分钟内功德暴涨（刷分预警）
        return $query->where('delta', '>', 500)
            ->where('created_at', '>=', now()->subMinutes(1));
    }
}
