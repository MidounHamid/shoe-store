<?php

namespace App\Http\DataTables;

use Illuminate\Support\Facades\DB;

class CategoryDataTable extends DataTable
{
    protected $table = 'categories';
    protected $primaryKey = 'id';

    protected function setColumns()
    {
        $this->columns = ['id', 'name', 'slug', 'parent_id', 'created_at'];
        $this->searchableColumns = ['categories.name', 'categories.slug'];
        $this->orderableColumns = [
            0 => 'categories.id',
            1 => 'categories.name',
            2 => 'categories.slug',
            3 => 'categories.parent_id',
            4 => 'categories.created_at',
        ];
    }

    protected function applyJoins($query)
    {
        $query->leftJoin('categories as parent', 'categories.parent_id', '=', 'parent.id')
              ->select('categories.*', 'parent.name as parent_name');
    }

    protected function formatRow($item)
    {
        return [
            $item->id,
            $item->name,
            $item->slug,
            $item->parent_name ?? 'Root',
            $item->created_at,
            $this->getActionButtons($item),
        ];
    }
}

