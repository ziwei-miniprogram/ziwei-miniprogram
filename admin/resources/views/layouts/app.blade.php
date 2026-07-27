<!DOCTYPE html>
<html lang="zh-CN" class="{{ session('theme', 'light') === 'dark' ? 'dark' : '' }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>星野漫游 · 后台</title>
    @livewireStyles
    <link rel="stylesheet" href="{{ asset('css/admin.css') }}">
</head>
<body>
<div class="admin-shell">
    {{-- 侧边导航（Apple 风：极简、留白） --}}
    <aside class="admin-nav">
        <div class="nav-brand">
            <span class="brand-mark">✦</span>
            <span class="brand-name">星野漫游</span>
        </div>
        <nav class="nav-items">
            <a href="{{ route('admin.dashboard') }}" class="nav-link {{ request()->routeIs('admin.dashboard') ? 'on' : '' }}">总览</a>
            <a href="{{ route('admin.review') }}" class="nav-link {{ request()->routeIs('admin.review') ? 'on' : '' }}">内容审核台</a>
            <a href="{{ route('admin.merit') }}" class="nav-link {{ request()->routeIs('admin.merit') ? 'on' : '' }}">功德账本</a>
            <a href="{{ route('admin.audit') }}" class="nav-link {{ request()->routeIs('admin.audit') ? 'on' : '' }}">操作审计</a>
            <a href="{{ route('admin.mall') }}" class="nav-link {{ request()->routeIs('admin.mall') ? 'on' : '' }}">商城管理</a>
            <a href="{{ route('admin.tourism') }}" class="nav-link {{ request()->routeIs('admin.tourism') ? 'on' : '' }}">文旅运营</a>
            <a href="{{ route('admin.analytics') }}" class="nav-link {{ request()->routeIs('admin.analytics') ? 'on' : '' }}">数据看板</a>
        </nav>
        <div class="nav-foot">
            <span class="nav-user">{{ auth()->user()->name ?? '管理员' }}</span>
            <span class="nav-role">{{ auth()->user()->role ?? 'super' }}</span>
            <form method="POST" action="{{ route('logout') }}" style="margin-top:12px">
                @csrf
                <button type="submit" class="nav-logout">退出登录</button>
            </form>
        </div>
    </aside>

    {{-- 主内容区 --}}
    <main class="admin-main">
        <header class="admin-topbar">
            <div>
                <p class="eyebrow">后台管理协调层</p>
                <h1 class="page-title">@yield('title', '总览')</h1>
            </div>
            <button class="theme-toggle" onclick="document.documentElement.classList.toggle('dark')">◐ 主题</button>
        </header>

        <section class="admin-content">
            {{ $slot }}
        </section>
    </main>
</div>

@livewireScripts
</body>
</html>
