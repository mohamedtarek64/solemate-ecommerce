<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing users (delete instead of truncate due to foreign keys)
        DB::table('users')->delete();

        // Sample users data
        $users = [
            [
                'first_name' => 'Admin',
                'last_name' => 'SoleMate',
                'name' => 'Admin SoleMate',
                'email' => 'admin@solemate.com',
                'password' => Hash::make('123456'),
                'role' => 'admin',
                'avatar' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                'phone' => '+1234567890',
                'address' => '123 Admin Street, Admin City',
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                'phone' => '+1234567891',
                'address' => '456 User Avenue, User City',
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'first_name' => 'Jane',
                'last_name' => 'Smith',
                'name' => 'Jane Smith',
                'email' => 'jane@example.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'avatar' => 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
                'phone' => '+1234567892',
                'address' => '789 Customer Road, Customer City',
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'first_name' => 'Vendor',
                'last_name' => 'User',
                'name' => 'Vendor User',
                'email' => 'vendor@example.com',
                'password' => Hash::make('password123'),
                'role' => 'vendor',
                'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
                'phone' => '+1234567893',
                'address' => '321 Vendor Lane, Vendor City',
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Insert users
        DB::table('users')->insert($users);

        $this->command->info('Users seeded successfully!');
        $this->command->info('Test credentials:');
        $this->command->info('Admin: admin@solemate.com / 123456');
        $this->command->info('User: john@example.com / password123');
        $this->command->info('User: jane@example.com / password123');
        $this->command->info('Vendor: vendor@example.com / password123');
    }
}
