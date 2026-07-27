<?php

namespace App\Livewire;

use App\Services\MeritService;
use Livewire\Component;
use Livewire\WithPagination;

/**
 * 功德账本：全局流水 + 等级分布 + 异常预警。
 * 服务端强制「功德虚拟、不可提现」。
 */
class MeritLedger extends Component
{
    use WithPagination;

    public function getLedgerProperty()
    {
        return app(MeritService::class)->ledger();
    }

    public function getLevelsProperty()
    {
        return app(MeritService::class)->levelDistribution();
    }

    public function getAnomaliesProperty()
    {
        return app(MeritService::class)->anomalies();
    }

    public function render()
    {
        return view('livewire.merit-ledger', [
            'ledger' => $this->ledger,
            'levels' => $this->levels,
            'anomalies' => $this->anomalies,
        ])->layout('layouts.app');
    }
}
