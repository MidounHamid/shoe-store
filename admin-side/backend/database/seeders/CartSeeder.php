<?php

namespace Database\Seeders;

use App\Models\Cart;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CartSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::where('role', 'customer')->take(5)->get();

        foreach ($users as $user) {
            Cart::create([
                'user_id' => $user->id,
                'session_token' => null,
            ]);
        }
    }
}

