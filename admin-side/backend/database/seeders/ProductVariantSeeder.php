<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductVariantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = Product::all();

        foreach ($products as $product) {
            $variants = [];

            // Electronics products - different storage/color options
            if (str_contains(strtolower($product->name), 'iphone') || str_contains(strtolower($product->name), 'samsung')) {
                $colors = ['Black', 'White', 'Blue', 'Purple'];
                $storages = ['128GB', '256GB', '512GB'];

                foreach ($colors as $color) {
                    foreach ($storages as $storage) {
                        $variants[] = [
                            'product_id' => $product->id,
                            'sku' => strtoupper(Str::substr($product->name, 0, 3)) . '-' . Str::substr($color, 0, 3) . '-' . $storage,
                            'size' => $storage,
                            'color' => $color,
                            'price' => rand(699, 1299),
                            'original_price' => rand(799, 1399),
                            'stock' => rand(10, 100),
                        ];
                    }
                }
            }
            // Laptops - different configurations
            elseif (str_contains(strtolower($product->name), 'macbook') || str_contains(strtolower($product->name), 'laptop') || str_contains(strtolower($product->name), 'xps') || str_contains(strtolower($product->name), 'thinkpad') || str_contains(strtolower($product->name), 'spectre')) {
                $configs = ['8GB RAM / 256GB SSD', '16GB RAM / 512GB SSD', '32GB RAM / 1TB SSD'];

                foreach ($configs as $index => $config) {
                    $variants[] = [
                        'product_id' => $product->id,
                        'sku' => strtoupper(Str::substr($product->name, 0, 3)) . '-CFG-' . ($index + 1),
                        'size' => null,
                        'color' => 'Silver',
                        'price' => rand(999, 2499),
                        'original_price' => rand(1099, 2699),
                        'stock' => rand(5, 50),
                    ];
                }
            }
            // Shoes - different sizes
            elseif (str_contains(strtolower($product->name), 'shoe') || str_contains(strtolower($product->name), 'air') || str_contains(strtolower($product->name), 'ultraboost')) {
                $sizes = ['7', '8', '9', '10', '11', '12'];
                $colors = ['Black', 'White', 'Blue'];

                foreach ($colors as $color) {
                    foreach ($sizes as $size) {
                        $variants[] = [
                            'product_id' => $product->id,
                            'sku' => strtoupper(Str::substr($product->name, 0, 3)) . '-' . Str::substr($color, 0, 3) . '-' . $size,
                            'size' => $size,
                            'color' => $color,
                            'price' => rand(79, 199),
                            'original_price' => rand(99, 249),
                            'stock' => rand(5, 30),
                        ];
                    }
                }
            }
            // Cameras - different lens kits
            elseif (str_contains(strtolower($product->name), 'camera') || str_contains(strtolower($product->name), 'eos') || str_contains(strtolower($product->name), 'd850')) {
                $kits = ['Body Only', 'With 24-70mm Lens', 'With 70-200mm Lens'];

                foreach ($kits as $index => $kit) {
                    $variants[] = [
                        'product_id' => $product->id,
                        'sku' => strtoupper(Str::substr($product->name, 0, 3)) . '-KIT-' . ($index + 1),
                        'size' => null,
                        'color' => 'Black',
                        'price' => rand(1999, 3999),
                        'original_price' => rand(2199, 4299),
                        'stock' => rand(3, 20),
                    ];
                }
            }
            // TVs - different sizes
            elseif (str_contains(strtolower($product->name), 'tv') || str_contains(strtolower($product->name), 'oled')) {
                $sizes = ['55"', '65"', '77"'];

                foreach ($sizes as $size) {
                    $variants[] = [
                        'product_id' => $product->id,
                        'sku' => strtoupper(Str::substr($product->name, 0, 3)) . '-' . str_replace('"', '', $size),
                        'size' => $size,
                        'color' => 'Black',
                        'price' => rand(999, 2999),
                        'original_price' => rand(1199, 3499),
                        'stock' => rand(5, 25),
                    ];
                }
            }
            // Headphones - different colors
            elseif (str_contains(strtolower($product->name), 'headphone') || str_contains(strtolower($product->name), 'wh-')) {
                $colors = ['Black', 'Silver', 'Blue'];

                foreach ($colors as $color) {
                    $variants[] = [
                        'product_id' => $product->id,
                        'sku' => strtoupper(Str::substr($product->name, 0, 3)) . '-' . Str::substr($color, 0, 3),
                        'size' => null,
                        'color' => $color,
                        'price' => rand(199, 399),
                        'original_price' => rand(249, 449),
                        'stock' => rand(10, 50),
                    ];
                }
            }
            // Clothing - different sizes
            else {
                $sizes = ['S', 'M', 'L', 'XL', 'XXL'];
                $colors = ['Black', 'White', 'Blue', 'Gray'];

                foreach ($colors as $color) {
                    foreach ($sizes as $size) {
                        $variants[] = [
                            'product_id' => $product->id,
                            'sku' => strtoupper(Str::substr($product->name, 0, 3)) . '-' . Str::substr($color, 0, 3) . '-' . $size,
                            'size' => $size,
                            'color' => $color,
                            'price' => rand(19, 99),
                            'original_price' => rand(29, 129),
                            'stock' => rand(10, 50),
                        ];
                    }
                }
            }

            // Create variants
            foreach ($variants as $variant) {
                ProductVariant::create($variant);
            }
        }
    }
}
