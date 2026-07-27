@section('title', '数据看板')

<div class="kpi-grid">
    <div class="apple-card kpi"><div class="stat-num">{{ $kpis['users'] }}</div><div class="stat-label">注册用户</div></div>
    <div class="apple-card kpi"><div class="stat-num">{{ $kpis['merit_total'] }}</div><div class="stat-label">功德发放总量</div></div>
    <div class="apple-card kpi"><div class="stat-num">{{ $kpis['products_active'] }}/{{ $kpis['products_total'] }}</div><div class="stat-label">在售 / 商品总数</div></div>
    <div class="apple-card kpi"><div class="stat-num">{{ $kpis['limited'] }}</div><div class="stat-label">限定款</div></div>
    <div class="apple-card kpi"><div class="stat-num">{{ $kpis['cities'] }}</div><div class="stat-label">文旅城市</div></div>
    <div class="apple-card kpi"><div class="stat-num">{{ $kpis['pending_reviews'] }}</div><div class="stat-label">待审内容</div></div>
</div>

<div class="apple-card" style="margin-top:24px">
    <p class="section-sub" style="margin-top:0">近 7 日趋势（演示快照）</p>
    <div class="trend-grid">
        @foreach ($trend as $key => $blk)
            <div class="trend-col">
                <div class="trend-title">{{ $labels[$key] ?? $key }}</div>
                <div class="bars">
                    @foreach ($blk['series'] as $pt)
                        <div class="bar-wrap" title="{{ $pt['date'] }}：{{ $pt['value'] }}">
                            <div class="bar" style="height:{{ $maxMap[$key] ? max(4, $pt['value'] / $maxMap[$key] * 100) : 4 }}%"></div>
                        </div>
                    @endforeach
                </div>
                <div class="trend-total">合计 {{ $blk['total'] }}</div>
            </div>
        @endforeach
    </div>
</div>

<div class="apple-card" style="margin-top:24px">
    <p class="section-sub" style="margin-top:0">文旅打卡进度</p>
    <table class="tbl">
        <thead><tr><th>城市</th><th>折扣</th><th>累计打卡</th><th>优先购</th></tr></thead>
        <tbody>
        @forelse ($cities as $c)
            <tr>
                <td>{{ $c->name }}</td>
                <td><span class="badge">{{ $c->discountLabel() }}</span></td>
                <td>{{ $c->checkin_count }}</td>
                <td>{{ $c->priority_enabled ? $c->priority_hours.'h' : '关' }}</td>
            </tr>
        @empty
            <tr><td colspan="4" style="color:var(--fg-2);text-align:center;padding:40px">暂无城市</td></tr>
        @endforelse
        </tbody>
    </table>
</div>
