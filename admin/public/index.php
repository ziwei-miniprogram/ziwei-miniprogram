<?php

use Illuminate\Foundation\Application;

define('LARAVEL_START', microtime(true));

// 维护模式
if (file_exists($maintenance = __DIR__ . '/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// 注册 Composer 自动加载
require __DIR__ . '/../vendor/autoload.php';

// 启动应用
$app = require __DIR__ . '/../bootstrap/app.php';

// 处理 HTTP 请求
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

$response->send();

$kernel->terminate($request, $response);
