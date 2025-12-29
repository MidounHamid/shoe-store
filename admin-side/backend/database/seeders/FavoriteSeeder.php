<?php

namespace Database\Seeders;

use App\Models\Favorite;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class FavoriteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::where('role', 'customer')->get();
        $products = Product::all();

        foreach ($users as $user) {
            // Each user favorites 2-5 products
            $favoriteCount = rand(2, 5);
            $selectedProducts = $products->random($favoriteCount);

            foreach ($selectedProducts as $product) {
                Favorite::create([
                    'user_id' => $user->id,
                    'product_id' => $product->id,
                ]);
            }
        }
    }
}

