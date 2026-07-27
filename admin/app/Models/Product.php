<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * 商城商品：SKU / 类目 / 库存 / 折扣 / 限定系列。
 * 合规红线：文案须走祈福/静心/文化/陪伴，禁改运/逆天/必应/医疗/付费算命（见 ProductService）。
 */
class Product extends Model
{
    protected $fillable = [
        'name', 'category', 'sku_code', 'price', 'cost', 'stock',
        'status', 'is_limited', 'badge_text', 'theme_color', 'description',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'cost' => 'decimal:2',
        'is_limited' => 'boolean',
        'stock' => 'integer',
    ];

    public const CATEGORIES = [
        'xiang' => '香系列',
        'shouzhuan' => '手串配饰',
        'jiaoshu' => '角梳系列',
        'bingxiang' => '冰箱贴',
        'bei' => '杯子茶具',
        'daqi' => '非遗大漆',
    ];

    /** 毛利率（百分比，保留 1 位） */
    public function margin(): float
    {
        $cost = (float) $this->cost;
        if ($cost <= 0) {
            return 0;
        }

        return round(((float) $this->price - $cost) / (float) $this->price * 100, 1);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
