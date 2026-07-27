<?php

namespace App\Services;

use App\Models\TourismCity;
use Illuminate\Database\Eloquent\Collection;

/**
 * 文旅运营服务：城市配置查询与保存、全国守护进度。
 */
class TourismService
{
    public function __construct(private AuditService $audit) {}

    public function cities(): Collection
    {
        return TourismCity::query()->orderBy('id')->get();
    }

    public function find(int $id): TourismCity
    {
        return TourismCity::findOrFail($id);
    }

    public function save(int $id, array $data, ?int $actorId = null): TourismCity
    {
        $c = TourismCity::findOrFail($id);
        $c->update($data);
        $this->audit->log('tourism.city.update', TourismCity::class, $id, [
            'discount_rate' => $c->discount_rate,
            'priority_enabled' => $c->priority_enabled,
            'actor' => $actorId ?? auth()->id(),
        ]);

        return $c;
    }

    /** 全国守护进度（集满 6 城解锁全国守护礼） */
    public function progress(): array
    {
        $cities = TourismCity::all();
        $total = $cities->count();
        $lit = $cities->where('checkin_count', '>', 0)->count();

        return [
            'total' => $total,
            'lit' => $lit,
            'pct' => $total ? round($lit / $total * 100) : 0,
        ];
    }
}
