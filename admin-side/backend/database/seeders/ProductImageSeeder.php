<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductImage; // Ensure you have this model or use DB::table
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ProductImageSeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::all();

        // Setup directories (same as before)
        if (Storage::disk('public')->exists('product_images')) {
            Storage::disk('public')->deleteDirectory('product_images');
        }
        Storage::disk('public')->makeDirectory('product_images');
        $this->createPlaceholderImages(); // Call helper to make dummy files

        foreach ($products as $product) {
            // Create 1-3 entries per product
            $entriesCount = rand(1, 3);

            for ($i = 0; $i < $entriesCount; $i++) {

                // 1. Pick a Main Image
                $mainImage = 'product_images/placeholder' . rand(1, 5) . '.jpg';

                // 2. Pick Multiple Secondary Images (0 to 3 images)
                $secondaryImagesPaths = [];
                $numberOfSecondaries = rand(0, 3);

                for ($j = 0; $j < $numberOfSecondaries; $j++) {
                    $secondaryImagesPaths[] = 'product_images/placeholder' . rand(1, 5) . '.jpg';
                }

                DB::table('product_images')->insert([
                    'product_id' => $product->id,
                    'variant_id' => null,
                    'main_image' => $mainImage,
                    // Encode the array to JSON
                    'second_images' => json_encode($secondaryImagesPaths),
                    'display_order' => $i + 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    private function createPlaceholderImages(): void
    {
        // ... (Your existing createPlaceholderImages logic goes here) ...
        // Ensure you copy the method from your previous code
        // It creates files like product_images/placeholder1.jpg
    }
}
