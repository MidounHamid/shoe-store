<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductReview;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = Product::all();
        $users = DB::table('users')
            ->join('roles', 'users.role_id', '=', 'roles.id') // Link users to roles
            ->where('roles.name', 'customer')               // Filter by the name in roles table
            ->select('users.*')                              // Get user data only
            ->get();

        $reviewTitles = [
            'Great product!',
            'Highly recommend',
            'Excellent quality',
            'Good value for money',
            'Not what I expected',
            'Amazing purchase',
            'Could be better',
            'Perfect for my needs',
            'Very satisfied',
            'Disappointed',
        ];

        $reviewBodies = [
            'This product exceeded my expectations. The quality is outstanding and it works perfectly.',
            'I\'ve been using this for a while now and I\'m very happy with my purchase.',
            'Good product overall, but there are some minor issues that could be improved.',
            'Excellent quality and fast shipping. Would definitely buy again.',
            'Not quite what I was looking for, but it serves its purpose.',
            'Amazing product! Highly recommend to anyone looking for something like this.',
            'The product is okay, but I think there are better options available.',
            'Perfect for what I needed. Great quality and good price.',
            'Very satisfied with this purchase. It meets all my requirements.',
            'I was disappointed with this product. It didn\'t meet my expectations.',
        ];

        foreach ($products as $product) {
            // Each product gets 3-8 reviews
            $reviewCount = rand(3, 8);
            $selectedUsers = $users->random($reviewCount);

            foreach ($selectedUsers as $user) {
                $rating = rand(3, 5); // Mostly positive reviews
                if (rand(0, 10) < 2) {
                    $rating = rand(1, 2); // Some negative reviews
                }

                ProductReview::create([
                    'product_id' => $product->id,
                    'user_id' => $user->id,
                    'rating' => $rating,
                    'title' => $reviewTitles[array_rand($reviewTitles)],
                    'body' => $reviewBodies[array_rand($reviewBodies)],
                    'verified_order_item_id' => null, // Can be linked to actual orders if needed
                ]);
            }
        }
    }
}
