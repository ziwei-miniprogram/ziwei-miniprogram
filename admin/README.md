# 星野漫游 · 后台管理协调层（Laravel 11 + Livewire 3）

> 位置：小程序仓 `ziwei-miniprogram/admin/` 子目录（monorepo）。
> 复用小程序设计令牌（暖纸 `#f7f5f0` / 星辉金 `#c8a35a` / 星夜蓝 `#0B1426`），视觉同源。
> 定位：内容把关 + 数据可视，先不阻塞小程序（小程序仍可跑 mock）。

## P0 + P1 范围（已落地，可运行）

| 模块 | 文件 | 说明 |
|---|---|---|
| 内容审核台 | `app/Livewire/ReviewQueue.php` + `resources/views/livewire/review-queue.blade.php` | censor 命中件队列、按状态筛选、通过/驳回/加白 |
| 功德账本 | `app/Livewire/MeritLedger.php` | 全局流水、等级分布、短时暴涨异常预警 |
| 操作审计 | `app/Livewire/AuditLog.php` | 谁、何时、改了什么，全留痕 |
| 商城管理 | `app/Livewire/MallManager.php` + `ProductService` + `Product` | 商品增改/上下架/限定，6 类目对齐电商 V2.1，文案合规把关 |
| 文旅运营 | `app/Livewire/TourismConfig.php` + `TourismService` + `TourismCity` | 6 城折扣/优先购窗口/GPS 围栏/全国守护进度 |
| 数据看板 | `app/Livewire/AnalyticsDashboard.php` + `DashboardService` + `DailyMetric` | KPI + 7 日趋势 + 文旅打卡进度（全员可见） |
| RBAC | `app/Http/Middleware/RoleMiddleware.php` | reviewer / operator / super 三角色，路由级约束 |
| 登录 | `app/Http/Controllers/Auth/LoginController.php` | 极简邮箱+密码（会话鉴权） |
| 种子 | `database/seeders/DatabaseSeeder.php` | 三角色账号 + 审核样本 + 功德流水（含异常） |

业务规则集中在 `app/Services/`（ReviewService / MeritService / AuditService），Livewire 组件只做编排。

## 运行（需本机 PHP ≥ 8.2 + Composer）

```bash
cd ziwei-miniprogram/admin
bash setup.sh          # 首次：补全骨架 + 安装 + 迁移 + 种子（一次性）
php artisan serve      # http://localhost:8000/admin
```

登录账号（种子生成，密码统一 `ziwei2026`）：
- `admin@ziwei.app`（super，可进全部模块）
- `review@ziwei.app`（reviewer，审核台 + 总览 + 数据看板）
- `ops@ziwei.app`（operator，功德账本 + 商城管理 + 文旅运营 + 总览）

> 默认数据库为 **SQLite**（`database/database.sqlite`，零配置）。
> 改用 MySQL：编辑 `.env` 的 `DB_CONNECTION` / `DB_*` 后 `php artisan migrate:fresh --seed`。

## 合规红线（延续小程序）

- **功德虚拟、不可提现/交易/购买**：`MeritService::adjust()` 在 `MERIT_REDEEMABLE=false` 时拒绝任何负向兑换。
- censor 词库与端上预检同源；所有 UGC 留痕可溯（`audit_entries`）。
- 所有后台写操作经 `AuditService` 落审计日志。

## 目录结构

```
admin/
├── app/
│   ├── Http/{Controllers/Auth/LoginController, Middleware/RoleMiddleware}
│   ├── Livewire/        # AdminDashboard / ReviewQueue / MeritLedger / AuditLog / MallManager / TourismConfig / AnalyticsDashboard
│   ├── Models/          # User / ReviewItem / MeritTxn / AuditEntry / Product / TourismCity / DailyMetric
│   └── Services/        # ReviewService / MeritService / AuditService / ProductService / TourismService / DashboardService
├── database/{migrations, seeders, factories}
├── public/css/admin.css # 设计令牌（小程序同源）
├── resources/views/     # layouts/app + components/guest-layout + livewire/* + auth/login
├── routes/web.php       # 登录 + 后台 RBAC 路由
├── setup.sh             # 一键初始化
└── composer.json
```

> `config/`、`routes/api.php`、`tests/`、`app/Providers/` 等 Laravel 默认文件由 `setup.sh`
> 首次从官方 `laravel/laravel` 骨架拉取，**不纳入本仓库自定义层**，避免与框架升级冲突。

## 下一步（P2，见 `ADMIN-PLAN.md`）

- **P2**：活动编排（每日命理流排期）、小程序 `mock.js` 切换真实 API（Sanctum 鉴权路由位已留）。
