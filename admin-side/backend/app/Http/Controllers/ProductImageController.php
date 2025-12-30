<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreProductImageRequest;
use App\Http\Requests\UpdateProductImageRequest;

class ProductImageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = DB::table('product_images')
            ->join('products', 'product_images.product_id', '=', 'products.id')
            ->select('product_images.*', 'products.name as product_name');

        // Filter by product
        if ($request->has('product_id')) {
            $query->where('product_images.product_id', $request->product_id);
        }

        // Filter by variant
        if ($request->has('variant_id')) {
            $query->where('product_images.variant_id', $request->variant_id);
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $images = $query->orderBy('product_images.display_order', 'asc')
            ->orderBy('product_images.id', 'asc')
            ->paginate($perPage);

        return response()->json($images);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductImageRequest $request)
    {

        // If this is set as principal, unset other principal images for this product
        if ($request->get('is_principal', false)) {
            DB::table('product_images')
                ->where('product_id', $request->product_id)
                ->update(['is_principal' => false]);
        }

        $data = [
            'product_id' => $request->product_id,
            'variant_id' => $request->variant_id,
            'image_url' => $request->image_url,
            'display_order' => $request->get('display_order', 0),
            'is_principal' => $request->get('is_principal', false),
        ];

        $id = DB::table('product_images')->insertGetId($data);
        $image = DB::table('product_images')
            ->join('products', 'product_images.product_id', '=', 'products.id')
            ->select('product_images.*', 'products.name as product_name')
            ->where('product_images.id', $id)
            ->first();

        return response()->json($image, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $image = DB::table('product_images')
            ->join('products', 'product_images.product_id', '=', 'products.id')
            ->select('product_images.*', 'products.name as product_name')
            ->where('product_images.id', $id)
            ->first();

        if (!$image) {
            return response()->json(['message' => 'Product image not found'], 404);
        }

        return response()->json($image);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductImageRequest $request, $id)
    {
        $image = DB::table('product_images')->where('id', $id)->first();

        if (!$image) {
            return response()->json(['message' => 'Product image not found'], 404);
        }

        $data = [];

        // If this is set as principal, unset other principal images for this product
        if ($request->has('is_principal') && $request->is_principal) {
            $currentImage = DB::table('product_images')->where('id', $id)->first();
            if ($currentImage) {
                DB::table('product_images')
                    ->where('product_id', $currentImage->product_id)
                    ->where('id', '!=', $id)
                    ->update(['is_principal' => false]);
            }
        }

        if ($request->has('product_id')) $data['product_id'] = $request->product_id;
        if ($request->has('variant_id')) $data['variant_id'] = $request->variant_id;
        if ($request->has('image_url')) $data['image_url'] = $request->image_url;
        if ($request->has('display_order')) $data['display_order'] = $request->display_order;
        if ($request->has('is_principal')) $data['is_principal'] = $request->is_principal;

        DB::table('product_images')->where('id', $id)->update($data);
        $image = DB::table('product_images')
            ->join('products', 'product_images.product_id', '=', 'products.id')
            ->select('product_images.*', 'products.name as product_name')
            ->where('product_images.id', $id)
            ->first();

        return response()->json($image);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $image = DB::table('product_images')->where('id', $id)->first();

        if (!$image) {
            return response()->json(['message' => 'Product image not found'], 404);
        }

        DB::table('product_images')->where('id', $id)->delete();

        return response()->json(['message' => 'Product image deleted successfully']);
    }
}
