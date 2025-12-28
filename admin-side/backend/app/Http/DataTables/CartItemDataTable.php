<?php

namespace App\Http\DataTables;

class CartItemDataTable extends DataTable
{
    protected $table = 'cart_items';
    protected $primaryKey = 'id';

    protected function setColumns()
    {
        $this->columns = ['id', 'cart_id', 'variant_id', 'quantity', 'price', 'created_at'];
        $this->searchableColumns = [];
        $this->orderableColumns = [
            0 => 'cart_items.id',
            1 => 'cart_items.cart_id',
            2 => 'cart_items.variant_id',
            3 => 'cart_items.quantity',
            4 => 'cart_items.price',
            5 => 'cart_items.created_at',
        ];
    }

    protected function applyJoins($query)
    {
        $query->leftJoin('product_variants', 'cart_items.variant_id', '=', 'product_variants.id')
              ->leftJoin('products', 'product_variants.product_id', '=', 'products.id')
              ->select('cart_items.*', 'products.name as product_name', 'product_variants.sku');
    }

    protected function formatRow($item)
    {
        return [
            $item->id,
            $item->cart_id,
            $item->product_name ?? '-',
            $item->quantity,
            number_format($item->price, 2),
            $item->created_at,
            $this->getActionButtons($item),
        ];
    }
}

