@section('title', '功德账本')

@if ($anomalies->isNotEmpty())
    <div class="apple-card" style="border-color:rgba(224,121,111,.4);margin-bottom:24rpx">
        <p class="section-sub" style="color:#c0564c;margin-top:0">⚠ 异常预警：{{ $anomalies->count() }} 笔短时功德暴涨（疑似刷分）</p>
        <table class="tbl">
            <thead><tr><th>用户</th><th>变动</th><th>时间</th></tr></thead>
            <tbody>
            @foreach ($anomalies as $a)
                <tr><td>{{ $a->user_id }}</td><td>+{{ $a->delta }}</td><td>{{ $a->created_at }}</td></tr>
            @endforeach
            </tbody>
        </table>
    </div>
@endif

<div class="apple-card" style="margin-bottom:24rpx">
    <p class="section-sub">善信等级分布</p>
    <table class="tbl">
        <thead><tr><th>梯队</th><th>人数</th></tr></thead>
        <tbody>
        @forelse ($levels as $lv)
            <tr><td>第 {{ $lv->tier + 1 }} 阶</td><td>{{ $lv->users }}</td></tr>
        @empty
            <tr><td colspan="2" style="color:var(--fg-2)">暂无数据</td></tr>
        @endforelse
        </tbody>
    </table>
</div>

<div class="apple-card" style="padding:0;overflow:hidden">
    <p class="section-sub" style="padding:24rpx 24rpx 0;margin:0">全局功德流水</p>
    <table class="tbl">
        <thead><tr><th>用户</th><th>变动</th><th>原因</th><th>余额</th><th>来源</th></tr></thead>
        <tbody>
        @forelse ($ledger as $tx)
            <tr>
                <td>{{ $tx->user_id }}</td>
                <td style="color:{{ $tx->delta < 0 ? '#c0564c' : 'var(--gold-deep)' }}">{{ $tx->delta > 0 ? '+' : '' }}{{ $tx->delta }}</td>
                <td>{{ $tx->reason }}</td>
                <td>{{ $tx->balance_after }}</td>
                <td><span class="badge">{{ $tx->source }}</span></td>
            </tr>
        @empty
            <tr><td colspan="5" style="color:var(--fg-2);text-align:center;padding:40rpx">暂无流水</td></tr>
        @endforelse
        </tbody>
    </table>
</div>

<div style="margin-top:16rpx">{{ $ledger->links() }}</div>
