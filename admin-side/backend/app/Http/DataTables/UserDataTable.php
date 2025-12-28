<?php

namespace App\Http\DataTables;

class UserDataTable extends DataTable
{
    protected $table = 'users';
    protected $primaryKey = 'id';

    protected function setColumns()
    {
        $this->columns = ['id', 'email', 'first_name', 'last_name', 'phone', 'role', 'email_verified', 'created_at'];
        $this->searchableColumns = ['email', 'first_name', 'last_name', 'phone'];
        $this->orderableColumns = [
            0 => 'users.id',
            1 => 'users.email',
            2 => 'users.first_name',
            3 => 'users.last_name',
            4 => 'users.phone',
            5 => 'users.role',
            6 => 'users.email_verified',
            7 => 'users.created_at',
        ];
    }

    protected function formatRow($item)
    {
        return [
            $item->id,
            $item->email,
            $item->first_name ?? '-',
            $item->last_name ?? '-',
            $item->phone ?? '-',
            ucfirst($item->role),
            $item->email_verified ? 'Yes' : 'No',
            $item->created_at,
            $this->getActionButtons($item),
        ];
    }
}

