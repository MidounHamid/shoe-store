<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductFeature;
use Illuminate\Database\Seeder;

class ProductFeatureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = Product::all();

        $commonFeatures = [
            'Free Shipping',
            '30-Day Return Policy',
            'Warranty Included',
            'Eco-Friendly Packaging',
            'Customer Support',
            'Fast Delivery',
            'Secure Payment',
            'Quality Guaranteed',
        ];

        foreach ($products as $product) {
            // Add 3-5 features per product
            $featureCount = rand(3, 5);
            $selectedFeatures = array_rand($commonFeatures, $featureCount);
            
            if (!is_array($selectedFeatures)) {
                $selectedFeatures = [$selectedFeatures];
            }

            foreach ($selectedFeatures as $index => $featureIndex) {
                ProductFeature::create([
                    'product_id' => $product->id,
                    'feature_text' => $commonFeatures[$featureIndex],
                    'display_order' => $index + 1,
                ]);
            }
        }
    }
}

