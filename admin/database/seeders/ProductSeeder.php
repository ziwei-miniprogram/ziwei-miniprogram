<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

/**
 * 商城商品种子：对齐电商 V2.1 六类目（首期 4 轻 + 2 标杆后置）。
 * 含首发 MVP「城市星空冰箱贴」三 SKU。
 */
class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            ['name' => '永春制香·静心线香', 'category' => 'xiang', 'sku_code' => 'XIANG-001', 'price' => 68, 'cost' => 22, 'stock' => 200, 'status' => 'active', 'is_limited' => false, 'badge_text' => '', 'theme_color' => '#7a8b5a,#b6c79a', 'description' => '非遗永春制香，静坐一支，安神静心。'],
            ['name' => '仙游木作·星宿手串', 'category' => 'shouzhuan', 'sku_code' => 'SHOU-001', 'price' => 128, 'cost' => 45, 'stock' => 120, 'status' => 'active', 'is_limited' => false, 'badge_text' => '', 'theme_color' => '#8a6a2a,#caa45c', 'description' => '仙游木作核雕，二十八宿星纹随行。'],
            ['name' => '扬州角梳·顺心梳', 'category' => 'jiaoshu', 'sku_code' => 'JIAO-001', 'price' => 39, 'cost' => 12, 'stock' => 300, 'status' => 'active', 'is_limited' => false, 'badge_text' => '', 'theme_color' => '#b98e44,#e0c489', 'description' => '扬州角梳，顺发顺心，日常陪伴。'],
            ['name' => '城市星空冰箱贴·单枚', 'category' => 'bingxiang', 'sku_code' => 'BXT-001', 'price' => 19.9, 'cost' => 4, 'stock' => 500, 'status' => 'active', 'is_limited' => false, 'badge_text' => '新品', 'theme_color' => '#3b6ea5,#7fb7d4', 'description' => '城市文旅首发 MVP，把星夜贴在冰箱上。'],
            ['name' => '城市星空冰箱贴·三联', 'category' => 'bingxiang', 'sku_code' => 'BXT-003', 'price' => 39, 'cost' => 9, 'stock' => 300, 'status' => 'active', 'is_limited' => false, 'badge_text' => '', 'theme_color' => '#3b6ea5,#9ec7e0', 'description' => '三联装，集齐一座城的坐标。'],
            ['name' => '城市星空冰箱贴·宿城限定', 'category' => 'bingxiang', 'sku_code' => 'BXT-SU', 'price' => 29, 'cost' => 7, 'stock' => 80, 'status' => 'active', 'is_limited' => true, 'badge_text' => '限定', 'theme_color' => '#c8a35a,#e0c489', 'description' => '宿城限定配色，限量发售。'],
            ['name' => '建盏·星夜茶盏', 'category' => 'bei', 'sku_code' => 'BEI-001', 'price' => 158, 'cost' => 60, 'stock' => 60, 'status' => 'draft', 'is_limited' => false, 'badge_text' => '', 'theme_color' => '#0B1426,#3b3a5c', 'description' => '建盏窑变星夜釉，茶席一隅星空。（标杆后置）'],
            ['name' => '脱胎大漆·星图杯', 'category' => 'daqi', 'sku_code' => 'DAQI-001', 'price' => 288, 'cost' => 120, 'stock' => 30, 'status' => 'draft', 'is_limited' => true, 'badge_text' => '非遗', 'theme_color' => '#5a3b6e,#a07fc0', 'description' => '脱胎漆器星图杯，非遗工艺。（标杆后置）'],
        ];

        foreach ($rows as $r) {
            Product::create($r);
        }
    }
}
