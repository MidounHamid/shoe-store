<?php

namespace Database\Seeders;

use App\Models\Product;
// Ensure you have this model or use DB::table
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductImageSeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::all();
        foreach ($products as $product) {
            // Keep it simple: create one (empty) image record per product.
            // Real images should be uploaded via the admin panel (local upload).
            DB::table('product_images')->updateOrInsert(
                [
                    'product_id' => $product->id,
                    'variant_id' => null,
                    'display_order' => 0,
                ],
                [
                    'main_image' => null,
                    'second_images' => json_encode([]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
