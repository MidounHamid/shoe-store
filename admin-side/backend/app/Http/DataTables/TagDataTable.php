<?php

namespace App\Http\DataTables;

class TagDataTable extends DataTable
{
    protected $table = 'tags';
    protected $primaryKey = 'id';

    protected function setColumns()
    {
        $this->columns = ['id', 'name', 'slug', 'created_at'];
        $this->searchableColumns = ['name', 'slug'];
        $this->orderableColumns = [
            0 => 'tags.id',
            1 => 'tags.name',
            2 => 'tags.slug',
            3 => 'tags.created_at',
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

