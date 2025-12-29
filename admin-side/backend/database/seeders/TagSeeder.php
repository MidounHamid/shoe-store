<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tags = [
            ['name' => 'New Arrival', 'slug' => 'new-arrival'],
            ['name' => 'Best Seller', 'slug' => 'best-seller'],
            ['name' => 'Sale', 'slug' => 'sale'],
            ['name' => 'Featured', 'slug' => 'featured'],
            ['name' => 'Limited Edition', 'slug' => 'limited-edition'],
            ['name' => 'Premium', 'slug' => 'premium'],
            ['name' => 'Eco-Friendly', 'slug' => 'eco-friendly'],
            ['name' => 'Wireless', 'slug' => 'wireless'],
            ['name' => 'Waterproof', 'slug' => 'waterproof'],
            ['name' => 'Smart', 'slug' => 'smart'],
            ['name' => 'Portable', 'slug' => 'portable'],
            ['name' => 'Compact', 'slug' => 'compact'],
            ['name' => 'High Quality', 'slug' => 'high-quality'],
            ['name' => 'Fast Shipping', 'slug' => 'fast-shipping'],
            ['name' => 'Customer Favorite', 'slug' => 'customer-favorite'],
        ];

        foreach ($tags as $tag) {
            Tag::create($tag);
        }
    }
}

