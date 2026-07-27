@section('title', '商城管理')

<div class="toolbar">
    <div class="filter-tabs">
        <button class="tab {{ $filterCategory === 'all' ? 'on' : '' }}" wire:click="setCategory('all')">全部</button>
        @foreach ($categories as $key => $label)
            <button class="tab {{ $filterCategory === $key ? 'on' : '' }}" wire:click="setCategory('{{ $key }}')">{{ $label }}</button>
        @endforeach
    </div>
    <div class="filter-tabs">
        <button class="tab {{ $filterStatus === 'all' ? 'on' : '' }}" wire:click="setStatus('all')">全部状态</button>
        <button class="tab {{ $filterStatus === 'active' ? 'on' : '' }}" wire:click="setStatus('active')">在售</button>
        <button class="tab {{ $filterStatus === 'draft' ? 'on' : '' }}" wire:click="setStatus('draft')">草稿</button>
    </div>
    <button class="btn btn-approve" wire:click="openCreate">+ 新增商品</button>
</div>

<div class="grid-bento">
    @forelse ($items as $p)
        <div class="apple-card product-card">
            <div class="pc-cover" style="background:linear-gradient(135deg, {{ $p->theme_color }})">
                @if ($p->is_limited)<span class="pc-limited">限定</span>@endif
            </div>
            <div class="pc-body">
                <div class="pc-cat">{{ $categories[$p->category] ?? $p->category }}</div>
                <div class="pc-name">{{ $p->name }}</div>
                <div class="pc-meta">SKU {{ $p->sku_code }} · 库存 {{ $p->stock }}</div>
                <div class="pc-price">¥{{ $p->price }} <span class="pc-margin">毛利 {{ $p->margin() }}%</span></div>
                <div class="pc-actions">
                    <span class="badge {{ $p->status === 'active' ? '' : 'risk-mid' }}">{{ $p->status === 'active' ? '在售' : '草稿' }}</span>
                    <button class="btn btn-white" wire:click="toggleStatus({{ $p->id }})">{{ $p->status === 'active' ? '下架' : '上架' }}</button>
                    <button class="btn btn-white" wire:click="toggleLimited({{ $p->id }})">{{ $p->is_limited ? '取消限定' : '设限定' }}</button>
                    <button class="btn btn-white" wire:click="openEdit({{ $p->id }})">编辑</button>
                    <button class="btn btn-reject" wire:click="remove({{ $p->id }})" wire:confirm="确认删除该商品？">删除</button>
                </div>
            </div>
        </div>
    @empty
        <div class="apple-card" style="grid-column:1/-1;text-align:center;color:var(--fg-2);padding:48px">暂无商品，点右上角「新增商品」</div>
    @endforelse
</div>

<div style="margin-top:20px">{{ $items->links() }}</div>

@if ($showForm)
    <div class="modal-mask" wire:click.self="closeForm">
        <div class="modal">
            <h3 class="modal-title">{{ $editingId ? '编辑商品' : '新增商品' }}</h3>

            <div class="login-field"><span>商品名称</span><input type="text" wire:model="name" placeholder="如 城市星空冰箱贴"></div>
            @error('name')<div class="login-err">{{ $message }}</div>@enderror

            <div class="login-field"><span>类目</span>
                <select wire:model="category" style="width:100%;padding:16px 18px;font-size:22px;border-radius:14px;border:1px solid var(--border);background:var(--bg);color:var(--fg)">
                    @foreach ($categories as $key => $label)<option value="{{ $key }}">{{ $label }}</option>@endforeach
                </select>
            </div>

            <div class="login-field"><span>SKU 编码</span><input type="text" wire:model="sku_code" placeholder="如 BXT-001"></div>
            @error('sku_code')<div class="login-err">{{ $message }}</div>@enderror

            <div style="display:flex;gap:16px">
                <div class="login-field" style="flex:1"><span>售价 ¥</span><input type="number" step="0.01" wire:model="price"></div>
                <div class="login-field" style="flex:1"><span>成本 ¥</span><input type="number" step="0.01" wire:model="cost"></div>
                <div class="login-field" style="flex:1"><span>库存</span><input type="number" wire:model="stock"></div>
            </div>
            @error('price')<div class="login-err">{{ $message }}</div>@enderror

            <div class="login-field"><span>限定标签（可选）</span><input type="text" wire:model="badge_text" placeholder="如 限定 / 新品 / 非遗"></div>

            <div class="login-field"><span>卡片渐变色（hex1,hex2）</span><input type="text" wire:model="theme_color" placeholder="#c8a35a,#e0c489"></div>

            <div class="login-field"><span>商品描述</span><textarea wire:model="description" rows="3" style="width:100%;padding:16px 18px;font-size:20px;border-radius:14px;border:1px solid var(--border);background:var(--bg);color:var(--fg);resize:vertical"></textarea></div>
            @error('description')<div class="login-err">{{ $message }}</div>@enderror

            <label style="display:flex;align-items:center;gap:10px;font-size:20px;color:var(--fg-2);margin:8px 0 4px">
                <input type="checkbox" wire:model="is_limited"> 设为限定系列
            </label>
            <label style="display:flex;align-items:center;gap:10px;font-size:20px;color:var(--fg-2)">
                <input type="checkbox" wire:model="status" value="active" {{ $status === 'active' ? 'checked' : '' }}> 立即上架（取消则存为草稿）
            </label>

            <div class="modal-actions">
                <button class="btn btn-white" wire:click="closeForm">取消</button>
                <button class="btn btn-approve" wire:click="save">保存</button>
            </div>
        </div>
    </div>
@endif
