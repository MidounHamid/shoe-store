<?php

namespace App\Http\DataTables;

class PaymentDataTable extends DataTable
{
    protected $table = 'payments';
    protected $primaryKey = 'id';

    protected function setColumns()
    {
        $this->columns = ['id', 'order_id', 'amount', 'currency', 'status', 'method', 'created_at'];
        $this->searchableColumns = ['payments.provider_payment_id'];
        $this->orderableColumns = [
            0 => 'payments.id',
            1 => 'payments.order_id',
            2 => 'payments.amount',
            3 => 'payments.currency',
            4 => 'payments.status',
            5 => 'payments.method',
            6 => 'payments.created_at',
        ];
    }

    protected function applyJoins($query)
    {
        $query->leftJoin('orders', 'payments.order_id', '=', 'orders.id')
              ->select('payments.*', 'orders.order_number');
    }

    protected function formatRow($item)
    {
        return [
            $item->id,
            $item->order_number ?? '-',
            number_format($item->amount, 2),
            $item->currency ?? 'USD',
            ucfirst($item->status),
            $item->method ?? '-',
            $item->created_at,
            $this->getActionButtons($item),
        ];
    }
}

