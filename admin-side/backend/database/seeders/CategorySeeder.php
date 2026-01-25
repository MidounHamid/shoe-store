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
        $electronics = Category::updateOrCreate([
            'slug' => 'electronics',
        ], [
            'name' => 'Electronics',
            'slug' => 'electronics',
            'parent_id' => null,
        ]);

        $clothing = Category::updateOrCreate([
            'slug' => 'clothing',
        ], [
            'name' => 'Clothing',
            'slug' => 'clothing',
            'parent_id' => null,
        ]);

        $home = Category::updateOrCreate([
            'slug' => 'home-garden',
        ], [
            'name' => 'Home & Garden',
            'slug' => 'home-garden',
            'parent_id' => null,
        ]);

        $sports = Category::updateOrCreate([
            'slug' => 'sports-outdoors',
        ], [
            'name' => 'Sports & Outdoors',
            'slug' => 'sports-outdoors',
            'parent_id' => null,
        ]);

        // Electronics subcategories
        Category::updateOrCreate(['slug' => 'smartphones'], ['name' => 'Smartphones', 'slug' => 'smartphones', 'parent_id' => $electronics->id]);
        Category::updateOrCreate(['slug' => 'laptops'], ['name' => 'Laptops', 'slug' => 'laptops', 'parent_id' => $electronics->id]);
        Category::updateOrCreate(['slug' => 'tablets'], ['name' => 'Tablets', 'slug' => 'tablets', 'parent_id' => $electronics->id]);
        Category::updateOrCreate(['slug' => 'cameras'], ['name' => 'Cameras', 'slug' => 'cameras', 'parent_id' => $electronics->id]);
        Category::updateOrCreate(['slug' => 'tvs'], ['name' => 'TVs', 'slug' => 'tvs', 'parent_id' => $electronics->id]);
        Category::updateOrCreate(['slug' => 'headphones'], ['name' => 'Headphones', 'slug' => 'headphones', 'parent_id' => $electronics->id]);

        // Clothing subcategories
        Category::updateOrCreate(['slug' => 'mens-clothing'], ['name' => 'Men\'s Clothing', 'slug' => 'mens-clothing', 'parent_id' => $clothing->id]);
        Category::updateOrCreate(['slug' => 'womens-clothing'], ['name' => 'Women\'s Clothing', 'slug' => 'womens-clothing', 'parent_id' => $clothing->id]);
        Category::updateOrCreate(['slug' => 'kids-clothing'], ['name' => 'Kids\' Clothing', 'slug' => 'kids-clothing', 'parent_id' => $clothing->id]);
        Category::updateOrCreate(['slug' => 'shoes'], ['name' => 'Shoes', 'slug' => 'shoes', 'parent_id' => $clothing->id]);
        Category::updateOrCreate(['slug' => 'accessories'], ['name' => 'Accessories', 'slug' => 'accessories', 'parent_id' => $clothing->id]);

        // Home subcategories
        Category::updateOrCreate(['slug' => 'furniture'], ['name' => 'Furniture', 'slug' => 'furniture', 'parent_id' => $home->id]);
        Category::updateOrCreate(['slug' => 'kitchen'], ['name' => 'Kitchen', 'slug' => 'kitchen', 'parent_id' => $home->id]);
        Category::updateOrCreate(['slug' => 'bedding'], ['name' => 'Bedding', 'slug' => 'bedding', 'parent_id' => $home->id]);
        Category::updateOrCreate(['slug' => 'decor'], ['name' => 'Decor', 'slug' => 'decor', 'parent_id' => $home->id]);

        // Sports subcategories
        Category::updateOrCreate(['slug' => 'fitness'], ['name' => 'Fitness', 'slug' => 'fitness', 'parent_id' => $sports->id]);
        Category::updateOrCreate(['slug' => 'outdoor-gear'], ['name' => 'Outdoor Gear', 'slug' => 'outdoor-gear', 'parent_id' => $sports->id]);
        Category::updateOrCreate(['slug' => 'sports-equipment'], ['name' => 'Sports Equipment', 'slug' => 'sports-equipment', 'parent_id' => $sports->id]);
    }
}
