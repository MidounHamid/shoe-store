<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreFavoriteRequest;

class FavoriteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = DB::table('favorites')
            ->join('products', 'favorites.product_id', '=', 'products.id')
            ->join('users', 'favorites.user_id', '=', 'users.id')
            ->select('favorites.*', 'products.name as product_name', 'users.email as user_email');

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('favorites.user_id', $request->user_id);
        }

        // Filter by product
        if ($request->has('product_id')) {
            $query->where('favorites.product_id', $request->product_id);
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $favorites = $query->orderBy('favorites.created_at', 'desc')->paginate($perPage);

        return response()->json($favorites);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFavoriteRequest $request)
    {

        // Check if already favorited
        $existing = DB::table('favorites')
            ->where('user_id', $request->user_id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Product already in favorites'], 422);
        }

        $data = [
            'user_id' => $request->user_id,
            'product_id' => $request->product_id,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        $id = DB::table('favorites')->insertGetId($data);
        $favorite = DB::table('favorites')
            ->join('products', 'favorites.product_id', '=', 'products.id')
            ->join('users', 'favorites.user_id', '=', 'users.id')
            ->select('favorites.*', 'products.name as product_name', 'users.email as user_email')
            ->where('favorites.id', $id)
            ->first();

        return response()->json($favorite, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $favorite = DB::table('favorites')
            ->join('products', 'favorites.product_id', '=', 'products.id')
            ->join('users', 'favorites.user_id', '=', 'users.id')
            ->select('favorites.*', 'products.name as product_name', 'users.email as user_email')
            ->where('favorites.id', $id)
            ->first();

        if (!$favorite) {
            return response()->json(['message' => 'Favorite not found'], 404);
        }

        return response()->json($favorite);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $favorite = DB::table('favorites')->where('id', $id)->first();

        if (!$favorite) {
            return response()->json(['message' => 'Favorite not found'], 404);
        }

        DB::table('favorites')->where('id', $id)->delete();

        return response()->json(['message' => 'Favorite removed successfully']);
    }

    /**
     * Remove favorite by user and product
     */
    public function removeByUserAndProduct(StoreFavoriteRequest $request)
    {

        $deleted = DB::table('favorites')
            ->where('user_id', $request->user_id)
            ->where('product_id', $request->product_id)
            ->delete();

        if ($deleted) {
            return response()->json(['message' => 'Favorite removed successfully']);
        }

        return response()->json(['message' => 'Favorite not found'], 404);
    }
}
