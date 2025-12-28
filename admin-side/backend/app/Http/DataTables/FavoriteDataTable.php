<?php

namespace App\Http\DataTables;

class FavoriteDataTable extends DataTable
{
    protected $table = 'favorites';
    protected $primaryKey = 'id';

    protected function setColumns()
    {
        $this->columns = ['id', 'user_id', 'product_id', 'created_at'];
        $this->searchableColumns = [];
        $this->orderableColumns = [
            0 => 'favorites.id',
            1 => 'favorites.user_id',
            2 => 'favorites.product_id',
            3 => 'favorites.created_at',
        ];
    }

    protected function applyJoins($query)
    {
        $query->leftJoin('users', 'favorites.user_id', '=', 'users.id')
              ->leftJoin('products', 'favorites.product_id', '=', 'products.id')
              ->select('favorites.*', 'users.email as user_email', 'products.name as product_name');
    }

    protected function formatRow($item)
    {
        return [
            $item->id,
            $item->user_email ?? '-',
            $item->product_name ?? '-',
            $item->created_at,
            $this->getActionButtons($item),
        ];
    }
}

