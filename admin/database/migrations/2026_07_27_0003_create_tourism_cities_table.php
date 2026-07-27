<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * 文旅城市运营配置：折扣力度 / 限定优先购窗口 / GPS 围栏半径 / 打卡进度。
     * 对齐小程序 utils/checkin.js 的 6 城（杭州/成都/大理/敦煌/普陀山/苏州）。
     */
    public function up(): void
    {
        Schema::create('tourism_cities', function (Blueprint $table) {
            $table->id();
            $table->string('city_key')->unique(); // hangzhou ...
            $table->string('name');
            $table->decimal('discount_rate', 3, 2)->default(0.90); // 0.90 = 9 折
            $table->boolean('priority_enabled')->default(true);
            $table->unsignedInteger('priority_hours')->default(24);  // 限定优先购时长
            $table->unsignedInteger('gps_radius')->default(1500);    // GPS 围栏半径(米)
            $table->unsignedInteger('checkin_count')->default(0);    // 累计打卡数(进度展示)
            $table->unsignedInteger('limited_sku_id')->nullable();   // 城市限定款商品 id
            $table->text('reward_note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tourism_cities');
    }
};
