<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * 内容审核条目：UGC（随手记 / 寄愿 / 评论）经端上 censor.js 预检后，
 * 命中件异步入队，等待人工复审。
 *
 * status: pending(待审) | approved(通过) | rejected(驳回) | whitelisted(加白)
 */
class ReviewItem extends Model
{
    protected $fillable = [
        'content_type',   // note | wish | comment
        'content',        // 原始文本
        'author_id',      // 小程序用户 id
        'censor_hits',    // json：端上命中的风险等级与词
        'risk_level',     // low | mid | high
        'status',
        'reviewed_by',
        'review_note',
        'reviewed_at',
    ];

    protected $casts = [
        'censor_hits' => 'array',
        'reviewed_at' => 'immutable_datetime',
    ];

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }
}
