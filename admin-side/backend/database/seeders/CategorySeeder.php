<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Root categories
        $electronics = Category::create([
            'name' => 'Electronics',
            'slug' => 'electronics',
            'parent_id' => null,
        ]);

        $clothing = Category::create([
            'name' => 'Clothing',
            'slug' => 'clothing',
            'parent_id' => null,
        ]);

        $home = Category::create([
            'name' => 'Home & Garden',
            'slug' => 'home-garden',
            'parent_id' => null,
        ]);

        $sports = Category::create([
            'name' => 'Sports & Outdoors',
            'slug' => 'sports-outdoors',
            'parent_id' => null,
        ]);

        // Electronics subcategories
        Category::create(['name' => 'Smartphones', 'slug' => 'smartphones', 'parent_id' => $electronics->id]);
        Category::create(['name' => 'Laptops', 'slug' => 'laptops', 'parent_id' => $electronics->id]);
        Category::create(['name' => 'Tablets', 'slug' => 'tablets', 'parent_id' => $electronics->id]);
        Category::create(['name' => 'Cameras', 'slug' => 'cameras', 'parent_id' => $electronics->id]);
        Category::create(['name' => 'TVs', 'slug' => 'tvs', 'parent_id' => $electronics->id]);
        Category::create(['name' => 'Headphones', 'slug' => 'headphones', 'parent_id' => $electronics->id]);

        // Clothing subcategories
        Category::create(['name' => 'Men\'s Clothing', 'slug' => 'mens-clothing', 'parent_id' => $clothing->id]);
        Category::create(['name' => 'Women\'s Clothing', 'slug' => 'womens-clothing', 'parent_id' => $clothing->id]);
        Category::create(['name' => 'Kids\' Clothing', 'slug' => 'kids-clothing', 'parent_id' => $clothing->id]);
        Category::create(['name' => 'Shoes', 'slug' => 'shoes', 'parent_id' => $clothing->id]);
        Category::create(['name' => 'Accessories', 'slug' => 'accessories', 'parent_id' => $clothing->id]);

        // Home subcategories
        Category::create(['name' => 'Furniture', 'slug' => 'furniture', 'parent_id' => $home->id]);
        Category::create(['name' => 'Kitchen', 'slug' => 'kitchen', 'parent_id' => $home->id]);
        Category::create(['name' => 'Bedding', 'slug' => 'bedding', 'parent_id' => $home->id]);
        Category::create(['name' => 'Decor', 'slug' => 'decor', 'parent_id' => $home->id]);

        // Sports subcategories
        Category::create(['name' => 'Fitness', 'slug' => 'fitness', 'parent_id' => $sports->id]);
        Category::create(['name' => 'Outdoor Gear', 'slug' => 'outdoor-gear', 'parent_id' => $sports->id]);
        Category::create(['name' => 'Sports Equipment', 'slug' => 'sports-equipment', 'parent_id' => $sports->id]);
    }
}

