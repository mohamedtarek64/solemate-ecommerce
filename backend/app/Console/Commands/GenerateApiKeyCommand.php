<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;

class GenerateApiKeyCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'api:generate-key {--show} {--length=32}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate a new API key for the application';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $length = (int) $this->option('length');
        $show = $this->option('show');

        $this->info('Generating API key...');

        // Generate application key if not exists
        if (empty(config('app.key'))) {
            $this->info('Generating application key...');
            Artisan::call('key:generate');
            $this->info('✓ Application key generated');
        }

        // Generate JWT secret if not exists
        if (empty(config('jwt.secret'))) {
            $this->info('Generating JWT secret...');
            $jwtSecret = Str::random(64);
            $this->updateEnvFile('JWT_SECRET', $jwtSecret);
            $this->info('✓ JWT secret generated');
        }

        // Generate Sanctum token prefix
        $sanctumPrefix = Str::random(8);
        $this->updateEnvFile('SANCTUM_TOKEN_PREFIX', $sanctumPrefix);
        $this->info('✓ Sanctum token prefix generated');

        // Generate Passport keys if needed
        if ($this->confirm('Generate Passport keys?', false)) {
            $this->generatePassportKeys();
        }

        // Generate custom API key
        $apiKey = Str::random($length);
        $this->updateEnvFile('API_KEY', $apiKey);

        if ($show) {
            $this->info('Generated API Key: ' . $apiKey);
        } else {
            $this->info('✓ API key generated and saved to .env file');
        }

        $this->info('API key generation completed!');
    }

    /**
     * Update environment file.
     */
    protected function updateEnvFile(string $key, string $value): void
    {
        $envFile = base_path('.env');
        
        if (!file_exists($envFile)) {
            $this->error('.env file not found!');
            return;
        }

        $envContent = file_get_contents($envFile);
        
        if (strpos($envContent, $key . '=') !== false) {
            // Update existing key
            $envContent = preg_replace(
                '/^' . preg_quote($key) . '=.*$/m',
                $key . '=' . $value,
                $envContent
            );
        } else {
            // Add new key
            $envContent .= "\n" . $key . '=' . $value . "\n";
        }

        file_put_contents($envFile, $envContent);
    }

    /**
     * Generate Passport keys.
     */
    protected function generatePassportKeys(): void
    {
        $this->info('Generating Passport keys...');
        
        try {
            Artisan::call('passport:keys');
            $this->info('✓ Passport keys generated');
            
            Artisan::call('passport:client', [
                '--personal' => true,
                '--name' => 'SoleMate Personal Access Client'
            ]);
            $this->info('✓ Passport personal access client created');
        } catch (\Exception $e) {
            $this->error('Failed to generate Passport keys: ' . $e->getMessage());
        }
    }

    /**
     * Generate random string.
     */
    protected function generateRandomString(int $length): string
    {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';
        
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }
        
        return $randomString;
    }
}
