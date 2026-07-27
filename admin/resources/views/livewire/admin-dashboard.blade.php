@section('title', '总览')

<div class="grid-bento">
    <div class="apple-card">
        <div class="stat-num">{{ $pendingCount }}</div>
        <div class="stat-label">待审内容（censor 命中队列）</div>
    </div>
    <div class="apple-card">
        <div class="stat-num" style="color:var(--gold-deep)">{{ $anomalyCount }}</div>
        <div class="stat-label">功德异常预警（短时暴涨）</div>
    </div>
    <div class="apple-card">
        <div class="stat-num">{{ $levels->count() }}</div>
        <div class="stat-label">善信等级梯队数</div>
    </div>
</div>

<div class="apple-card" style="margin-top:24px">
    <p class="section-sub">善信等级分布（每 2000 功德一阶）</p>
    <table class="tbl">
        <thead><tr><th>梯队</th><th>人数</th></tr></thead>
        <tbody>
        @forelse ($levels as $lv)
            <tr>
                <td>第 {{ $lv->tier + 1 }} 阶</td>
                <td>{{ $lv->users }}</td>
            </tr>
        @empty
            <tr><td colspan="2" style="color:var(--fg-2)">暂无数据</td></tr>
        @endforelse
        </tbody>
    </table>
</div>
