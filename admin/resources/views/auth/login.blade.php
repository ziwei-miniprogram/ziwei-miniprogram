<x-guest-layout>
@section('title', '登录')
@endsection

<div class="login-wrap">
    <div class="login-card apple-card">
        <div class="login-brand">
            <span class="brand-mark">✦</span>
            <span class="brand-name">星野漫游 · 后台</span>
        </div>

        @if ($errors->any())
            <div class="login-err">{{ $errors->first() }}</div>
        @endif

        <form method="POST" action="{{ route('login') }}">
            @csrf
            <label class="login-field">
                <span>邮箱</span>
                <input type="email" name="email" value="{{ old('email') }}" required autofocus placeholder="admin@ziwei.app">
            </label>
            <label class="login-field">
                <span>密码</span>
                <input type="password" name="password" required placeholder="••••••••">
            </label>
            <label class="login-remember">
                <input type="checkbox" name="remember"> 记住我
            </label>
            <button class="btn btn-approve login-submit" type="submit">登 录</button>
        </form>

        <p class="login-hint">内部运营系统 · 未授权禁止访问</p>
    </div>
</div>
</x-guest-layout>
