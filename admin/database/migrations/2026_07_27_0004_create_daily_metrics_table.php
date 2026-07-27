<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * 运营指标日快照：用于数据看板 7 日趋势（CSS 条形图，不引图表库）。
     * metric: checkins | tourism_checkins | merit_issued | ugc_posts
     */
    public function up(): void
    {
        Schema::create('daily_metrics', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('metric');
            $table->unsignedInteger('value')->default(0);
            $table->timestamps();
            $table->unique(['date', 'metric']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_metrics');
    }
};
