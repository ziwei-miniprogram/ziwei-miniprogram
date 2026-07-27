<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * 后台用户（运营 / 审核 / 超管）。
 * role 三态：reviewer（审核）｜operator（运营）｜super（超管）。
 * 服务端强制：所有后台操作经 RoleMiddleware + AuditService 留痕。
 */
class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'role',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'immutable_datetime',
        'password' => 'hashed',
    ];

    public function isSuper(): bool
    {
        return $this->role === 'super';
    }

    public function canReview(): bool
    {
        return in_array($this->role, ['reviewer', 'super'], true);
    }

    public function canOperate(): bool
    {
        return in_array($this->role, ['operator', 'super'], true);
    }
}
