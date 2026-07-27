<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * 操作审计日志：谁、何时、改了什么。所有后台写操作经 AuditService 落此表。
 * meta 存放结构化前后值，便于追溯与合规核查。
 */
class AuditEntry extends Model
{
    protected $fillable = [
        'actor_id',
        'action',         // review.approve | merit.adjust | config.update ...
        'target_type',
        'target_id',
        'meta',           // json：before/after
    ];

    protected $casts = [
        'meta' => 'array',
        'created_at' => 'immutable_datetime',
    ];
}
