<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ShopFilterController extends Controller
{
    public function index()
    {
        // 1. Brands with product counts
        $brands = DB::table('brands')
            ->leftJoin('products', function ($join) {
                $join->on('brands.id', '=', 'products.brand_id')
                    ->where('products.is_active', '=', 1);
            })
            ->groupBy('brands.id', 'brands.name', 'brands.slug')
            ->select(
                'brands.id',
                'brands.name',
                'brands.slug',
                DB::raw('COUNT(products.id) as productCount')
            )
            // ->having('productCount', '>', 0) // Removed to show all brands
            ->orderBy('brands.name', 'asc')
            ->get();

        // 2. Categories with product counts
        $categories = DB::table('categories')
            ->leftJoin('product_categories', 'categories.id', '=', 'product_categories.category_id')
            ->leftJoin('products', function ($join) {
                $join->on('product_categories.product_id', '=', 'products.id')
                    ->where('products.is_active', '=', 1);
            })
            ->groupBy('categories.id', 'categories.name', 'categories.slug', 'categories.parent_id')
            ->select(
                'categories.id',
                'categories.name',
                'categories.slug',
                'categories.parent_id',
                DB::raw('COUNT(products.id) as productCount')
            )
            ->having('productCount', '>', 0) // Optional
            ->orderBy('categories.name', 'asc')
            ->get();

        // 3. Colors (from variants of active products)
        $colors = DB::table('product_variants')
            ->join('products', 'product_variants.product_id', '=', 'products.id')
            ->where('products.is_active', 1)
            ->whereNotNull('product_variants.color')
            ->where('product_variants.color', '!=', '')
            ->distinct()
            ->orderBy('product_variants.color')
            ->pluck('product_variants.color');

        // 4. Sizes (from variants of active products)
        // Join with sizes table to get the name
        $sizes = DB::table('product_variants')
            ->join('products', 'product_variants.product_id', '=', 'products.id')
            ->join('sizes', 'product_variants.size_id', '=', 'sizes.id')
            ->where('products.is_active', 1)
            ->select('sizes.name', 'sizes.display_order')
            ->distinct()
            ->orderBy('sizes.display_order', 'asc')
            ->get()
            ->pluck('name');

        // 5. Price Range
        $priceRange = DB::table('product_variants')
            ->join('products', 'product_variants.product_id', '=', 'products.id')
            ->where('products.is_active', 1)
            ->select(
                DB::raw('MIN(product_variants.price) as min_price'),
                DB::raw('MAX(product_variants.price) as max_price')
            )
            ->first();

        return response()->json([
            'brands' => $brands,
            'categories' => $categories,
            'colors' => $colors,
            'sizes' => $sizes,
            'price_range' => $priceRange,
        ]);
    }
}
