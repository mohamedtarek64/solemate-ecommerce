<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Crypt;

class EncryptStripeKeys extends Command
{
    protected $signature = 'stripe:encrypt-keys';
    protected $description = 'Encrypt Stripe keys for secure storage';

    public function handle()
    {
        $this->info('🔐 Stripe Keys Encryption Tool');
        $this->line('');

        // Get keys from user input
        $publishableKey = $this->ask('Enter Stripe Publishable Key (pk_test_...)');
        $secretKey = $this->secret('Enter Stripe Secret Key (sk_test_...)');

        if (!$publishableKey || !$secretKey) {
            $this->error('❌ Both keys are required!');
            return 1;
        }

        // Validate keys format
        if (!str_starts_with($publishableKey, 'pk_test_') && !str_starts_with($publishableKey, 'pk_live_')) {
            $this->error('❌ Invalid publishable key format!');
            return 1;
        }

        if (!str_starts_with($secretKey, 'sk_test_') && !str_starts_with($secretKey, 'sk_live_')) {
            $this->error('❌ Invalid secret key format!');
            return 1;
        }

        // Encrypt the keys
        $encryptedPublishable = Crypt::encryptString($publishableKey);
        $encryptedSecret = Crypt::encryptString($secretKey);

        // Create encrypted config file
        $configContent = "<?php\n\nreturn [\n";
        $configContent .= "    'publishable_key' => '{$encryptedPublishable}',\n";
        $configContent .= "    'secret_key' => '{$encryptedSecret}',\n";
        $configContent .= "];\n";

        file_put_contents(config_path('stripe_encrypted.php'), $configContent);

        $this->info('✅ Keys encrypted successfully!');
        $this->line('');
        $this->info('📁 Encrypted config saved to: config/stripe_encrypted.php');
        $this->line('');
        $this->warn('⚠️  Add this to your .gitignore:');
        $this->line('config/stripe_encrypted.php');
        $this->line('');
        $this->info('🔧 Usage in your code:');
        $this->line('$publishableKey = Crypt::decrypt(config(\'stripe_encrypted.publishable_key\'));');
        $this->line('$secretKey = Crypt::decrypt(config(\'stripe_encrypted.secret_key\'));');

        return 0;
    }
}