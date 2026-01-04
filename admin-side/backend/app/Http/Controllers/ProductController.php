<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = DB::table('products')
            ->leftJoin('brands', 'products.brand_id', '=', 'brands.id')
            ->leftJoin('product_images', function ($join) {
                $join->on('products.id', '=', 'product_images.product_id')
                    ->whereNull('product_images.variant_id');
            })
            ->select(
                'products.*',
                'brands.name as brand_name',
                'product_images.main_image',
                'product_images.second_images'
            )
            ->orderBy('products.created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        // Format image URLs for each product
        $products->getCollection()->transform(function ($product) {
            $this->formatProductImages($product);
            return $product;
        });

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $id = DB::table('products')->insertGetId([
            'brand_id' => $request->brand_id,
            'name' => $request->name,
            'slug' => $request->slug ?? Str::slug($request->name),
            'short_description' => $request->short_description,
            'description' => $request->description,
            'is_active' => $request->is_active ?? true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['id' => $id, 'message' => 'Created'], 201);
    }

    public function show($id)
    {
        $product = DB::table('products')
            ->leftJoin('brands', 'products.brand_id', '=', 'brands.id')
            ->leftJoin('product_images', function ($join) {
                $join->on('products.id', '=', 'product_images.product_id')
                    ->whereNull('product_images.variant_id');
            })
            ->select(
                'products.*',
                'brands.name as brand_name',
                'product_images.main_image',
                'product_images.second_images'
            )
            ->where('products.id', $id)
            ->first();

        if (!$product) {
            return response()->json(['message' => 'Not found'], 404);
        }

        // Format image URLs
        $this->formatProductImages($product);

        return response()->json($product);
    }

    public function update(Request $request, $id)
    {
        DB::table('products')->where('id', $id)->update([
            'brand_id' => $request->brand_id,
            'name' => $request->name,
            'slug' => $request->slug,
            'short_description' => $request->short_description,
            'description' => $request->description,
            'is_active' => $request->is_active,
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Updated']);
    }

    public function destroy($id)
    {
        DB::table('products')->where('id', $id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    /**
     * Helper method to format image paths to full URLs
     */
    private function formatProductImages($product)
    {
        // Convert main_image path to full URL
        $product->main_image = $product->main_image
            ? asset('storage/' . $product->main_image)
            : null;

        // Convert second_images JSON to array of full URLs
        if ($product->second_images) {
            $secondPaths = json_decode($product->second_images, true);

            if (is_array($secondPaths)) {
                $product->second_images = array_map(function($path) {
                    return asset('storage/' . $path);
                }, $secondPaths);
            } else {
                $product->second_images = [];
            }
        } else {
            $product->second_images = [];
        }
    }
}
