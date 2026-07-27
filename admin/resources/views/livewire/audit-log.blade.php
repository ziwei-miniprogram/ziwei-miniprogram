@section('title', '操作审计')

<div class="apple-card" style="padding:0;overflow:hidden">
    <table class="tbl">
        <thead><tr><th>操作人</th><th>动作</th><th>对象</th><th>备注</th><th>时间</th></tr></thead>
        <tbody>
        @forelse ($entries as $e)
            <tr>
                <td>{{ $e->actor->name ?? $e->actor_id }}</td>
                <td><span class="badge">{{ $e->action }}</span></td>
                <td>{{ class_basename($e->target_type) }} #{{ $e->target_id }}</td>
                <td style="color:var(--fg-2)">{{ json_encode($e->meta, JSON_UNESCAPED_UNICODE) }}</td>
                <td style="color:var(--fg-2)">{{ $e->created_at?->format('m-d H:i') }}</td>
            </tr>
        @empty
            <tr><td colspan="5" style="color:var(--fg-2);text-align:center;padding:40px">暂无审计记录</td></tr>
        @endforelse
        </tbody>
    </table>
</div>

<div style="margin-top:16px">{{ $entries->links() }}</div>
