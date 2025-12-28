<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = DB::table('products')
            ->leftJoin('brands', 'products.brand_id', '=', 'brands.id')
            ->select('products.*', 'brands.name as brand_name');

        // Filter by brand
        if ($request->has('brand_id')) {
            $query->where('products.brand_id', $request->brand_id);
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('products.is_active', $request->is_active);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('products.name', 'like', "%{$search}%")
                  ->orWhere('products.slug', 'like', "%{$search}%");
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $products = $query->orderBy('products.created_at', 'desc')->paginate($perPage);

        return response()->json($products);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request)
    {

        $data = [
            'brand_id' => $request->brand_id,
            'name' => $request->name,
            'slug' => $request->slug ?? Str::slug($request->name),
            'short_description' => $request->short_description,
            'description' => $request->description,
            'default_image' => $request->default_image,
            'is_active' => $request->get('is_active', true),
            'created_at' => now(),
            'updated_at' => now(),
        ];

        $id = DB::table('products')->insertGetId($data);
        $product = DB::table('products')
            ->leftJoin('brands', 'products.brand_id', '=', 'brands.id')
            ->select('products.*', 'brands.name as brand_name')
            ->where('products.id', $id)
            ->first();

        return response()->json($product, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $product = DB::table('products')
            ->leftJoin('brands', 'products.brand_id', '=', 'brands.id')
            ->select('products.*', 'brands.name as brand_name')
            ->where('products.id', $id)
            ->first();

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        // Get categories
        $categories = DB::table('product_categories')
            ->join('categories', 'product_categories.category_id', '=', 'categories.id')
            ->where('product_categories.product_id', $id)
            ->select('categories.*')
            ->get();

        // Get tags
        $tags = DB::table('product_tags')
            ->join('tags', 'product_tags.tag_id', '=', 'tags.id')
            ->where('product_tags.product_id', $id)
            ->select('tags.*')
            ->get();

        $product->categories = $categories;
        $product->tags = $tags;

        return response()->json($product);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, $id)
    {
        $product = DB::table('products')->where('id', $id)->first();

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $data = [
            'updated_at' => now(),
        ];

        if ($request->has('brand_id')) $data['brand_id'] = $request->brand_id;
        if ($request->has('name')) {
            $data['name'] = $request->name;
            if (!$request->has('slug')) {
                $data['slug'] = Str::slug($request->name);
            }
        }
        if ($request->has('slug')) $data['slug'] = $request->slug;
        if ($request->has('short_description')) $data['short_description'] = $request->short_description;
        if ($request->has('description')) $data['description'] = $request->description;
        if ($request->has('default_image')) $data['default_image'] = $request->default_image;
        if ($request->has('is_active')) $data['is_active'] = $request->is_active;

        DB::table('products')->where('id', $id)->update($data);
        $product = DB::table('products')
            ->leftJoin('brands', 'products.brand_id', '=', 'brands.id')
            ->select('products.*', 'brands.name as brand_name')
            ->where('products.id', $id)
            ->first();

        return response()->json($product);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $product = DB::table('products')->where('id', $id)->first();

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        DB::table('products')->where('id', $id)->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }
}
