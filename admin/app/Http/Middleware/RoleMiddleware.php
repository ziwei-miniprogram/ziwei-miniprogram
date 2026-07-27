<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * RBAC 路由中间件：Route::middleware('role:admin')。
 * 支持单角色或逗号分隔多角色。
 */
class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        if ($user->isSuper()) {
            return $next($request); // 超管通行
        }

        $allowed = empty($roles) || in_array($user->role, $roles, true);

        if (! $allowed) {
            abort(403, '无权限访问该模块');
        }

        return $next($request);
    }
}
