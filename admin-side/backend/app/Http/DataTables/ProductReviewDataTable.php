<?php

namespace App\Http\DataTables;

class ProductReviewDataTable extends DataTable
{
    protected $table = 'product_reviews';
    protected $primaryKey = 'id';

    protected function setColumns()
    {
        $this->columns = ['id', 'product_id', 'user_id', 'rating', 'title', 'helpful_count', 'created_at'];
        $this->searchableColumns = ['product_reviews.title', 'product_reviews.body'];
        $this->orderableColumns = [
            0 => 'product_reviews.id',
            1 => 'product_reviews.product_id',
            2 => 'product_reviews.user_id',
            3 => 'product_reviews.rating',
            4 => 'product_reviews.title',
            5 => 'product_reviews.helpful_count',
            6 => 'product_reviews.created_at',
        ];
    }

    protected function applyJoins($query)
    {
        $query->leftJoin('products', 'product_reviews.product_id', '=', 'products.id')
              ->leftJoin('users', 'product_reviews.user_id', '=', 'users.id')
              ->select('product_reviews.*', 'products.name as product_name', 'users.email as user_email');
    }

    protected function formatRow($item)
    {
        return [
            $item->id,
            $item->product_name ?? '-',
            $item->user_email ?? 'Guest',
            $item->rating . '/5',
            $item->title ?? '-',
            $item->helpful_count ?? 0,
            $item->created_at,
            $this->getActionButtons($item),
        ];
    }
}

