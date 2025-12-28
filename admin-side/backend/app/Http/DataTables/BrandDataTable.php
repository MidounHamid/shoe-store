<?php

namespace App\Http\DataTables;

class BrandDataTable extends DataTable
{
    protected $table = 'brands';
    protected $primaryKey = 'id';

    protected function setColumns()
    {
        $this->columns = ['id', 'name', 'slug', 'created_at'];
        $this->searchableColumns = ['name', 'slug'];
        $this->orderableColumns = [
            0 => 'brands.id',
            1 => 'brands.name',
            2 => 'brands.slug',
            3 => 'brands.created_at',
        ];
    }

    protected function formatRow($item)
    {
        return [
            $item->id,
            $item->name,
            $item->slug,
            $item->created_at,
            $this->getActionButtons($item),
        ];
    }
}

