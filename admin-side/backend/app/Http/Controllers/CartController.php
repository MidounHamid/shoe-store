<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Http\Requests\StoreCartRequest;
use App\Http\Requests\UpdateCartRequest;

class CartController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = DB::table('carts')
            ->leftJoin('users', 'carts.user_id', '=', 'users.id')
            ->select('carts.*', 'users.email as user_email');

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('carts.user_id', $request->user_id);
        }

        // Filter by session_token
        if ($request->has('session_token')) {
            $query->where('carts.session_token', $request->session_token);
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $carts = $query->orderBy('carts.created_at', 'desc')->paginate($perPage);

        return response()->json($carts);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCartRequest $request)
    {

        // Generate session token if not provided
        $sessionToken = $request->session_token ?? Str::uuid()->toString();

        $data = [
            'user_id' => $request->user_id,
            'session_token' => $sessionToken,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        $id = DB::table('carts')->insertGetId($data);
        $cart = DB::table('carts')
            ->leftJoin('users', 'carts.user_id', '=', 'users.id')
            ->select('carts.*', 'users.email as user_email')
            ->where('carts.id', $id)
            ->first();

        return response()->json($cart, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $cart = DB::table('carts')
            ->leftJoin('users', 'carts.user_id', '=', 'users.id')
            ->select('carts.*', 'users.email as user_email')
            ->where('carts.id', $id)
            ->first();

        if (!$cart) {
            return response()->json(['message' => 'Cart not found'], 404);
        }

        // Get cart items
        $items = DB::table('cart_items')
            ->join('product_variants', 'cart_items.variant_id', '=', 'product_variants.id')
            ->join('products', 'product_variants.product_id', '=', 'products.id')
            ->where('cart_items.cart_id', $id)
            ->select('cart_items.*', 'product_variants.sku', 'product_variants.size', 'product_variants.color', 'products.name as product_name')
            ->get();

        $cart->items = $items;

        return response()->json($cart);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCartRequest $request, $id)
    {
        $cart = DB::table('carts')->where('id', $id)->first();

        if (!$cart) {
            return response()->json(['message' => 'Cart not found'], 404);
        }

        $data = [
            'updated_at' => now(),
        ];

        if ($request->has('user_id')) $data['user_id'] = $request->user_id;
        if ($request->has('session_token')) $data['session_token'] = $request->session_token;

        DB::table('carts')->where('id', $id)->update($data);
        $cart = DB::table('carts')
            ->leftJoin('users', 'carts.user_id', '=', 'users.id')
            ->select('carts.*', 'users.email as user_email')
            ->where('carts.id', $id)
            ->first();

        return response()->json($cart);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $cart = DB::table('carts')->where('id', $id)->first();

        if (!$cart) {
            return response()->json(['message' => 'Cart not found'], 404);
        }

        DB::table('carts')->where('id', $id)->delete();

        return response()->json(['message' => 'Cart deleted successfully']);
    }
}
