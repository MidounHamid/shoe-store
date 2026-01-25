<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ShopBrandController extends Controller
{
    public function index(Request $request)
    {
        $brands = DB::table('brands')
            ->leftJoin('products', function ($join) {
                $join->on('brands.id', '=', 'products.brand_id')
                    ->where('products.is_active', '=', 1);
            })
            ->groupBy('brands.id', 'brands.name', 'brands.slug', 'brands.created_at', 'brands.updated_at')
            ->select(
                'brands.id',
                'brands.name',
                'brands.slug',
                DB::raw('COUNT(products.id) as productCount')
            )
            ->orderBy('brands.name', 'asc')
            ->get();

        return response()->json($brands);
    }
}
