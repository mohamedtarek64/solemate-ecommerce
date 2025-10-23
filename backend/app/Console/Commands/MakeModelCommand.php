<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class MakeModelCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'make:model-custom {name} {--migration} {--controller} {--factory} {--seeder}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a custom model with all related files';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $name = $this->argument('name');
        $modelName = Str::studly($name);
        $tableName = Str::snake(Str::plural($name));

        $this->info("Creating custom model: {$modelName}");

        // Create model
        $this->createModel($modelName, $tableName);

        // Create migration if requested
        if ($this->option('migration')) {
            $this->call('make:migration', [
                'name' => "create_{$tableName}_table"
            ]);
        }

        // Create controller if requested
        if ($this->option('controller')) {
            $this->call('make:controller', [
                'name' => "{$modelName}Controller",
                '--resource' => true
            ]);
        }

        // Create factory if requested
        if ($this->option('factory')) {
            $this->call('make:factory', [
                'name' => "{$modelName}Factory"
            ]);
        }

        // Create seeder if requested
        if ($this->option('seeder')) {
            $this->call('make:seeder', [
                'name' => "{$modelName}Seeder"
            ]);
        }

        $this->info("Custom model {$modelName} created successfully!");
    }

    /**
     * Create the model file.
     */
    protected function createModel(string $modelName, string $tableName): void
    {
        $modelPath = app_path("Models/{$modelName}.php");

        if (File::exists($modelPath)) {
            $this->error("Model {$modelName} already exists!");
            return;
        }

        $stub = $this->getModelStub();
        $content = str_replace(
            ['{{ModelName}}', '{{TableName}}'],
            [$modelName, $tableName],
            $stub
        );

        File::put($modelPath, $content);
        $this->info("Model created: {$modelPath}");
    }

    /**
     * Get the model stub content.
     */
    protected function getModelStub(): string
    {
        return '<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class {{ModelName}} extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = \'{{TableName}}\';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        // Add your fillable attributes here
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        // Add your hidden attributes here
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        // Add your casts here
    ];

    /**
     * The attributes that should be mutated to dates.
     *
     * @var array<string>
     */
    protected $dates = [
        \'created_at\',
        \'updated_at\',
        \'deleted_at\',
    ];

    /**
     * Scope a query to only include active records.
     */
    public function scopeActive($query)
    {
        return $query->where(\'is_active\', true);
    }

    /**
     * Scope a query to only include inactive records.
     */
    public function scopeInactive($query)
    {
        return $query->where(\'is_active\', false);
    }
}';
    }
}
