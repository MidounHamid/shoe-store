<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin user
        User::create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'phone' => '+1234567890',
            'role' => 'admin',
            'email_verified' => true,
        ]);

        // Customer users
        $customers = [
            [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'email' => 'john.doe@example.com',
                'phone' => '+1234567891',
            ],
            [
                'first_name' => 'Jane',
                'last_name' => 'Smith',
                'email' => 'jane.smith@example.com',
                'phone' => '+1234567892',
            ],
            [
                'first_name' => 'Michael',
                'last_name' => 'Johnson',
                'email' => 'michael.johnson@example.com',
                'phone' => '+1234567893',
            ],
            [
                'first_name' => 'Emily',
                'last_name' => 'Williams',
                'email' => 'emily.williams@example.com',
                'phone' => '+1234567894',
            ],
            [
                'first_name' => 'David',
                'last_name' => 'Brown',
                'email' => 'david.brown@example.com',
                'phone' => '+1234567895',
            ],
            [
                'first_name' => 'Sarah',
                'last_name' => 'Davis',
                'email' => 'sarah.davis@example.com',
                'phone' => '+1234567896',
            ],
            [
                'first_name' => 'Robert',
                'last_name' => 'Miller',
                'email' => 'robert.miller@example.com',
                'phone' => '+1234567897',
            ],
            [
                'first_name' => 'Lisa',
                'last_name' => 'Wilson',
                'email' => 'lisa.wilson@example.com',
                'phone' => '+1234567898',
            ],
            [
                'first_name' => 'James',
                'last_name' => 'Moore',
                'email' => 'james.moore@example.com',
                'phone' => '+1234567899',
            ],
            [
                'first_name' => 'Patricia',
                'last_name' => 'Taylor',
                'email' => 'patricia.taylor@example.com',
                'phone' => '+1234567900',
            ],
        ];

        foreach ($customers as $customer) {
            User::create([
                ...$customer,
                'password' => Hash::make('password'),
                'role' => 'customer',
                'email_verified' => true,
            ]);
        }
    }
}

