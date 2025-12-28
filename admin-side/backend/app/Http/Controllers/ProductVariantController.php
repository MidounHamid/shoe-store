<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreProductVariantRequest;
use App\Http\Requests\UpdateProductVariantRequest;

class ProductVariantController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = DB::table('product_variants')
            ->leftJoin('products', 'product_variants.product_id', '=', 'products.id')
            ->select('product_variants.*', 'products.name as product_name');

        // Filter by product
        if ($request->has('product_id')) {
            $query->where('product_variants.product_id', $request->product_id);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('product_variants.sku', 'like', "%{$search}%")
                  ->orWhere('products.name', 'like', "%{$search}%");
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $variants = $query->orderBy('product_variants.created_at', 'desc')->paginate($perPage);

        return response()->json($variants);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductVariantRequest $request)
    {

        $data = [
            'product_id' => $request->product_id,
            'sku' => $request->sku,
            'size' => $request->size,
            'color' => $request->color,
            'price' => $request->price,
            'original_price' => $request->original_price,
            'stock' => $request->get('stock', 0),
            'attributes' => $request->attributes ? json_encode($request->attributes) : null,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        $id = DB::table('product_variants')->insertGetId($data);
        $variant = DB::table('product_variants')
            ->leftJoin('products', 'product_variants.product_id', '=', 'products.id')
            ->select('product_variants.*', 'products.name as product_name')
            ->where('product_variants.id', $id)
            ->first();

        if ($variant->attributes) {
            $variant->attributes = json_decode($variant->attributes, true);
        }

        return response()->json($variant, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $variant = DB::table('product_variants')
            ->leftJoin('products', 'product_variants.product_id', '=', 'products.id')
            ->select('product_variants.*', 'products.name as product_name')
            ->where('product_variants.id', $id)
            ->first();

        if (!$variant) {
            return response()->json(['message' => 'Product variant not found'], 404);
        }

        if ($variant->attributes) {
            $variant->attributes = json_decode($variant->attributes, true);
        }

        return response()->json($variant);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductVariantRequest $request, $id)
    {
        $variant = DB::table('product_variants')->where('id', $id)->first();

        if (!$variant) {
            return response()->json(['message' => 'Product variant not found'], 404);
        }

        $data = [
            'updated_at' => now(),
        ];

        if ($request->has('product_id')) $data['product_id'] = $request->product_id;
        if ($request->has('sku')) $data['sku'] = $request->sku;
        if ($request->has('size')) $data['size'] = $request->size;
        if ($request->has('color')) $data['color'] = $request->color;
        if ($request->has('price')) $data['price'] = $request->price;
        if ($request->has('original_price')) $data['original_price'] = $request->original_price;
        if ($request->has('stock')) $data['stock'] = $request->stock;
        if ($request->has('attributes')) $data['attributes'] = json_encode($request->attributes);

        DB::table('product_variants')->where('id', $id)->update($data);
        $variant = DB::table('product_variants')
            ->leftJoin('products', 'product_variants.product_id', '=', 'products.id')
            ->select('product_variants.*', 'products.name as product_name')
            ->where('product_variants.id', $id)
            ->first();

        if ($variant->attributes) {
            $variant->attributes = json_decode($variant->attributes, true);
        }

        return response()->json($variant);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $variant = DB::table('product_variants')->where('id', $id)->first();

        if (!$variant) {
            return response()->json(['message' => 'Product variant not found'], 404);
        }

        DB::table('product_variants')->where('id', $id)->delete();

        return response()->json(['message' => 'Product variant deleted successfully']);
    }
}
