@section('title', '内容审核台')

{{-- 状态筛选（Apple 风胶囊） --}}
<div style="display:flex;gap:12px;margin-bottom:24px">
    @foreach (['pending'=>'待审','approved'=>'已通过','rejected'=>'已驳回','whitelisted'=>'已加白','all'=>'全部'] as $k => $label)
        <button class="btn {{ $filter===$k ? 'btn-approve' : 'btn-white' }}" wire:click="setFilter('{{ $k }}')">{{ $label }}</button>
    @endforeach
</div>

<div class="apple-card" style="padding:0;overflow:hidden">
    <table class="tbl">
        <thead>
            <tr><th>类型</th><th>内容</th><th>风险</th><th>censor 命中</th><th>操作</th></tr>
        </thead>
        <tbody>
        @forelse ($items as $item)
            <tr>
                <td>{{ match($item->content_type) { 'note'=>'随手记','wish'=>'寄愿','comment'=>'评论', default=>$item->content_type } }}</td>
                <td style="max-width:420px">{{ Str::limit($item->content, 60) }}</td>
                <td><span class="badge risk-{{ $item->risk_level }}">{{ $item->risk_level }}</span></td>
                <td>{{ is_array($item->censor_hits) ? count($item->censor_hits) : 0 }} 项</td>
                <td style="white-space:nowrap">
                    <button class="btn btn-approve" wire:click="approve({{ $item->id }})">通过</button>
                    <button class="btn btn-reject" wire:click="reject({{ $item->id }})">驳回</button>
                    <button class="btn btn-white" wire:click="whitelist({{ $item->id }})">加白</button>
                </td>
            </tr>
        @empty
            <tr><td colspan="5" style="color:var(--fg-2);text-align:center;padding:40px">队列为空</td></tr>
        @endforelse
        </tbody>
    </table>
</div>

<div style="margin-top:16px">{{ $items->links() }}</div>
