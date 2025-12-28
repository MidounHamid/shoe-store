<?php

namespace App\Http\DataTables;

class OrderEventDataTable extends DataTable
{
    protected $table = 'order_events';
    protected $primaryKey = 'id';

    protected function setColumns()
    {
        $this->columns = ['id', 'order_id', 'event_type', 'created_at'];
        $this->searchableColumns = ['order_events.event_type'];
        $this->orderableColumns = [
            0 => 'order_events.id',
            1 => 'order_events.order_id',
            2 => 'order_events.event_type',
            3 => 'order_events.created_at',
        ];
    }

    protected function applyJoins($query)
    {
        $query->leftJoin('orders', 'order_events.order_id', '=', 'orders.id')
              ->select('order_events.*', 'orders.order_number');
    }

    protected function formatRow($item)
    {
        return [
            $item->id,
            $item->order_number ?? '-',
            $item->event_type,
            $item->created_at,
            $this->getActionButtons($item),
        ];
    }
}

