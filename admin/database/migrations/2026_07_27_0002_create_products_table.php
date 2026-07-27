<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * 商城商品表：SKU / 类目 / 库存 / 折扣 / 限定系列。
     * 类目对齐电商 V2.1：香系列/手串配饰/角梳系列/冰箱贴(城市文旅)/杯子茶具/非遗大漆。
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category');      // xiang|shouzhuan|jiaoshu|bingxiang|bei|daqi
            $table->string('sku_code')->unique();
            $table->decimal('price', 10, 2);
            $table->decimal('cost', 10, 2)->default(0);
            $table->unsignedInteger('stock')->default(0);
            $table->string('status')->default('draft'); // draft|active
            $table->boolean('is_limited')->default(false);
            $table->string('badge_text')->nullable();
            $table->string('theme_color')->default('#c8a35a,#e0c489'); // 卡片渐变(hex1,hex2)
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
