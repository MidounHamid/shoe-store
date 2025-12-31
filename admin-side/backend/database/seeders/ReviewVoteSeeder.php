<?php

namespace Database\Seeders;

use App\Models\ProductReview;
use App\Models\ReviewVote;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReviewVoteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $reviews = ProductReview::all();
        $users = DB::table('users')
    ->join('roles', 'users.role_id', '=', 'roles.id') // Link users to roles
    ->where('roles.name', 'customer')               // Filter by the name in roles table
    ->select('users.*')                              // Get user data only
    ->get();

        foreach ($reviews as $review) {
            // Each review gets 0-5 votes
            $voteCount = rand(0, 5);
            $selectedUsers = $users->where('id', '!=', $review->user_id)->random($voteCount);

            foreach ($selectedUsers as $user) {
                ReviewVote::create([
                    'review_id' => $review->id,
                    'user_id' => $user->id,
                    'vote' => rand(0, 1), // 1 helpful / 0 not helpful
                ]);
            }
        }
    }
}
