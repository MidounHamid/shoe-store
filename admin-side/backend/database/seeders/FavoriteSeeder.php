<?php

namespace Database\Seeders;

use App\Models\Favorite;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FavoriteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = DB::table('users')
    ->join('roles', 'users.role_id', '=', 'roles.id') // Link users to roles
    ->where('roles.name', 'customer')               // Filter by the name in roles table
    ->select('users.*')                              // Get user data only
    ->limit(5)                                       // Matches your error log "limit 5"
    ->get();
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

