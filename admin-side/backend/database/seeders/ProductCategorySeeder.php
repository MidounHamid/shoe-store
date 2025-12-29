<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = Product::all();
        $categories = Category::all();

        foreach ($products as $product) {
            $productCategories = [];

            // Assign categories based on product name
            $productName = strtolower($product->name);

            if (str_contains($productName, 'iphone') || str_contains($productName, 'samsung') || str_contains($productName, 'galaxy')) {
                $productCategories[] = $categories->firstWhere('slug', 'smartphones');
            } elseif (str_contains($productName, 'macbook') || str_contains($productName, 'laptop') || str_contains($productName, 'xps') || str_contains($productName, 'thinkpad') || str_contains($productName, 'spectre')) {
                $productCategories[] = $categories->firstWhere('slug', 'laptops');
            } elseif (str_contains($productName, 'shoe') || str_contains($productName, 'air') || str_contains($productName, 'ultraboost')) {
                $productCategories[] = $categories->firstWhere('slug', 'shoes');
            } elseif (str_contains($productName, 'camera') || str_contains($productName, 'eos') || str_contains($productName, 'd850')) {
                $productCategories[] = $categories->firstWhere('slug', 'cameras');
            } elseif (str_contains($productName, 'tv') || str_contains($productName, 'oled')) {
                $productCategories[] = $categories->firstWhere('slug', 'tvs');
            } elseif (str_contains($productName, 'headphone') || str_contains($productName, 'wh-')) {
                $productCategories[] = $categories->firstWhere('slug', 'headphones');
            } elseif (str_contains($productName, 'jacket') || str_contains($productName, 't-shirt') || str_contains($productName, 'shorts')) {
                $productCategories[] = $categories->firstWhere('slug', 'mens-clothing');
                $productCategories[] = $categories->firstWhere('slug', 'womens-clothing');
            }

            // Also assign parent category
            foreach ($productCategories as $category) {
                if ($category && $category->parent_id) {
                    $parentCategory = $categories->firstWhere('id', $category->parent_id);
                    if ($parentCategory && !in_array($parentCategory, $productCategories)) {
                        $productCategories[] = $parentCategory;
                    }
                }
            }

            // Attach categories to product
            foreach ($productCategories as $category) {
                if ($category) {
                    DB::table('product_categories')->insertOrIgnore([
                        'product_id' => $product->id,
                        'category_id' => $category->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }
}

