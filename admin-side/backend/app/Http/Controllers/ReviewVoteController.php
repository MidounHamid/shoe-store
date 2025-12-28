<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ReviewVoteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = DB::table('review_votes')
            ->join('product_reviews', 'review_votes.review_id', '=', 'product_reviews.id')
            ->join('users', 'review_votes.user_id', '=', 'users.id')
            ->select('review_votes.*', 'product_reviews.rating', 'users.email as user_email');

        // Filter by review
        if ($request->has('review_id')) {
            $query->where('review_votes.review_id', $request->review_id);
        }

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('review_votes.user_id', $request->user_id);
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $votes = $query->orderBy('review_votes.created_at', 'desc')->paginate($perPage);

        return response()->json($votes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'review_id' => 'required|exists:product_reviews,id',
            'user_id' => 'required|exists:users,id',
            'vote' => 'required|integer|in:-1,1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if user already voted
        $existing = DB::table('review_votes')
            ->where('review_id', $request->review_id)
            ->where('user_id', $request->user_id)
            ->first();

        if ($existing) {
            // Update existing vote
            $data = [
                'vote' => $request->vote,
                'updated_at' => now(),
            ];
            DB::table('review_votes')->where('id', $existing->id)->update($data);
            $vote = DB::table('review_votes')
                ->join('product_reviews', 'review_votes.review_id', '=', 'product_reviews.id')
                ->join('users', 'review_votes.user_id', '=', 'users.id')
                ->select('review_votes.*', 'product_reviews.rating', 'users.email as user_email')
                ->where('review_votes.id', $existing->id)
                ->first();
        } else {
            $data = [
                'review_id' => $request->review_id,
                'user_id' => $request->user_id,
                'vote' => $request->vote,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            $id = DB::table('review_votes')->insertGetId($data);
            $vote = DB::table('review_votes')
                ->join('product_reviews', 'review_votes.review_id', '=', 'product_reviews.id')
                ->join('users', 'review_votes.user_id', '=', 'users.id')
                ->select('review_votes.*', 'product_reviews.rating', 'users.email as user_email')
                ->where('review_votes.id', $id)
                ->first();

            // Update helpful_count on review
            DB::table('product_reviews')
                ->where('id', $request->review_id)
                ->increment('helpful_count');
        }

        return response()->json($vote, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $vote = DB::table('review_votes')
            ->join('product_reviews', 'review_votes.review_id', '=', 'product_reviews.id')
            ->join('users', 'review_votes.user_id', '=', 'users.id')
            ->select('review_votes.*', 'product_reviews.rating', 'users.email as user_email')
            ->where('review_votes.id', $id)
            ->first();

        if (!$vote) {
            return response()->json(['message' => 'Review vote not found'], 404);
        }

        return response()->json($vote);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $vote = DB::table('review_votes')->where('id', $id)->first();

        if (!$vote) {
            return response()->json(['message' => 'Review vote not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'vote' => 'required|integer|in:-1,1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = [
            'vote' => $request->vote,
            'updated_at' => now(),
        ];

        DB::table('review_votes')->where('id', $id)->update($data);
        $vote = DB::table('review_votes')
            ->join('product_reviews', 'review_votes.review_id', '=', 'product_reviews.id')
            ->join('users', 'review_votes.user_id', '=', 'users.id')
            ->select('review_votes.*', 'product_reviews.rating', 'users.email as user_email')
            ->where('review_votes.id', $id)
            ->first();

        return response()->json($vote);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $vote = DB::table('review_votes')->where('id', $id)->first();

        if (!$vote) {
            return response()->json(['message' => 'Review vote not found'], 404);
        }

        // Decrement helpful_count on review
        DB::table('product_reviews')
            ->where('id', $vote->review_id)
            ->decrement('helpful_count');

        DB::table('review_votes')->where('id', $id)->delete();

        return response()->json(['message' => 'Review vote deleted successfully']);
    }
}
