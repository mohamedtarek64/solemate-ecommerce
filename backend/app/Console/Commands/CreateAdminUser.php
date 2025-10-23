<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:create-user';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create an admin user for testing';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $user = User::create([
            'name' => 'Admin User',
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@solemate.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'role' => 'admin',
        ]);

        $this->info('Admin user created successfully!');
        $this->info('Email: admin@solemate.com');
        $this->info('Password: password');

        return Command::SUCCESS;
    }
}
