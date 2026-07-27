# 星野漫游 · 后台管理协调层（P0 骨架）

> Laravel 11 + Livewire 3 + FluxUI。位于小程序仓 `ziwei-miniprogram/admin/` 子目录（monorepo）。
> 复用小程序设计令牌（暖纸 `#f7f5f0` / 星辉金 `#c8a35a` / 星夜蓝 `#0B1426`），视觉同源。

## P0 范围（本骨架已落地）

| 模块 | 文件 | 说明 |
|---|---|---|
| 内容审核台 | `app/Livewire/ReviewQueue.php` + `resources/views/livewire/review-queue.blade.php` | censor 命中件队列、按状态筛选、通过/驳回/加白 |
| 功德账本 | `app/Livewire/MeritLedger.php` | 全局流水、等级分布、短时暴涨异常预警 |
| RBAC + 审计 | `app/Http/Middleware/RoleMiddleware.php` + `app/Livewire/AuditLog.php` | 运营/审核/超管三角色、操作全留痕 |

业务规则集中在 `app/Services/`（ReviewService / MeritService / AuditService），Livewire 组件只做编排。

## 合规红线（延续小程序）

- **功德虚拟、不可提现/交易/购买**：`MeritService::adjust()` 在 `MERIT_REDEEMABLE=false` 时拒绝任何负向兑换。
- censor 词库与端上预检同源；所有 UGC 留痕可溯（audit_entries）。
- 所有后台写操作经 `AuditService` 落审计日志。

## 安装与运行（需本机 PHP ≥ 8.2 + Composer）

```bash
cd ziwei-miniprogram/admin
composer install
cp .env.example .env
php artisan key:generate
# 配置 .env 中 DB_*
php artisan migrate
php artisan serve          # http://localhost:8000/admin
```

> 注：本目录为 Laravel 应用根。标准引导文件（`artisan` / `public/index.php` / `bootstrap/app.php`）
> 已包含；`config/` 沿用 Laravel 默认。首次 `composer install` 会拉入 laravel/framework、livewire/livewire、livewire/flux、laravel/sanctum。

## 目录结构

```
admin/
├── app/
│   ├── Http/Middleware/RoleMiddleware.php
│   ├── Livewire/        # AdminDashboard / ReviewQueue / MeritLedger / AuditLog
│   ├── Models/          # User / ReviewItem / MeritTxn / AuditEntry
│   └── Services/        # ReviewService / MeritService / AuditService
├── database/migrations/ # 4 个迁移（角色 / 审核 / 功德 / 审计）
├── resources/
│   ├── css/admin.css    # 设计令牌（小程序同源）
│   └── views/           # layouts/app + livewire/*
├── routes/web.php
└── composer.json
```

## 下一步（P1 / P2，见 ADMIN-PLAN.md）

- **P1**：商城管理（SKU/折扣/限定）、文旅运营配置、数据看板。
- **P2**：活动编排（每日命理流排期）、小程序 `mock.js` 切换真实 API（Sanctum 鉴权已留路由位）。
