<?php

namespace App\Services;

use App\Models\ReviewItem;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;

/**
 * 内容审核服务：队列查询 + 通过/驳回/加白。
 * 每次复审动作经 AuditService 留痕。
 */
class ReviewService
{
    public function __construct(private AuditService $audit) {}

    /**
     * @param  string  $filter  pending|approved|rejected|whitelisted|all
     */
    public function queue(string $filter = 'pending', int $perPage = 15): LengthAwarePaginator
    {
        $q = ReviewItem::query()->with('reviewer')->latest();

        return match ($filter) {
            'pending', 'approved', 'rejected', 'whitelisted' => $q->where('status', $filter)->paginate($perPage),
            default => $q->paginate($perPage),
        };
    }

    public function approve(int $id, ?int $actorId = null): void
    {
        $item = ReviewItem::findOrFail($id);
        $item->update([
            'status' => 'approved',
            'reviewed_by' => $actorId ?? Auth::id(),
            'reviewed_at' => now(),
        ]);
        $this->audit->log('review.approve', ReviewItem::class, $id, ['status' => 'approved']);
    }

    public function reject(int $id, ?string $note = null, ?int $actorId = null): void
    {
        $item = ReviewItem::findOrFail($id);
        $item->update([
            'status' => 'rejected',
            'review_note' => $note,
            'reviewed_by' => $actorId ?? Auth::id(),
            'reviewed_at' => now(),
        ]);
        $this->audit->log('review.reject', ReviewItem::class, $id, ['status' => 'rejected', 'note' => $note]);
    }

    public function whitelist(int $id, ?int $actorId = null): void
    {
        $item = ReviewItem::findOrFail($id);
        $item->update([
            'status' => 'whitelisted',
            'reviewed_by' => $actorId ?? Auth::id(),
            'reviewed_at' => now(),
        ]);
        $this->audit->log('review.whitelist', ReviewItem::class, $id, ['status' => 'whitelisted']);
    }
}
