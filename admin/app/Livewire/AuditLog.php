<?php

namespace App\Livewire;

use App\Services\AuditService;
use Livewire\Component;
use Livewire\WithPagination;

/**
 * 操作审计日志：谁、何时、改了什么。RBAC 下所有写操作均留痕可溯。
 */
class AuditLog extends Component
{
    use WithPagination;

    public function getEntriesProperty()
    {
        return app(AuditService::class)->recent();
    }

    public function render()
    {
        return view('livewire.audit-log', [
            'entries' => $this->entries,
        ])->layout('layouts.app');
    }
}
