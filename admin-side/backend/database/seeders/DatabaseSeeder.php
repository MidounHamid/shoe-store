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
        User::create([
            'first_name' => "Admin",
            'last_name'  => "User",
            'email'      => "admin@gmail.com",
            'password'   => Hash::make("admin@gmail.com"),
            'role'       => 'admin', // Setting the role you defined in migration
            'email_verified' => true,
        ]);
    }
}
