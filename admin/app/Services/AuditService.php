<?php

namespace App\Services;

use App\Models\AuditEntry;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Support\Facades\Auth;

/**
 * 审计服务：所有后台写操作统一留痕。
 * meta 存放结构化前后值，满足合规「谁、何时、改了什么」。
 */
class AuditService
{
    /**
     * @param  array<string, mixed>  $meta
     */
    public function log(string $action, string $targetType, int|string $targetId, array $meta = []): AuditEntry
    {
        /** @var Authenticatable|null $actor */
        $actor = Auth::user();

        return AuditEntry::create([
            'actor_id' => $actor?->getAuthIdentifier(),
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => (string) $targetId,
            'meta' => $meta,
        ]);
    }

    public function recent(int $perPage = 20): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return AuditEntry::query()->with('actor')->latest()->paginate($perPage);
    }
}
