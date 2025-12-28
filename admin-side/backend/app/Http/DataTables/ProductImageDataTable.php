<?php

namespace App\Http\DataTables;

class ProductImageDataTable extends DataTable
{
    protected $table = 'product_images';
    protected $primaryKey = 'id';

    protected function setColumns()
    {
        $this->columns = ['id', 'product_id', 'variant_id', 'image_url', 'display_order', 'created_at'];
        $this->searchableColumns = ['product_images.image_url'];
        $this->orderableColumns = [
            0 => 'product_images.id',
            1 => 'product_images.product_id',
            2 => 'product_images.variant_id',
            3 => 'product_images.display_order',
            4 => 'product_images.created_at',
        ];
    }

    protected function applyJoins($query)
    {
        $query->leftJoin('products', 'product_images.product_id', '=', 'products.id')
              ->select('product_images.*', 'products.name as product_name');
    }

    protected function formatRow($item)
    {
        return [
            $item->id,
            $item->product_name ?? '-',
            $item->variant_id ?? '-',
            '<img src="' . $item->image_url . '" alt="Image" class="w-16 h-16 object-cover">',
            $item->display_order,
            $item->created_at,
            $this->getActionButtons($item),
        ];
    }
}

