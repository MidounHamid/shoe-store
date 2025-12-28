<?php

namespace App\Http\DataTables;

class AddressDataTable extends DataTable
{
    protected $table = 'addresses';
    protected $primaryKey = 'id';

    protected function setColumns()
    {
        $this->columns = ['id', 'user_id', 'full_name', 'city', 'country', 'is_default', 'created_at'];
        $this->searchableColumns = ['addresses.full_name', 'addresses.city', 'addresses.country'];
        $this->orderableColumns = [
            0 => 'addresses.id',
            1 => 'addresses.full_name',
            2 => 'addresses.city',
            3 => 'addresses.country',
            4 => 'addresses.is_default',
            5 => 'addresses.created_at',
        ];
    }

    protected function applyJoins($query)
    {
        $query->leftJoin('users', 'addresses.user_id', '=', 'users.id')
              ->select('addresses.*', 'users.email as user_email');
    }

    protected function formatRow($item)
    {
        return [
            $item->id,
            $item->user_email ?? '-',
            $item->full_name,
            $item->city,
            $item->country,
            $item->is_default ? 'Yes' : 'No',
            $item->created_at,
            $this->getActionButtons($item),
        ];
    }
}

