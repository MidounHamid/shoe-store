<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreProductReviewRequest;
use App\Http\Requests\UpdateProductReviewRequest;

class ProductReviewController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = DB::table('product_reviews')
            ->join('products', 'product_reviews.product_id', '=', 'products.id')
            ->leftJoin('users', 'product_reviews.user_id', '=', 'users.id')
            ->select('product_reviews.*', 'products.name as product_name', 'users.email as user_email');

        // Filter by product
        if ($request->has('product_id')) {
            $query->where('product_reviews.product_id', $request->product_id);
        }

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('product_reviews.user_id', $request->user_id);
        }

        // Filter by rating
        if ($request->has('rating')) {
            $query->where('product_reviews.rating', $request->rating);
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $reviews = $query->orderBy('product_reviews.created_at', 'desc')->paginate($perPage);

        return response()->json($reviews);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductReviewRequest $request)
    {

        $data = [
            'product_id' => $request->product_id,
            'user_id' => $request->user_id,
            'rating' => $request->rating,
            'title' => $request->title,
            'body' => $request->body,
            'verified_order_item_id' => $request->verified_order_item_id,
            'helpful_count' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        $id = DB::table('product_reviews')->insertGetId($data);
        $review = DB::table('product_reviews')
            ->join('products', 'product_reviews.product_id', '=', 'products.id')
            ->leftJoin('users', 'product_reviews.user_id', '=', 'users.id')
            ->select('product_reviews.*', 'products.name as product_name', 'users.email as user_email')
            ->where('product_reviews.id', $id)
            ->first();

        return response()->json($review, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $review = DB::table('product_reviews')
            ->join('products', 'product_reviews.product_id', '=', 'products.id')
            ->leftJoin('users', 'product_reviews.user_id', '=', 'users.id')
            ->select('product_reviews.*', 'products.name as product_name', 'users.email as user_email')
            ->where('product_reviews.id', $id)
            ->first();

        if (!$review) {
            return response()->json(['message' => 'Product review not found'], 404);
        }

        return response()->json($review);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductReviewRequest $request, $id)
    {
        $review = DB::table('product_reviews')->where('id', $id)->first();

        if (!$review) {
            return response()->json(['message' => 'Product review not found'], 404);
        }

        $data = [
            'updated_at' => now(),
        ];

        if ($request->has('rating')) $data['rating'] = $request->rating;
        if ($request->has('title')) $data['title'] = $request->title;
        if ($request->has('body')) $data['body'] = $request->body;
        if ($request->has('helpful_count')) $data['helpful_count'] = $request->helpful_count;

        DB::table('product_reviews')->where('id', $id)->update($data);
        $review = DB::table('product_reviews')
            ->join('products', 'product_reviews.product_id', '=', 'products.id')
            ->leftJoin('users', 'product_reviews.user_id', '=', 'users.id')
            ->select('product_reviews.*', 'products.name as product_name', 'users.email as user_email')
            ->where('product_reviews.id', $id)
            ->first();

        return response()->json($review);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $review = DB::table('product_reviews')->where('id', $id)->first();

        if (!$review) {
            return response()->json(['message' => 'Product review not found'], 404);
        }

        DB::table('product_reviews')->where('id', $id)->delete();

        return response()->json(['message' => 'Product review deleted successfully']);
    }
}
