<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ShopCategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = DB::table('categories')
            ->leftJoin('product_categories', 'categories.id', '=', 'product_categories.category_id')
            ->leftJoin('products', function ($join) {
                $join->on('product_categories.product_id', '=', 'products.id')
                    ->where('products.is_active', '=', 1);
            })
            ->groupBy('categories.id', 'categories.name', 'categories.slug', 'categories.parent_id', 'categories.created_at', 'categories.updated_at')
            ->select(
                'categories.id',
                'categories.name',
                'categories.slug',
                'categories.parent_id',
                DB::raw('COUNT(products.id) as productCount')
            )
            ->orderBy('categories.name', 'asc')
            ->get();

        return response()->json($categories);
    }
}
