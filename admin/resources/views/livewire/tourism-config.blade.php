@section('title', '文旅运营')

<div class="apple-card" style="margin-bottom:24px">
    <p class="section-sub" style="margin-top:0">全国守护进度：{{ $progress['lit'] }} / {{ $progress['total'] }} 城点亮（集满解锁全国守护礼）</p>
    <div class="progress-track"><div class="progress-fill" style="width:{{ $progress['pct'] }}%"></div></div>
</div>

<div class="grid-bento">
    @foreach ($cities as $c)
        <div class="apple-card city-card">
            <div class="city-head">
                <span class="city-name">{{ $c->name }}</span>
                <span class="badge">{{ $c->discountLabel() }}</span>
            </div>
            <div class="progress-track sm"><div class="progress-fill" style="width:{{ $c->checkin_count > 0 ? 100 : 0 }}%"></div></div>
            <div class="city-meta">累计打卡 {{ $c->checkin_count }} · 优先购 {{ $c->priority_enabled ? $c->priority_hours.'h' : '关' }} · 围栏 {{ $c->gps_radius }}m</div>
            <div class="pc-actions">
                <button class="btn btn-white" wire:click="openEdit({{ $c->id }})">配置</button>
            </div>
        </div>
    @endforeach
</div>

@if ($showForm)
    <div class="modal-mask" wire:click.self="closeForm">
        <div class="modal">
            <h3 class="modal-title">配置 · {{ $name }}</h3>

            <div class="login-field"><span>折扣力度（0.90 = 9 折）</span><input type="number" step="0.01" wire:model="discount_rate"></div>
            @error('discount_rate')<div class="login-err">{{ $message }}</div>@enderror

            <div class="login-field"><span>限定优先购时长（小时）</span><input type="number" wire:model="priority_hours"></div>
            @error('priority_hours')<div class="login-err">{{ $message }}</div>@enderror

            <div class="login-field"><span>GPS 围栏半径（米）</span><input type="number" wire:model="gps_radius"></div>
            @error('gps_radius')<div class="login-err">{{ $message }}</div>@enderror

            <div class="login-field"><span>城市限定款商品 ID（可选）</span><input type="number" wire:model="limited_sku_id" placeholder="留空表示无"></div>

            <div class="login-field"><span>奖励文案（集满该城）</span><input type="text" wire:model="reward_note" placeholder="如 解锁全国守护礼·大漆星图杯"></div>

            <label style="display:flex;align-items:center;gap:10px;font-size:20px;color:var(--fg-2);margin:8px 0 4px">
                <input type="checkbox" wire:model="priority_enabled"> 开启限定优先购
            </label>

            <div class="modal-actions">
                <button class="btn btn-white" wire:click="closeForm">取消</button>
                <button class="btn btn-approve" wire:click="save">保存</button>
            </div>
        </div>
    </div>
@endif
