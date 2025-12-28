<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductFeature extends Model
{
    protected $fillable = [
        'product_id',
        'feature_text',
        'display_order',
    ];
}
