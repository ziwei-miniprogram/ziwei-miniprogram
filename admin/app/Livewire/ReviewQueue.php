<?php

namespace App\Livewire;

use App\Services\ReviewService;
use Livewire\Component;
use Livewire\WithPagination;

/**
 * 内容审核台：censor 命中件队列，支持按状态筛选与通过/驳回/加白。
 */
class ReviewQueue extends Component
{
    use WithPagination;

    public string $filter = 'pending';

    protected function rules()
    {
        return [
            'filter' => 'in:pending,approved,rejected,whitelisted,all',
        ];
    }

    public function setFilter(string $filter): void
    {
        $this->filter = $filter;
        $this->resetPage();
    }

    public function approve(int $id): void
    {
        app(ReviewService::class)->approve($id);
        $this->dispatch('notify', type: 'success', message: '已通过');
    }

    public function reject(int $id): void
    {
        app(ReviewService::class)->reject($id, note: '违规内容');
        $this->dispatch('notify', type: 'error', message: '已驳回');
    }

    public function whitelist(int $id): void
    {
        app(ReviewService::class)->whitelist($id);
        $this->dispatch('notify', type: 'success', message: '已加白');
    }

    public function getItemsProperty()
    {
        return app(ReviewService::class)->queue($this->filter);
    }

    public function render()
    {
        return view('livewire.review-queue', [
            'items' => $this->items,
        ])->layout('layouts.app');
    }
}
