<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SizeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sizes = [
            ['name' => 'XS', 'code' => 'XS', 'display_order' => 1, 'is_active' => true],
            ['name' => 'S', 'code' => 'S', 'display_order' => 2, 'is_active' => true],
            ['name' => 'M', 'code' => 'M', 'display_order' => 3, 'is_active' => true],
            ['name' => 'L', 'code' => 'L', 'display_order' => 4, 'is_active' => true],
            ['name' => 'XL', 'code' => 'XL', 'display_order' => 5, 'is_active' => true],
            ['name' => 'XXL', 'code' => 'XXL', 'display_order' => 6, 'is_active' => true],
            ['name' => 'XXXL', 'code' => 'XXXL', 'display_order' => 7, 'is_active' => true],
        ];

        foreach ($sizes as $size) {
            DB::table('sizes')->updateOrInsert(
                ['name' => $size['name']],
                [
                    ...$size,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }
    }
}
