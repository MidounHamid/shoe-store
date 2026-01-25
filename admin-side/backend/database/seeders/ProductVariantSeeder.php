<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Size; // Import the Size model
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
            $productName = strtolower($product->name);

            // Electronics products
            if (str_contains($productName, 'iphone') || str_contains($productName, 'samsung')) {
                $colors = ['Black', 'White', 'Blue', 'Purple'];
                $storages = ['128GB', '256GB', '512GB'];

                foreach ($colors as $color) {
                    foreach ($storages as $storage) {
                        $variants[] = [
                            'product_id' => $product->id,
                            'sku' => strtoupper(Str::substr($product->name, 0, 3)).'-'.Str::substr($color, 0, 3).'-'.$storage,
                            'size_id' => $this->getSizeId($storage), // Changed from 'size'
                            'color' => $color,
                            'price' => rand(699, 1299),
                            'original_price' => rand(799, 1399),
                            'stock' => rand(10, 100),
                        ];
                    }
                }
            }
            // Laptops
            elseif (str_contains($productName, 'macbook') || str_contains($productName, 'laptop') || str_contains($productName, 'xps')) {
                $configs = ['8GB RAM / 256GB SSD', '16GB RAM / 512GB SSD', '32GB RAM / 1TB SSD'];

                foreach ($configs as $index => $config) {
                    $variants[] = [
                        'product_id' => $product->id,
                        'sku' => strtoupper(Str::substr($product->name, 0, 3)).'-CFG-'.($index + 1),
                        'size_id' => $this->getSizeId($config), // Changed from 'size'
                        'color' => 'Silver',
                        'price' => rand(999, 2499),
                        'original_price' => rand(1099, 2699),
                        'stock' => rand(5, 50),
                    ];
                }
            }
            // Shoes
            elseif (str_contains($productName, 'shoe') || str_contains($productName, 'air') || str_contains($productName, 'ultraboost')) {
                $sizes = ['7', '8', '9', '10', '11', '12'];
                $colors = ['Black', 'White', 'Blue'];

                foreach ($colors as $color) {
                    foreach ($sizes as $size) {
                        $variants[] = [
                            'product_id' => $product->id,
                            'sku' => strtoupper(Str::substr($product->name, 0, 3)).'-'.Str::substr($color, 0, 3).'-'.$size,
                            'size_id' => $this->getSizeId($size), // Changed from 'size'
                            'color' => $color,
                            'price' => rand(79, 199),
                            'original_price' => rand(99, 249),
                            'stock' => rand(5, 30),
                        ];
                    }
                }
            }
            // TVs
            elseif (str_contains($productName, 'tv') || str_contains($productName, 'oled')) {
                $sizes = ['55"', '65"', '77"'];

                foreach ($sizes as $size) {
                    $variants[] = [
                        'product_id' => $product->id,
                        'sku' => strtoupper(Str::substr($product->name, 0, 3)).'-'.str_replace('"', '', $size),
                        'size_id' => $this->getSizeId($size), // Changed from 'size'
                        'color' => 'Black',
                        'price' => rand(999, 2999),
                        'original_price' => rand(1199, 3499),
                        'stock' => rand(5, 25),
                    ];
                }
            }
            // Default (Clothing)
            else {
                $sizes = ['S', 'M', 'L', 'XL', 'XXL'];
                $colors = ['Black', 'White', 'Blue', 'Gray'];

                foreach ($colors as $color) {
                    foreach ($sizes as $size) {
                        $variants[] = [
                            'product_id' => $product->id,
                            'sku' => strtoupper(Str::substr($product->name, 0, 3)).'-'.Str::substr($color, 0, 3).'-'.$size,
                            'size_id' => $this->getSizeId($size), // Changed from 'size'
                            'color' => $color,
                            'price' => rand(19, 99),
                            'original_price' => rand(29, 129),
                            'stock' => rand(10, 50),
                        ];
                    }
                }
            }

            foreach ($variants as $variant) {
                ProductVariant::updateOrCreate(
                    ['sku' => $variant['sku']],
                    $variant
                );
            }
        }
    }

    /**
     * Helper to get or create the size ID
     */
    private function getSizeId($name)
    {
        if (! $name) {
            return null;
        }

        $size = Size::firstOrCreate(['name' => $name]);

        return $size->id;
    }
}
