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
    {{ $slot }}
@livewireScripts
</body>
</html>
