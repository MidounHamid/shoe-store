<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AddressSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
$customers = DB::table('users')
    ->join('roles', 'users.role_id', '=', 'roles.id')
    ->where('roles.name', 'customer')
    ->select('users.*') // This ensures you only get user columns
    ->get();
        $addresses = [
            [
                'label' => 'Home',
                'full_name' => 'John Doe',
                'street_address' => '123 Main Street',
                'city' => 'New York',
                'state' => 'NY',
                'postal_code' => '10001',
                'country' => 'United States',
                'phone' => '+1234567891',
                'is_default' => true,
            ],
            [
                'label' => 'Work',
                'full_name' => 'John Doe',
                'street_address' => '456 Business Ave',
                'city' => 'New York',
                'state' => 'NY',
                'postal_code' => '10002',
                'country' => 'United States',
                'phone' => '+1234567891',
                'is_default' => false,
            ],
            [
                'label' => 'Home',
                'full_name' => 'Jane Smith',
                'street_address' => '789 Oak Boulevard',
                'city' => 'Los Angeles',
                'state' => 'CA',
                'postal_code' => '90001',
                'country' => 'United States',
                'phone' => '+1234567892',
                'is_default' => true,
            ],
            [
                'label' => 'Home',
                'full_name' => 'Michael Johnson',
                'street_address' => '321 Pine Street',
                'city' => 'Chicago',
                'state' => 'IL',
                'postal_code' => '60601',
                'country' => 'United States',
                'phone' => '+1234567893',
                'is_default' => true,
            ],
            [
                'label' => 'Home',
                'full_name' => 'Emily Williams',
                'street_address' => '654 Elm Avenue',
                'city' => 'Houston',
                'state' => 'TX',
                'postal_code' => '77001',
                'country' => 'United States',
                'phone' => '+1234567894',
                'is_default' => true,
            ],
        ];

        foreach ($customers as $index => $user) {
            if (isset($addresses[$index])) {
                Address::create([
                    ...$addresses[$index],
                    'user_id' => $user->id,
                ]);
            } else {
                // Create a default address for remaining users
                Address::create([
                    'user_id' => $user->id,
                    'label' => 'Home',
                    'full_name' => $user->first_name . ' ' . $user->last_name,
                    'street_address' => rand(100, 9999) . ' Street',
                    'city' => 'City',
                    'state' => 'ST',
                    'postal_code' => str_pad(rand(10000, 99999), 5, '0', STR_PAD_LEFT),
                    'country' => 'United States',
                    'phone' => $user->phone,
                    'is_default' => true,
                ]);
            }
        }
    }
}

