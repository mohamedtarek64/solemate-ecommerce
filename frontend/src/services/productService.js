import api from './api';
import advancedCache from '../utils/advancedCache';
import requestBatcher from '../utils/requestBatcher';

class ProductService {
  constructor() {
    // Cache TTL configurations (in milliseconds)
    this.cacheTTL = {
      products: 10 * 60 * 1000,      // 10 minutes
      product: 15 * 60 * 1000,        // 15 minutes
      featured: 20 * 60 * 1000,       // 20 minutes
      category: 10 * 60 * 1000,       // 10 minutes
      search: 5 * 60 * 1000           // 5 minutes
    };

    // Pending requests map for deduplication
    this.pendingRequests = new Map();
  }

  /**
   * Deduplicate identical requests
   */
  async deduplicateRequest(key, requestFn) {
    // If request is already pending, return the existing promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // Create new request
    const promise = requestFn()
      .finally(() => {
        this.pendingRequests.delete(key);
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  // Get all products with caching
  async getProducts(params = {}) {
    const cacheKey = advancedCache.generateKey('/products', params);
    
    try {
      // Try cache first
      const cached = advancedCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Deduplicate request
      return await this.deduplicateRequest(cacheKey, async () => {
        const response = await api.get('/products', { params });
        const result = {
          success: true,
          data: response.data.data,
          meta: response.data.meta
        };
        
        // Cache the result
        advancedCache.set(cacheKey, result, this.cacheTTL.products);
        return result;
      });
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch products'
      };
    }
  }

  // Get product by ID with caching
  async getProduct(id) {
    const cacheKey = advancedCache.generateKey(`/products/${id}`, {});
    
    try {
      // Try cache first
      const cached = advancedCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Deduplicate request
      return await this.deduplicateRequest(cacheKey, async () => {
        const response = await api.get(`/products/${id}`);
        const result = {
          success: true,
          data: response.data.data
        };
        
        // Cache the result
        advancedCache.set(cacheKey, result, this.cacheTTL.product);
        return result;
      });
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch product'
      };
    }
  }

  // Get featured products with caching
  async getFeaturedProducts() {
    const cacheKey = 'featured_products';
    
    try {
      // Try cache first
      const cached = advancedCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Deduplicate request
      return await this.deduplicateRequest(cacheKey, async () => {
        const response = await api.get('/products/featured');
        const result = {
          success: true,
          data: response.data.data
        };
        
        // Cache the result for longer (featured products don't change often)
        advancedCache.set(cacheKey, result, this.cacheTTL.featured);
        return result;
      });
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch featured products'
      };
    }
  }

  // Get products by category with caching
  async getProductsByCategory(categoryId, params = {}) {
    const cacheKey = advancedCache.generateKey(`/products/category/${categoryId}`, params);
    
    try {
      // Try cache first
      const cached = advancedCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Deduplicate request
      return await this.deduplicateRequest(cacheKey, async () => {
        const response = await api.get(`/products/category/${categoryId}`, { params });
        const result = {
          success: true,
          data: response.data.data,
          meta: response.data.meta
        };
        
        // Cache the result
        advancedCache.set(cacheKey, result, this.cacheTTL.category);
        return result;
      });
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch category products'
      };
    }
  }

  // Search products with caching
  async searchProducts(query, params = {}) {
    const cacheKey = advancedCache.generateKey('/products/search', { q: query, ...params });
    
    try {
      // Try cache first
      const cached = advancedCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Deduplicate request
      return await this.deduplicateRequest(cacheKey, async () => {
        const response = await api.get('/products/search', { params: { q: query, ...params } });
        const result = {
          success: true,
          data: response.data.data,
          meta: response.data.meta
        };
        
        // Cache search results
        advancedCache.set(cacheKey, result, this.cacheTTL.search);
        return result;
      });
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Search failed'
      };
    }
  }

  /**
   * Clear all product caches
   */
  clearCache() {
    advancedCache.invalidatePattern('/products');
  }

  /**
   * Clear specific product cache
   */
  clearProductCache(productId) {
    const cacheKey = advancedCache.generateKey(`/products/${productId}`, {});
    advancedCache.delete(cacheKey);
  }

  // Get product reviews
  async getProductReviews(productId, params = {}) {
    try {
      const response = await productsAPI.getProductReviews(productId, params);
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch reviews'
      };
    }
  }

  // Add product review
  async addProductReview(productId, reviewData) {
    try {
      const response = await productsAPI.addProductReview(productId, reviewData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add review'
      };
    }
  }

  // Get product recommendations
  async getProductRecommendations(productId) {
    try {
      const response = await productsAPI.getProductRecommendations(productId);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch recommendations'
      };
    }
  }

  // Get related products
  async getRelatedProducts(productId) {
    try {
      const response = await productsAPI.getRelatedProducts(productId);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch related products'
      };
    }
  }

  // Get product variants
  async getProductVariants(productId) {
    try {
      const response = await productsAPI.getProductVariants(productId);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch product variants'
      };
    }
  }

  // Check product availability
  async checkProductAvailability(productId, quantity = 1) {
    try {
      const response = await productsAPI.checkProductAvailability(productId, quantity);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to check availability'
      };
    }
  }
}

// Create singleton instance
const productService = new ProductService();

export default productService;