<?php

namespace Database\Seeders;

use App\Models\Cart;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CartSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = DB::table('users')
    ->join('roles', 'users.role_id', '=', 'roles.id') // Link users to roles
    ->where('roles.name', 'customer')               // Filter by the name in roles table
    ->select('users.*')                              // Get user data only
    ->limit(5)                                       // Matches your error log "limit 5"
    ->get();

        foreach ($users as $user) {
            Cart::create([
                'user_id' => $user->id,
                'session_token' => null,
            ]);
        }
    }
}

