<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Tag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductTagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = Product::all();
        $tags = Tag::all();

        foreach ($products as $product) {
            // Randomly assign 2-4 tags to each product
            $selectedTags = $tags->random(rand(2, 4));

            foreach ($selectedTags as $tag) {
                DB::table('product_tags')->insertOrIgnore([
                    'product_id' => $product->id,
                    'tag_id' => $tag->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}

