<?php

namespace App\Livewire;

use App\Services\TourismService;
use Livewire\Component;

/**
 * 文旅运营配置：城市折扣力度 / 限定优先购窗口 / GPS 围栏半径 / 奖励文案。
 */
class TourismConfig extends Component
{
    public bool $showForm = false;
    public ?int $editingId = null;
    public string $city_key = '';
    public string $name = '';
    public string $discount_rate = '0.90';
    public bool $priority_enabled = true;
    public string $priority_hours = '24';
    public string $gps_radius = '1500';
    public string $limited_sku_id = '';
    public string $reward_note = '';

    public function openEdit(int $id): void
    {
        $c = app(TourismService::class)->find($id);
        $this->editingId = $c->id;
        $this->city_key = $c->city_key;
        $this->name = $c->name;
        $this->discount_rate = (string) $c->discount_rate;
        $this->priority_enabled = $c->priority_enabled;
        $this->priority_hours = (string) $c->priority_hours;
        $this->gps_radius = (string) $c->gps_radius;
        $this->limited_sku_id = $c->limited_sku_id ? (string) $c->limited_sku_id : '';
        $this->reward_note = (string) $c->reward_note;
        $this->showForm = true;
    }

    public function closeForm(): void
    {
        $this->showForm = false;
        $this->resetErrorBag();
    }

    public function save(): void
    {
        $data = $this->validate([
            'discount_rate' => 'required|numeric|between:0.01,1',
            'priority_enabled' => 'boolean',
            'priority_hours' => 'required|integer|min:1|max:240',
            'gps_radius' => 'required|integer|min:100|max:10000',
            'limited_sku_id' => 'nullable|integer',
            'reward_note' => 'nullable|string|max:200',
        ]);

        $data['discount_rate'] = (float) $data['discount_rate'];
        $data['priority_hours'] = (int) $data['priority_hours'];
        $data['gps_radius'] = (int) $data['gps_radius'];
        $data['limited_sku_id'] = $data['limited_sku_id'] === '' ? null : (int) $data['limited_sku_id'];

        app(TourismService::class)->save($this->editingId, $data);
        $this->showForm = false;
        $this->dispatch('notify', type: 'success', message: '已保存');
    }

    public function getCitiesProperty()
    {
        return app(TourismService::class)->cities();
    }

    public function getProgressProperty(): array
    {
        return app(TourismService::class)->progress();
    }

    public function render()
    {
        return view('livewire.tourism-config', [
            'cities' => $this->cities,
            'progress' => $this->progress,
        ])->layout('layouts.app');
    }
}
