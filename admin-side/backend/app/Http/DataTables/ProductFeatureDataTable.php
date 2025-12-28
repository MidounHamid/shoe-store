<?php

namespace App\Http\DataTables;

class ProductFeatureDataTable extends DataTable
{
    protected $table = 'product_features';
    protected $primaryKey = 'id';

    protected function setColumns()
    {
        $this->columns = ['id', 'product_id', 'feature_text', 'display_order', 'created_at'];
        $this->searchableColumns = ['product_features.feature_text'];
        $this->orderableColumns = [
            0 => 'product_features.id',
            1 => 'product_features.product_id',
            2 => 'product_features.feature_text',
            3 => 'product_features.display_order',
            4 => 'product_features.created_at',
        ];
    }

    protected function applyJoins($query)
    {
        $query->leftJoin('products', 'product_features.product_id', '=', 'products.id')
              ->select('product_features.*', 'products.name as product_name');
    }

    protected function formatRow($item)
    {
        return [
            $item->id,
            $item->product_name ?? '-',
            substr($item->feature_text, 0, 50) . (strlen($item->feature_text) > 50 ? '...' : ''),
            $item->display_order,
            $item->created_at,
            $this->getActionButtons($item),
        ];
    }
}

