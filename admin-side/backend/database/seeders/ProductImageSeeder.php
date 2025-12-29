<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;

class ProductImageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = Product::all();

        $imageUrls = [
            'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
            'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800',
            'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
            'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800',
            'https://images.unsplash.com/photo-1593359677879-a4b92a0a8f38?w=800',
            'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
        ];

        foreach ($products as $product) {
            // Add 2-4 images per product
            $imageCount = rand(2, 4);
            for ($i = 0; $i < $imageCount; $i++) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'variant_id' => null,
                    'image_url' => $imageUrls[array_rand($imageUrls)],
                    'display_order' => $i + 1,
                ]);
            }
        }
    }
}

