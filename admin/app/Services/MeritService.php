<?php

namespace App\Services;

use App\Models\MeritTxn;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * 功德账本服务：全局流水、等级分布、异常预警。
 *
 * 合规红线：服务端强制「功德虚拟、不可提现/交易/购买」。
 * 任何 redeem 出口在此被拒绝（MERIT_REDEEMABLE=false）。
 */
class MeritService
{
    public function ledger(int $perPage = 20): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return MeritTxn::query()->latest()->paginate($perPage);
    }

    /** 各等级人数分布（善信→大德阶梯） */
    public function levelDistribution(): Collection
    {
        return DB::table('merit_txns')
            ->selectRaw('FLOOR(balance_after / 2000) as tier, COUNT(DISTINCT user_id) as users')
            ->groupBy('tier')
            ->orderBy('tier')
            ->get();
    }

    /** 异常：单用户短时功德暴涨（刷分预警） */
    public function anomalies(): Collection
    {
        return MeritTxn::query()
            ->where('delta', '>', 500)
            ->where('created_at', '>=', now()->subMinutes(1))
            ->with('user')
            ->get();
    }

    /**
     * 服务端余额调整（超管专用，合规留痕）。
     * 注意：不包含任何提现/兑换路径。
     */
    public function adjust(int $userId, int $delta, string $reason, int $actorId): void
    {
        if (! config('app.merit_redeemable', false) && $delta < 0) {
            // 仅允许正向补偿，禁止任何负向兑换
            throw new \DomainException('功德不可兑换/提现');
        }

        $balance = (int) MeritTxn::where('user_id', $userId)->latest()->value('balance_after') ?? 0;
        MeritTxn::create([
            'user_id' => $userId,
            'delta' => $delta,
            'reason' => $reason,
            'balance_after' => $balance + $delta,
            'source' => 'admin',
        ]);

        app(AuditService::class)->log('merit.adjust', \App\Models\User::class, $userId, [
            'delta' => $delta, 'reason' => $reason, 'actor' => $actorId,
        ]);
    }
}
