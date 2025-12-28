<?php

namespace App\Http\DataTables;

class OrderItemDataTable extends DataTable
{
    protected $table = 'order_items';
    protected $primaryKey = 'id';

    protected function setColumns()
    {
        $this->columns = ['id', 'order_id', 'variant_id', 'quantity', 'unit_price', 'line_total', 'created_at'];
        $this->searchableColumns = [];
        $this->orderableColumns = [
            0 => 'order_items.id',
            1 => 'order_items.order_id',
            2 => 'order_items.variant_id',
            3 => 'order_items.quantity',
            4 => 'order_items.unit_price',
            5 => 'order_items.line_total',
            6 => 'order_items.created_at',
        ];
    }

    protected function applyJoins($query)
    {
        $query->leftJoin('orders', 'order_items.order_id', '=', 'orders.id')
              ->leftJoin('product_variants', 'order_items.variant_id', '=', 'product_variants.id')
              ->select('order_items.*', 'orders.order_number', 'product_variants.sku');
    }

    protected function formatRow($item)
    {
        return [
            $item->id,
            $item->order_number ?? '-',
            $item->sku ?? '-',
            $item->quantity,
            number_format($item->unit_price, 2),
            number_format($item->line_total, 2),
            $item->created_at,
            $this->getActionButtons($item),
        ];
    }
}

