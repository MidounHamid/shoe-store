<?php

namespace App\Http\DataTables;

class OrderDataTable extends DataTable
{
    protected $table = 'orders';
    protected $primaryKey = 'id';

    protected function setColumns()
    {
        $this->columns = ['id', 'order_number', 'user_id', 'total_amount', 'status', 'payment_status', 'created_at'];
        $this->searchableColumns = ['orders.order_number'];
        $this->orderableColumns = [
            0 => 'orders.id',
            1 => 'orders.order_number',
            2 => 'orders.user_id',
            3 => 'orders.total_amount',
            4 => 'orders.status',
            5 => 'orders.payment_status',
            6 => 'orders.created_at',
        ];
    }

    protected function applyJoins($query)
    {
        $query->leftJoin('users', 'orders.user_id', '=', 'users.id')
              ->select('orders.*', 'users.email as user_email');
    }

    protected function formatRow($item)
    {
        return [
            $item->id,
            $item->order_number,
            $item->user_email ?? 'Guest',
            number_format($item->total_amount, 2),
            ucfirst($item->status),
            ucfirst($item->payment_status),
            $item->created_at,
            $this->getActionButtons($item),
        ];
    }
}

