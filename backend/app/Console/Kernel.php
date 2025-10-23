<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Clean up expired tokens daily
        $schedule->command('passport:purge')->daily();

        // Clean up old analytics data weekly
        $schedule->command('analytics:cleanup')->weekly();

        // Generate reports monthly
        $schedule->command('reports:generate')->monthly();

        // Backup database daily
        $schedule->command('backup:run')->daily()->at('02:00');

        // Send email notifications
        $schedule->command('notifications:send')->everyFiveMinutes();

        // Clean up abandoned carts
        $schedule->command('cart:cleanup')->hourly();

        // Update product search index
        $schedule->command('search:reindex')->daily()->at('03:00');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
