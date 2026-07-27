<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('merit_txns', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->integer('delta');                     // 可正可负
            $table->string('reason');                    // addMerit | spendMerit | checkin ...
            $table->integer('balance_after');
            $table->string('source')->default('miniprogram'); // miniprogram | admin | system
            $table->timestamp('created_at')->nullable(); // 仅创建时间，便于异常窗口查询

            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('merit_txns');
    }
};
