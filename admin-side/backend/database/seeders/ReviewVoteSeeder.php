<?php

namespace Database\Seeders;

use App\Models\ProductReview;
use App\Models\ReviewVote;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReviewVoteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $reviews = ProductReview::all();
        $users = User::where('role', 'customer')->get();

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

