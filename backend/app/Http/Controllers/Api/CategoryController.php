<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        try {
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 20);
            $featured = $request->get('featured', false);

            $query = DB::table('categories')
                ->where('is_active', true);

            if ($featured) {
                $query->where('is_featured', true);
            }

            $categories = $query->orderBy('name', 'asc')
                ->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get categories: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(Request $request, $id)
    {
        try {
            $category = DB::table('categories')
                ->where('id', $id)
                ->where('is_active', true)
                ->first();

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Category not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $category
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get category: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getProducts(Request $request, $id)
    {
        try {
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 12);
            $sort = $request->get('sort', 'created_at');
            $order = $request->get('order', 'desc');

            $products = DB::table('products')
                ->where('category_id', $id)
                ->where('is_active', true)
                ->orderBy($sort, $order)
                ->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'success' => true,
                'data' => $products
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get category products: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getTree(Request $request)
    {
        try {
            $categories = DB::table('categories')
                ->where('is_active', true)
                ->orderBy('parent_id', 'asc')
                ->orderBy('name', 'asc')
                ->get();

            // Build tree structure
            $tree = $this->buildCategoryTree($categories);

            return response()->json([
                'success' => true,
                'data' => $tree
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get category tree: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getFeatured(Request $request)
    {
        try {
            $featuredCategories = DB::table('categories')
                ->where('is_active', true)
                ->where('is_featured', true)
                ->orderBy('name', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $featuredCategories
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get featured categories: ' . $e->getMessage()
            ], 500);
        }
    }

    private function buildCategoryTree($categories, $parentId = null)
    {
        $tree = [];
        
        foreach ($categories as $category) {
            if ($category->parent_id == $parentId) {
                $children = $this->buildCategoryTree($categories, $category->id);
                $category->children = $children;
                $tree[] = $category;
            }
        }
        
        return $tree;
    }
}

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        try {
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 20);
            $featured = $request->get('featured', false);

            $query = DB::table('categories')
                ->where('is_active', true);

            if ($featured) {
                $query->where('is_featured', true);
            }

            $categories = $query->orderBy('name', 'asc')
                ->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get categories: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(Request $request, $id)
    {
        try {
            $category = DB::table('categories')
                ->where('id', $id)
                ->where('is_active', true)
                ->first();

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Category not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $category
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get category: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getProducts(Request $request, $id)
    {
        try {
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 12);
            $sort = $request->get('sort', 'created_at');
            $order = $request->get('order', 'desc');

            $products = DB::table('products')
                ->where('category_id', $id)
                ->where('is_active', true)
                ->orderBy($sort, $order)
                ->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'success' => true,
                'data' => $products
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get category products: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getTree(Request $request)
    {
        try {
            $categories = DB::table('categories')
                ->where('is_active', true)
                ->orderBy('parent_id', 'asc')
                ->orderBy('name', 'asc')
                ->get();

            // Build tree structure
            $tree = $this->buildCategoryTree($categories);

            return response()->json([
                'success' => true,
                'data' => $tree
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get category tree: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getFeatured(Request $request)
    {
        try {
            $featuredCategories = DB::table('categories')
                ->where('is_active', true)
                ->where('is_featured', true)
                ->orderBy('name', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $featuredCategories
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get featured categories: ' . $e->getMessage()
            ], 500);
        }
    }

    private function buildCategoryTree($categories, $parentId = null)
    {
        $tree = [];
        
        foreach ($categories as $category) {
            if ($category->parent_id == $parentId) {
                $children = $this->buildCategoryTree($categories, $category->id);
                $category->children = $children;
                $tree[] = $category;
            }
        }
        
        return $tree;
    }
}

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        try {
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 20);
            $featured = $request->get('featured', false);

            $query = DB::table('categories')
                ->where('is_active', true);

            if ($featured) {
                $query->where('is_featured', true);
            }

            $categories = $query->orderBy('name', 'asc')
                ->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get categories: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(Request $request, $id)
    {
        try {
            $category = DB::table('categories')
                ->where('id', $id)
                ->where('is_active', true)
                ->first();

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Category not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $category
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get category: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getProducts(Request $request, $id)
    {
        try {
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 12);
            $sort = $request->get('sort', 'created_at');
            $order = $request->get('order', 'desc');

            $products = DB::table('products')
                ->where('category_id', $id)
                ->where('is_active', true)
                ->orderBy($sort, $order)
                ->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'success' => true,
                'data' => $products
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get category products: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getTree(Request $request)
    {
        try {
            $categories = DB::table('categories')
                ->where('is_active', true)
                ->orderBy('parent_id', 'asc')
                ->orderBy('name', 'asc')
                ->get();

            // Build tree structure
            $tree = $this->buildCategoryTree($categories);

            return response()->json([
                'success' => true,
                'data' => $tree
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get category tree: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getFeatured(Request $request)
    {
        try {
            $featuredCategories = DB::table('categories')
                ->where('is_active', true)
                ->where('is_featured', true)
                ->orderBy('name', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $featuredCategories
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get featured categories: ' . $e->getMessage()
            ], 500);
        }
    }

    private function buildCategoryTree($categories, $parentId = null)
    {
        $tree = [];
        
        foreach ($categories as $category) {
            if ($category->parent_id == $parentId) {
                $children = $this->buildCategoryTree($categories, $category->id);
                $category->children = $children;
                $tree[] = $category;
            }
        }
        
        return $tree;
    }
}

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        try {
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 20);
            $featured = $request->get('featured', false);

            $query = DB::table('categories')
                ->where('is_active', true);

            if ($featured) {
                $query->where('is_featured', true);
            }

            $categories = $query->orderBy('name', 'asc')
                ->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get categories: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(Request $request, $id)
    {
        try {
            $category = DB::table('categories')
                ->where('id', $id)
                ->where('is_active', true)
                ->first();

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Category not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $category
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get category: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getProducts(Request $request, $id)
    {
        try {
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 12);
            $sort = $request->get('sort', 'created_at');
            $order = $request->get('order', 'desc');

            $products = DB::table('products')
                ->where('category_id', $id)
                ->where('is_active', true)
                ->orderBy($sort, $order)
                ->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'success' => true,
                'data' => $products
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get category products: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getTree(Request $request)
    {
        try {
            $categories = DB::table('categories')
                ->where('is_active', true)
                ->orderBy('parent_id', 'asc')
                ->orderBy('name', 'asc')
                ->get();

            // Build tree structure
            $tree = $this->buildCategoryTree($categories);

            return response()->json([
                'success' => true,
                'data' => $tree
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get category tree: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getFeatured(Request $request)
    {
        try {
            $featuredCategories = DB::table('categories')
                ->where('is_active', true)
                ->where('is_featured', true)
                ->orderBy('name', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $featuredCategories
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get featured categories: ' . $e->getMessage()
            ], 500);
        }
    }

    private function buildCategoryTree($categories, $parentId = null)
    {
        $tree = [];
        
        foreach ($categories as $category) {
            if ($category->parent_id == $parentId) {
                $children = $this->buildCategoryTree($categories, $category->id);
                $category->children = $children;
                $tree[] = $category;
            }
        }
        
        return $tree;
    }
}

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        try {
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 20);
            $featured = $request->get('featured', false);

            $query = DB::table('categories')
                ->where('is_active', true);

            if ($featured) {
                $query->where('is_featured', true);
            }

            $categories = $query->orderBy('name', 'asc')
                ->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get categories: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(Request $request, $id)
    {
        try {
            $category = DB::table('categories')
                ->where('id', $id)
                ->where('is_active', true)
                ->first();

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Category not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $category
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get category: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getProducts(Request $request, $id)
    {
        try {
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 12);
            $sort = $request->get('sort', 'created_at');
            $order = $request->get('order', 'desc');

            $products = DB::table('products')
                ->where('category_id', $id)
                ->where('is_active', true)
                ->orderBy($sort, $order)
                ->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'success' => true,
                'data' => $products
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get category products: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getTree(Request $request)
    {
        try {
            $categories = DB::table('categories')
                ->where('is_active', true)
                ->orderBy('parent_id', 'asc')
                ->orderBy('name', 'asc')
                ->get();

            // Build tree structure
            $tree = $this->buildCategoryTree($categories);

            return response()->json([
                'success' => true,
                'data' => $tree
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get category tree: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getFeatured(Request $request)
    {
        try {
            $featuredCategories = DB::table('categories')
                ->where('is_active', true)
                ->where('is_featured', true)
                ->orderBy('name', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $featuredCategories
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get featured categories: ' . $e->getMessage()
            ], 500);
        }
    }

    private function buildCategoryTree($categories, $parentId = null)
    {
        $tree = [];
        
        foreach ($categories as $category) {
            if ($category->parent_id == $parentId) {
                $children = $this->buildCategoryTree($categories, $category->id);
                $category->children = $children;
                $tree[] = $category;
            }
        }
        
        return $tree;
    }
}
