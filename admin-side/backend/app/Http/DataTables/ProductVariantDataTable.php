<?php

namespace App\Http\DataTables;

class ProductVariantDataTable extends DataTable
{
    protected $table = 'product_variants';
    protected $primaryKey = 'id';

    protected function setColumns()
    {
        $this->columns = ['id', 'sku', 'product_id', 'size', 'color', 'price', 'stock', 'created_at'];
        $this->searchableColumns = ['product_variants.sku', 'product_variants.size', 'product_variants.color'];
        $this->orderableColumns = [
            0 => 'product_variants.id',
            1 => 'product_variants.sku',
            2 => 'product_variants.size',
            3 => 'product_variants.color',
            4 => 'product_variants.price',
            5 => 'product_variants.stock',
            6 => 'product_variants.created_at',
        ];
    }

    protected function applyJoins($query)
    {
        $query->leftJoin('products', 'product_variants.product_id', '=', 'products.id')
              ->select('product_variants.*', 'products.name as product_name');
    }

    protected function formatRow($item)
    {
        return [
            $item->id,
            $item->sku,
            $item->product_name ?? '-',
            $item->size ?? '-',
            $item->color ?? '-',
            number_format($item->price, 2),
            $item->stock,
            $item->created_at,
            $this->getActionButtons($item),
        ];
    }
}

