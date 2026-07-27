#!/usr/bin/env bash
# 星野漫游后台 · 一键初始化（仅首次克隆后运行一次）
# 作用：补全 Laravel 应用骨架（config/routes/public/tests/Providers，来自官方 laravel/laravel），
#       然后安装依赖、生成 .env、迁移数据库并灌入种子数据。
# 注意：不会覆盖本项目已有的自定义文件（composer.json / bootstrap/app.php / routes/web.php /
#       app/ / database/ / resources/）。
set -euo pipefail
cd "$(dirname "$0")"

echo "== 星野漫游后台 · 初始化 =="

# 1) 补全 Laravel 11 应用骨架（仅框架默认文件）
if [ ! -d config ]; then
  echo ">> 下载 Laravel 应用骨架（config / routes / public / tests / Providers）..."
  TMP=$(mktemp -d)
  if ! composer create-project --no-install --no-interaction laravel/laravel "$TMP" >/dev/null 2>&1; then
    echo "!! composer create-project 失败（可能网络或 Composer 版本过低），请手动执行："
    echo "   composer create-project laravel/laravel $TMP"
    exit 1
  fi
  cp -r "$TMP/config" .
  cp "$TMP/routes/api.php" routes/api.php
  cp "$TMP/routes/console.php" routes/console.php
  cp "$TMP/public/.htaccess" public/.htaccess 2>/dev/null || true
  cp "$TMP/public/robots.txt" public/robots.txt 2>/dev/null || true
  cp -r "$TMP/app/Providers" app/Providers
  cp "$TMP/app/Http/Controllers/Controller.php" app/Http/Controllers/Controller.php 2>/dev/null || true
  cp -r "$TMP/tests" tests
  cp "$TMP/phpunit.xml" phpunit.xml
  rm -rf "$TMP"
  echo ">> 骨架已补全"
else
  echo ">> config/ 已存在，跳过骨架下载"
fi

# 2) 依赖安装
if [ ! -d vendor ]; then
  echo ">> composer install ..."
  composer install
else
  echo ">> vendor 已存在，跳过"
fi

# 3) .env（默认 SQLite，零配置）
if [ ! -f .env ]; then
  cp .env.example .env
  php artisan key:generate
  echo ">> 已生成 .env（默认 SQLite）"
fi

# 4) 迁移 + 种子
php artisan migrate:fresh --seed

echo ""
echo "== 完成 =="
echo "运行： php artisan serve"
echo "访问： http://localhost:8000/admin"
echo "登录： admin@ziwei.app / ziwei2026 （超管；另有 review@ziwei.app、ops@ziwei.app 同密码）"
echo ""
echo "如需 MySQL：编辑 .env 的 DB_CONNECTION / DB_* 后重新 php artisan migrate:fresh --seed"
