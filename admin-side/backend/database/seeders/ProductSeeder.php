<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Product;
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
                'default_image' => 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
                'is_active' => true,
                'brand' => 'Apple',
            ],
            [
                'name' => 'Samsung Galaxy S24',
                'short_description' => 'Flagship Android smartphone',
                'description' => 'Samsung Galaxy S24 with AI-powered features and stunning display.',
                'default_image' => 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
                'is_active' => true,
                'brand' => 'Samsung',
            ],
            [
                'name' => 'MacBook Pro 16"',
                'short_description' => 'Powerful laptop for professionals',
                'description' => 'MacBook Pro with M3 chip, 16-inch display, and exceptional performance.',
                'default_image' => 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500',
                'is_active' => true,
                'brand' => 'Apple',
            ],
            [
                'name' => 'Dell XPS 15',
                'short_description' => 'Premium Windows laptop',
                'description' => 'Dell XPS 15 with Intel Core i7, 15.6-inch 4K display, and premium build quality.',
                'default_image' => 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
                'is_active' => true,
                'brand' => 'Dell',
            ],
            [
                'name' => 'Nike Air Max 270',
                'short_description' => 'Comfortable running shoes',
                'description' => 'Nike Air Max 270 with maximum cushioning and modern design.',
                'default_image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
                'is_active' => true,
                'brand' => 'Nike',
            ],
            [
                'name' => 'Adidas Ultraboost 22',
                'short_description' => 'High-performance running shoes',
                'description' => 'Adidas Ultraboost 22 with responsive cushioning and energy return.',
                'default_image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
                'is_active' => true,
                'brand' => 'Adidas',
            ],
            [
                'name' => 'Sony WH-1000XM5',
                'short_description' => 'Premium noise-cancelling headphones',
                'description' => 'Sony WH-1000XM5 with industry-leading noise cancellation and exceptional sound quality.',
                'default_image' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
                'is_active' => true,
                'brand' => 'Sony',
            ],
            [
                'name' => 'Canon EOS R5',
                'short_description' => 'Professional mirrorless camera',
                'description' => 'Canon EOS R5 with 45MP sensor, 8K video recording, and advanced autofocus.',
                'default_image' => 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500',
                'is_active' => true,
                'brand' => 'Canon',
            ],
            [
                'name' => 'LG OLED C3 65"',
                'short_description' => 'Premium OLED TV',
                'description' => 'LG OLED C3 65-inch with perfect blacks, vibrant colors, and smart features.',
                'default_image' => 'https://images.unsplash.com/photo-1593359677879-a4b92a0a8f38?w=500',
                'is_active' => true,
                'brand' => 'LG',
            ],
            [
                'name' => 'Zara Denim Jacket',
                'short_description' => 'Classic denim jacket',
                'description' => 'Zara classic denim jacket with modern fit and timeless style.',
                'default_image' => 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
                'is_active' => true,
                'brand' => 'Zara',
            ],
            [
                'name' => 'H&M Cotton T-Shirt',
                'short_description' => 'Comfortable everyday t-shirt',
                'description' => 'H&M 100% cotton t-shirt in various colors, perfect for everyday wear.',
                'default_image' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
                'is_active' => true,
                'brand' => 'H&M',
            ],
            [
                'name' => 'Puma Running Shorts',
                'short_description' => 'Lightweight running shorts',
                'description' => 'Puma running shorts with moisture-wicking fabric and comfortable fit.',
                'default_image' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
                'is_active' => true,
                'brand' => 'Puma',
            ],
            [
                'name' => 'Lenovo ThinkPad X1',
                'short_description' => 'Business laptop',
                'description' => 'Lenovo ThinkPad X1 Carbon with premium build and excellent keyboard.',
                'default_image' => 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
                'is_active' => true,
                'brand' => 'Lenovo',
            ],
            [
                'name' => 'HP Spectre x360',
                'short_description' => '2-in-1 convertible laptop',
                'description' => 'HP Spectre x360 with 360-degree hinge, touchscreen, and premium design.',
                'default_image' => 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
                'is_active' => true,
                'brand' => 'HP',
            ],
            [
                'name' => 'Nikon D850',
                'short_description' => 'Professional DSLR camera',
                'description' => 'Nikon D850 with 45.7MP sensor, 4K video, and exceptional image quality.',
                'default_image' => 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500',
                'is_active' => true,
                'brand' => 'Nikon',
            ],
        ];

        foreach ($products as $productData) {
            $brand = $brands->firstWhere('name', $productData['brand']);
            if (!$brand) continue;

            Product::create([
                'brand_id' => $brand->id,
                'name' => $productData['name'],
                'slug' => Str::slug($productData['name']),
                'short_description' => $productData['short_description'],
                'description' => $productData['description'],
                'default_image' => $productData['default_image'],
                'is_active' => $productData['is_active'],
            ]);
        }
    }
}

