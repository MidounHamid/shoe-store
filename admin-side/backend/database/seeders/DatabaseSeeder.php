<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Base tables (no dependencies)
        $this->call([
            RoleSeeder::class,
            BrandSeeder::class,
            CategorySeeder::class,
            TagSeeder::class,
            UserSeeder::class,
        ]);

        // Products and related
        $this->call([
            ProductSeeder::class,
            ProductVariantSeeder::class,
            ProductCategorySeeder::class,
            ProductTagSeeder::class,
            ProductImageSeeder::class,
            ProductFeatureSeeder::class,
        ]);

        // User-related
        $this->call([
            AddressSeeder::class,
            CartSeeder::class,
            CartItemSeeder::class,
            FavoriteSeeder::class,
        ]);

        // Orders and payments
        $this->call([
            OrderSeeder::class,
            OrderItemSeeder::class,
            PaymentSeeder::class,
            OrderEventSeeder::class,
        ]);

        // Reviews
        $this->call([
            ProductReviewSeeder::class,
            ReviewVoteSeeder::class,
        ]);
    }
}
