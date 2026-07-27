<?php

namespace App\Livewire;

use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Database\QueryException;
use Livewire\Component;
use Livewire\WithPagination;

/**
 * 商城管理：商品列表（按类目/状态筛选）+ 增改/上下架/限定/删除。
 * 写操作经 ProductService，命中合规红线或重复 SKU 时前端报错并留痕。
 */
class MallManager extends Component
{
    use WithPagination;

    public string $filterCategory = 'all';
    public string $filterStatus = 'all';

    // 表单
    public bool $showForm = false;
    public ?int $editingId = null;
    public string $name = '';
    public string $category = 'xiang';
    public string $sku_code = '';
    public string $price = '';
    public string $cost = '';
    public string $stock = '';
    public string $status = 'draft';
    public bool $is_limited = false;
    public string $badge_text = '';
    public string $theme_color = '#c8a35a,#e0c489';
    public string $description = '';

    protected function rules()
    {
        return [
            'name' => 'required|string|max:60',
            'category' => 'required|in:xiang,shouzhuan,jiaoshu,bingxiang,bei,daqi',
            'sku_code' => 'required|string|max:40',
            'price' => 'required|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'is_limited' => 'boolean',
            'badge_text' => 'nullable|string|max:20',
            'theme_color' => 'nullable|string|max:40',
            'description' => 'nullable|string|max:500',
        ];
    }

    public function setCategory(string $c): void
    {
        $this->filterCategory = $c;
        $this->resetPage();
    }

    public function setStatus(string $s): void
    {
        $this->filterStatus = $s;
        $this->resetPage();
    }

    public function openCreate(): void
    {
        $this->reset(['name', 'sku_code', 'price', 'cost', 'stock', 'badge_text', 'description', 'editingId']);
        $this->category = 'xiang';
        $this->status = 'draft';
        $this->is_limited = false;
        $this->theme_color = '#c8a35a,#e0c489';
        $this->showForm = true;
    }

    public function openEdit(int $id): void
    {
        $p = app(ProductService::class)->find($id);
        $this->editingId = $p->id;
        $this->name = $p->name;
        $this->category = $p->category;
        $this->sku_code = $p->sku_code;
        $this->price = (string) $p->price;
        $this->cost = (string) $p->cost;
        $this->stock = (string) $p->stock;
        $this->status = $p->status;
        $this->is_limited = $p->is_limited;
        $this->badge_text = (string) $p->badge_text;
        $this->theme_color = $p->theme_color;
        $this->description = (string) $p->description;
        $this->showForm = true;
    }

    public function closeForm(): void
    {
        $this->showForm = false;
        $this->resetErrorBag();
    }

    public function save(): void
    {
        $data = $this->validate();
        $data['price'] = (float) $data['price'];
        $data['cost'] = $data['cost'] === '' ? 0 : (float) $data['cost'];
        $data['stock'] = $data['stock'] === '' ? 0 : (int) $data['stock'];
        $data['status'] = $this->status === 'active' ? 'active' : 'draft';

        try {
            app(ProductService::class)->save($data, $this->editingId);
        } catch (\DomainException $e) {
            $this->addError('description', $e->getMessage());

            return;
        } catch (QueryException $e) {
            $this->addError('sku_code', 'SKU 编码已存在，请换一个');

            return;
        }

        $this->showForm = false;
        $this->dispatch('notify', type: 'success', message: $this->editingId ? '已更新' : '已新增');
    }

    public function toggleStatus(int $id): void
    {
        app(ProductService::class)->toggleStatus($id);
    }

    public function toggleLimited(int $id): void
    {
        app(ProductService::class)->toggleLimited($id);
    }

    public function remove(int $id): void
    {
        app(ProductService::class)->delete($id);
        $this->dispatch('notify', type: 'success', message: '已删除');
    }

    public function getItemsProperty()
    {
        return app(ProductService::class)->list($this->filterCategory, $this->filterStatus);
    }

    public function getCategoriesProperty(): array
    {
        return Product::CATEGORIES;
    }

    public function render()
    {
        return view('livewire.mall-manager', [
            'items' => $this->items,
            'categories' => $this->categories,
        ])->layout('layouts.app');
    }
}
