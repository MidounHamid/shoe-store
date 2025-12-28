<?php

namespace App\Http\DataTables;

class ProductDataTable extends DataTable
{
    protected $table = 'products';
    protected $primaryKey = 'id';

    protected function setColumns()
    {
        $this->columns = ['id', 'name', 'slug', 'brand_id', 'is_active', 'created_at'];
        $this->searchableColumns = ['products.name', 'products.slug'];
        $this->orderableColumns = [
            0 => 'products.id',
            1 => 'products.name',
            2 => 'products.slug',
            3 => 'products.brand_id',
            4 => 'products.is_active',
            5 => 'products.created_at',
        ];
    }

    protected function applyJoins($query)
    {
        $query->leftJoin('brands', 'products.brand_id', '=', 'brands.id')
              ->select('products.*', 'brands.name as brand_name');
    }

    protected function formatRow($item)
    {
        return [
            $item->id,
            $item->name,
            $item->slug,
            $item->brand_name ?? '-',
            $item->is_active ? 'Active' : 'Inactive',
            $item->created_at,
            $this->getActionButtons($item),
        ];
    }
}

