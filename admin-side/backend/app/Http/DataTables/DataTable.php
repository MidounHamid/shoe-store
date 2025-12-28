<?php

namespace App\Http\DataTables;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

abstract class DataTable
{
    protected $table;
    protected $primaryKey = 'id';
    protected $columns = [];
    protected $searchableColumns = [];
    protected $orderableColumns = [];

    public function __construct()
    {
        $this->setColumns();
    }

    abstract protected function setColumns();

    public function getData(Request $request)
    {
        $query = DB::table($this->table);

        // Apply joins if needed
        $this->applyJoins($query);

        // Get total records count
        $totalRecords = $this->getTotalRecords($query);

        // Apply search
        $this->applySearch($query, $request);

        // Get filtered count
        $filteredRecords = $this->getFilteredRecords($query);

        // Apply ordering
        $this->applyOrdering($query, $request);

        // Apply pagination
        $this->applyPagination($query, $request);

        // Get data
        $data = $query->get();

        // Format data
        $formattedData = $this->formatData($data);

        return [
            'draw' => (int) $request->get('draw', 1),
            'recordsTotal' => $totalRecords,
            'recordsFiltered' => $filteredRecords,
            'data' => $formattedData,
        ];
    }

    protected function applyJoins($query)
    {
        // Override in child classes if joins are needed
    }

    protected function getTotalRecords($query)
    {
        $baseQuery = DB::table($this->table);
        $this->applyJoins($baseQuery);
        return $baseQuery->count();
    }

    protected function getFilteredRecords($query)
    {
        return $query->count();
    }

    protected function applySearch($query, Request $request)
    {
        $search = $request->get('search', []);
        $searchValue = $search['value'] ?? '';

        if (empty($searchValue) || empty($this->searchableColumns)) {
            return;
        }

        $query->where(function ($q) use ($searchValue) {
            foreach ($this->searchableColumns as $index => $column) {
                if ($index === 0) {
                    $q->where($column, 'like', "%{$searchValue}%");
                } else {
                    $q->orWhere($column, 'like', "%{$searchValue}%");
                }
            }
        });
    }

    protected function applyOrdering($query, Request $request)
    {
        $order = $request->get('order', []);
        
        if (empty($order) || empty($this->orderableColumns)) {
            $query->orderBy($this->table . '.' . $this->primaryKey, 'desc');
            return;
        }

        $orderColumn = $order[0]['column'] ?? 0;
        $orderDir = $order[0]['dir'] ?? 'asc';

        if (isset($this->orderableColumns[$orderColumn])) {
            $query->orderBy($this->orderableColumns[$orderColumn], $orderDir);
        } else {
            $query->orderBy($this->table . '.' . $this->primaryKey, 'desc');
        }
    }

    protected function applyPagination($query, Request $request)
    {
        $start = (int) $request->get('start', 0);
        $length = (int) $request->get('length', 10);

        if ($length > 0) {
            $query->skip($start)->take($length);
        }
    }

    protected function formatData($data)
    {
        return $data->map(function ($item) {
            return $this->formatRow($item);
        })->toArray();
    }

    protected function formatRow($item)
    {
        $row = [];
        foreach ($this->columns as $column) {
            $row[] = $item->$column ?? '';
        }
        // Add action buttons
        $row[] = $this->getActionButtons($item);
        return $row;
    }

    protected function getActionButtons($item)
    {
        $id = $item->{$this->primaryKey};
        return '<div class="flex gap-2">
            <button class="btn-edit" data-id="' . $id . '">Edit</button>
            <button class="btn-delete" data-id="' . $id . '">Delete</button>
        </div>';
    }
}

