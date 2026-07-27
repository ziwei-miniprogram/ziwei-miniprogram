<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Auth;

/**
 * 商城商品服务：列表 / 增改 / 上下架 / 限定切换 / 删除。
 *
 * 合规红线：商品文案禁「改运/逆天/必应/医疗/付费算命」等，
 * 命中即拒绝写入并留痕（延续小程序电商合规）。
 */
class ProductService
{
    // 合规红线词（与小程序端上 censor 同源，服务端二次把关）
    private const FORBIDDEN = ['改运', '逆天', '必应', '医疗', '付费算命', '包治', '算命改运', '保佑发财'];

    public function __construct(private AuditService $audit) {}

    public function list(string $category = 'all', string $status = 'all', int $perPage = 12): LengthAwarePaginator
    {
        $q = Product::query()->latest();
        if ($category !== 'all') {
            $q->where('category', $category);
        }
        if ($status !== 'all') {
            $q->where('status', $status);
        }

        return $q->paginate($perPage);
    }

    public function find(int $id): Product
    {
        return Product::findOrFail($id);
    }

    /**
     * 保存（创建或更新）。命中合规红线抛出 DomainException。
     * @throws \DomainException
     * @throws QueryException  SKU 重复
     */
    public function save(array $data, ?int $id = null, ?int $actorId = null): Product
    {
        $this->assertCompliant($data['name'] ?? '', $data['description'] ?? '');

        if ($id) {
            $p = Product::findOrFail($id);
            $p->update($data);
            $this->audit->log('mall.product.update', Product::class, $id, ['name' => $p->name]);

            return $p;
        }

        $p = Product::create($data);
        $this->audit->log('mall.product.create', Product::class, $p->id, [
            'name' => $p->name,
            'actor' => $actorId ?? Auth::id(),
        ]);

        return $p;
    }

    public function toggleStatus(int $id, ?int $actorId = null): void
    {
        $p = Product::findOrFail($id);
        $p->update(['status' => $p->status === 'active' ? 'draft' : 'active']);
        $this->audit->log('mall.product.toggle', Product::class, $id, ['status' => $p->status, 'actor' => $actorId ?? Auth::id()]);
    }

    public function toggleLimited(int $id, ?int $actorId = null): void
    {
        $p = Product::findOrFail($id);
        $p->update(['is_limited' => ! $p->is_limited]);
        $this->audit->log('mall.product.limited', Product::class, $id, ['is_limited' => $p->is_limited, 'actor' => $actorId ?? Auth::id()]);
    }

    public function delete(int $id, ?int $actorId = null): void
    {
        $p = Product::findOrFail($id);
        $p->delete();
        $this->audit->log('mall.product.delete', Product::class, $id, ['name' => $p->name, 'actor' => $actorId ?? Auth::id()]);
    }

    private function assertCompliant(string $name, string $desc): void
    {
        $text = $name.' '.$desc;
        foreach (self::FORBIDDEN as $w) {
            if (mb_strpos($text, $w) !== false) {
                $this->audit->log('mall.product.rejected_compliance', Product::class, 0, ['hit' => $w]);
                throw new \DomainException("命中合规红线词：「{$w}」。商品文案须走祈福/静心/文化/陪伴，禁改运/逆天/必应/医疗/付费算命。");
            }
        }
    }
}
