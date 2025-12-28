<?php

namespace App\Http\DataTables;

class CartDataTable extends DataTable
{
    protected $table = 'carts';
    protected $primaryKey = 'id';

    protected function setColumns()
    {
        $this->columns = ['id', 'user_id', 'session_token', 'created_at'];
        $this->searchableColumns = ['carts.session_token'];
        $this->orderableColumns = [
            0 => 'carts.id',
            1 => 'carts.user_id',
            2 => 'carts.session_token',
            3 => 'carts.created_at',
        ];
    }

    protected function applyJoins($query)
    {
        $query->leftJoin('users', 'carts.user_id', '=', 'users.id')
              ->select('carts.*', 'users.email as user_email');
    }

    protected function formatRow($item)
    {
        return [
            $item->id,
            $item->user_email ?? 'Guest',
            $item->session_token,
            $item->created_at,
            $this->getActionButtons($item),
        ];
    }
}

