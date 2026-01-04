<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $brands = Brand::all();

        $products = [
            [
                'name' => 'iPhone 15 Pro',
                'short_description' => 'Latest iPhone with advanced features',
                'description' => 'The iPhone 15 Pro features a titanium design, A17 Pro chip, and advanced camera system.',
                'image' => 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
                'is_active' => true,
                'brand' => 'Apple',
            ],
            [
                'name' => 'Samsung Galaxy S24',
                'short_description' => 'Flagship Android smartphone',
                'description' => 'Samsung Galaxy S24 with AI-powered features and stunning display.',
                'image' => 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
                'is_active' => true,
                'brand' => 'Samsung',
            ],
            [
                'name' => 'MacBook Pro 16"',
                'short_description' => 'Powerful laptop for professionals',
                'description' => 'MacBook Pro with M3 chip, 16-inch display, and exceptional performance.',
                'image' => 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500',
                'is_active' => true,
                'brand' => 'Apple',
            ],
            [
                'name' => 'Dell XPS 15',
                'short_description' => 'Premium Windows laptop',
                'description' => 'Dell XPS 15 with Intel Core i7, 15.6-inch 4K display, and premium build quality.',
                'image' => 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
                'is_active' => true,
                'brand' => 'Dell',
            ],
            [
                'name' => 'Nike Air Max 270',
                'short_description' => 'Comfortable running shoes',
                'description' => 'Nike Air Max 270 with maximum cushioning and modern design.',
                'image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
                'is_active' => true,
                'brand' => 'Nike',
            ],
            [
                'name' => 'Sony WH-1000XM5',
                'short_description' => 'Premium noise-cancelling headphones',
                'description' => 'Sony WH-1000XM5 with industry-leading noise cancellation and exceptional sound quality.',
                'image' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
                'is_active' => true,
                'brand' => 'Sony',
            ],
            [
                'name' => 'LG OLED C3 65"',
                'short_description' => 'Premium OLED TV',
                'description' => 'LG OLED C3 65-inch with perfect blacks, vibrant colors, and smart features.',
                'image' => 'https://images.unsplash.com/photo-1593359677879-a4b92a0a8f38?w=500',
                'is_active' => true,
                'brand' => 'LG',
            ],
        ];

        foreach ($products as $productData) {
            $brand = $brands->firstWhere('name', $productData['brand']);
            if (!$brand) continue;

            // 1. Create the Product (No image column here anymore)
            $product = Product::create([
                'brand_id' => $brand->id,
                'name' => $productData['name'],
                'slug' => Str::slug($productData['name']),
                'short_description' => $productData['short_description'],
                'description' => $productData['description'],
                'is_active' => $productData['is_active'],
            ]);

            // 2. Create the Image in the product_images table
            ProductImage::create([
                'product_id' => $product->id,
                'variant_id' => null, // Base product image
                'main_image' => $productData['image'],
                'second_images' => json_encode([]),
                'display_order' => 0,
            ]);
        }
    }
}
