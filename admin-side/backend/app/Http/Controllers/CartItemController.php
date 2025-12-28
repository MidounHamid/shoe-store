<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class CartItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = DB::table('cart_items')
            ->join('product_variants', 'cart_items.variant_id', '=', 'product_variants.id')
            ->join('products', 'product_variants.product_id', '=', 'products.id')
            ->select('cart_items.*', 'product_variants.sku', 'product_variants.size', 'product_variants.color', 'products.name as product_name');

        // Filter by cart
        if ($request->has('cart_id')) {
            $query->where('cart_items.cart_id', $request->cart_id);
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $items = $query->orderBy('cart_items.created_at', 'desc')->paginate($perPage);

        return response()->json($items);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cart_id' => 'required|exists:carts,id',
            'variant_id' => 'required|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if item already exists in cart
        $existing = DB::table('cart_items')
            ->where('cart_id', $request->cart_id)
            ->where('variant_id', $request->variant_id)
            ->first();

        if ($existing) {
            // Update quantity
            $data = [
                'quantity' => $existing->quantity + $request->quantity,
                'price' => $request->price,
                'updated_at' => now(),
            ];
            DB::table('cart_items')->where('id', $existing->id)->update($data);
            $item = DB::table('cart_items')
                ->join('product_variants', 'cart_items.variant_id', '=', 'product_variants.id')
                ->join('products', 'product_variants.product_id', '=', 'products.id')
                ->select('cart_items.*', 'product_variants.sku', 'product_variants.size', 'product_variants.color', 'products.name as product_name')
                ->where('cart_items.id', $existing->id)
                ->first();
        } else {
            $data = [
                'cart_id' => $request->cart_id,
                'variant_id' => $request->variant_id,
                'quantity' => $request->quantity,
                'price' => $request->price,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            $id = DB::table('cart_items')->insertGetId($data);
            $item = DB::table('cart_items')
                ->join('product_variants', 'cart_items.variant_id', '=', 'product_variants.id')
                ->join('products', 'product_variants.product_id', '=', 'products.id')
                ->select('cart_items.*', 'product_variants.sku', 'product_variants.size', 'product_variants.color', 'products.name as product_name')
                ->where('cart_items.id', $id)
                ->first();
        }

        return response()->json($item, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $item = DB::table('cart_items')
            ->join('product_variants', 'cart_items.variant_id', '=', 'product_variants.id')
            ->join('products', 'product_variants.product_id', '=', 'products.id')
            ->select('cart_items.*', 'product_variants.sku', 'product_variants.size', 'product_variants.color', 'products.name as product_name')
            ->where('cart_items.id', $id)
            ->first();

        if (!$item) {
            return response()->json(['message' => 'Cart item not found'], 404);
        }

        return response()->json($item);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $item = DB::table('cart_items')->where('id', $id)->first();

        if (!$item) {
            return response()->json(['message' => 'Cart item not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'quantity' => 'sometimes|required|integer|min:1',
            'price' => 'sometimes|required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = [
            'updated_at' => now(),
        ];

        if ($request->has('quantity')) $data['quantity'] = $request->quantity;
        if ($request->has('price')) $data['price'] = $request->price;

        DB::table('cart_items')->where('id', $id)->update($data);
        $item = DB::table('cart_items')
            ->join('product_variants', 'cart_items.variant_id', '=', 'product_variants.id')
            ->join('products', 'product_variants.product_id', '=', 'products.id')
            ->select('cart_items.*', 'product_variants.sku', 'product_variants.size', 'product_variants.color', 'products.name as product_name')
            ->where('cart_items.id', $id)
            ->first();

        return response()->json($item);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $item = DB::table('cart_items')->where('id', $id)->first();

        if (!$item) {
            return response()->json(['message' => 'Cart item not found'], 404);
        }

        DB::table('cart_items')->where('id', $id)->delete();

        return response()->json(['message' => 'Cart item deleted successfully']);
    }
}
