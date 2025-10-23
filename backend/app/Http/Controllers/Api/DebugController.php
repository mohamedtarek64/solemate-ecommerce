<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DebugController extends Controller
{
    public function getProducts(Request $request)
    {
        try {
            $products = DB::table('products')
                ->where('is_active', true)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $products,
                'count' => $products->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get debug products: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getTables(Request $request)
    {
        try {
            $tables = DB::select('SHOW TABLES');
            $tableNames = array_map(function($table) {
                return array_values((array)$table)[0];
            }, $tables);

            return response()->json([
                'success' => true,
                'data' => $tableNames
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get tables: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getTableStructure(Request $request, $tableName)
    {
        try {
            $columns = DB::select("DESCRIBE {$tableName}");
            
            return response()->json([
                'success' => true,
                'data' => $columns
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get table structure: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getTableData(Request $request, $tableName)
    {
        try {
            $limit = $request->get('limit', 10);
            $data = DB::table($tableName)->limit($limit)->get();
            
            return response()->json([
                'success' => true,
                'data' => $data,
                'count' => $data->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get table data: ' . $e->getMessage()
            ], 500);
        }
    }

    public function testConnection(Request $request)
    {
        try {
            $connection = DB::connection()->getPdo();
            
            return response()->json([
                'success' => true,
                'message' => 'Database connection successful',
                'driver' => DB::connection()->getDriverName()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Database connection failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getSystemInfo(Request $request)
    {
        try {
            $info = [
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
                'memory_limit' => ini_get('memory_limit'),
                'max_execution_time' => ini_get('max_execution_time'),
                'upload_max_filesize' => ini_get('upload_max_filesize'),
                'post_max_size' => ini_get('post_max_size'),
                'database_driver' => DB::connection()->getDriverName(),
                'cache_driver' => config('cache.default'),
                'session_driver' => config('session.driver'),
                'queue_driver' => config('queue.default')
            ];

            return response()->json([
                'success' => true,
                'data' => $info
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get system info: ' . $e->getMessage()
            ], 500);
        }
    }
}
