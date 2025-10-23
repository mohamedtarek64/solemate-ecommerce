<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'description',
        'is_public',
        'group',
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    /**
     * Scope for public settings.
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope for specific group.
     */
    public function scopeGroup($query, $group)
    {
        return $query->where('group', $group);
    }

    /**
     * Get setting value by key.
     */
    public static function getValue($key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        
        if (!$setting) {
            return $default;
        }
        
        return match($setting->type) {
            'boolean' => (bool) $setting->value,
            'integer' => (int) $setting->value,
            'float' => (float) $setting->value,
            'array' => json_decode($setting->value, true),
            'json' => json_decode($setting->value, true),
            default => $setting->value,
        };
    }

    /**
     * Set setting value by key.
     */
    public static function setValue($key, $value, $type = 'string', $description = null, $group = 'general')
    {
        $setting = static::where('key', $key)->first();
        
        $valueToStore = match($type) {
            'array', 'json' => json_encode($value),
            default => (string) $value,
        };
        
        if ($setting) {
            $setting->update([
                'value' => $valueToStore,
                'type' => $type,
                'description' => $description,
                'group' => $group,
            ]);
        } else {
            static::create([
                'key' => $key,
                'value' => $valueToStore,
                'type' => $type,
                'description' => $description,
                'group' => $group,
            ]);
        }
    }

    /**
     * Get all settings as array.
     */
    public static function getAllAsArray()
    {
        return static::all()->pluck('value', 'key')->toArray();
    }
}
