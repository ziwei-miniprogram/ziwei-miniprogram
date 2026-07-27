<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('review_items', function (Blueprint $table) {
            $table->id();
            $table->string('content_type');              // note | wish | comment
            $table->text('content');
            $table->unsignedBigInteger('author_id')->nullable();
            $table->json('censor_hits')->nullable();      // 端上命中词与等级
            $table->string('risk_level')->default('low'); // low | mid | high
            $table->string('status')->default('pending'); // pending|approved|rejected|whitelisted
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->text('review_note')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'risk_level']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('review_items');
    }
};
