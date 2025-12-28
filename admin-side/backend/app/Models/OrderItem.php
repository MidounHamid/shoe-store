<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'variant_id',
        'product_snapshot',
        'quantity',
        'unit_price',
        'line_total',
    ];

    protected function casts(): array
    {
        return [
            'product_snapshot' => 'array',
            'unit_price' => 'decimal:2',
            'line_total' => 'decimal:2',
        ];
    }
}
