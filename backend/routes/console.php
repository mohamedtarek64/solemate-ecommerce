<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

/*
|--------------------------------------------------------------------------
| Console Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of your Closure based console
| commands. Each Closure is bound to a command instance allowing a
| simple approach to interacting with each command's IO methods.
|
*/

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Custom console commands
Artisan::command('solemate:install', function () {
    $this->info('Installing SoleMate E-Commerce...');
    
    // Run migrations
    $this->call('migrate');
    
    // Run seeders
    $this->call('db:seed');
    
    // Generate application key
    $this->call('key:generate');
    
    // Install Passport
    $this->call('passport:install');
    
    // Create storage link
    $this->call('storage:link');
    
    $this->info('SoleMate E-Commerce installed successfully!');
})->purpose('Install SoleMate E-Commerce application');

Artisan::command('solemate:reset', function () {
    $this->info('Resetting SoleMate E-Commerce...');
    
    // Drop all tables
    $this->call('migrate:fresh');
    
    // Run seeders
    $this->call('db:seed');
    
    // Clear cache
    $this->call('cache:clear');
    $this->call('config:clear');
    $this->call('route:clear');
    $this->call('view:clear');
    
    $this->info('SoleMate E-Commerce reset successfully!');
})->purpose('Reset SoleMate E-Commerce application');

Artisan::command('solemate:backup', function () {
    $this->info('Creating backup...');
    
    // Create database backup
    $this->call('backup:run');
    
    $this->info('Backup created successfully!');
})->purpose('Create application backup');