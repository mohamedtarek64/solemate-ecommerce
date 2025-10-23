/**
 * Search utility functions
 */

/**
 * Build search query string from parameters
 */
export function buildSearchQuery(params) {
  const query = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        query.append(key, value.join(','))
      } else {
        query.append(key, value)
      }
    }
  })
  
  return query.toString()
}

/**
 * Parse search query string to parameters
 */
export function parseSearchQuery(queryString) {
  const params = new URLSearchParams(queryString)
  const result = {}
  
  for (const [key, value] of params.entries()) {
    if (value.includes(',')) {
      result[key] = value.split(',')
    } else if (value === 'true') {
      result[key] = true
    } else if (value === 'false') {
      result[key] = false
    } else if (!isNaN(value) && value !== '') {
      result[key] = Number(value)
    } else {
      result[key] = value
    }
  }
  
  return result
}

/**
 * Highlight search terms in text
 */
export function highlightSearchTerms(text, searchTerm, className = 'highlight') {
  if (!searchTerm || !text) return text
  
  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi')
  return text.replace(regex, `<span class="${className}">$1</span>`)
}

/**
 * Escape special regex characters
 */
export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Generate search suggestions based on query
 */
export function generateSuggestions(query, products, limit = 10) {
  if (!query || query.length < 2) return []
  
  const suggestions = new Set()
  const lowerQuery = query.toLowerCase()
  
  products.forEach(product => {
    // Check product name
    if (product.name.toLowerCase().includes(lowerQuery)) {
      suggestions.add(product.name)
    }
    
    // Check product description
    if (product.description && product.description.toLowerCase().includes(lowerQuery)) {
      const words = product.description.split(' ')
      words.forEach(word => {
        if (word.toLowerCase().includes(lowerQuery) && word.length > 2) {
          suggestions.add(word)
        }
      })
    }
    
    // Check categories
    if (product.categories) {
      product.categories.forEach(category => {
        if (category.name.toLowerCase().includes(lowerQuery)) {
          suggestions.add(category.name)
        }
      })
    }
    
    // Check tags
    if (product.tags) {
      product.tags.forEach(tag => {
        if (tag.name.toLowerCase().includes(lowerQuery)) {
          suggestions.add(tag.name)
        }
      })
    }
  })
  
  return Array.from(suggestions).slice(0, limit)
}

/**
 * Calculate search relevance score
 */
export function calculateRelevanceScore(product, searchTerm) {
  let score = 0
  const lowerSearchTerm = searchTerm.toLowerCase()
  
  // Exact name match (highest score)
  if (product.name.toLowerCase() === lowerSearchTerm) {
    score += 100
  }
  
  // Name contains search term
  if (product.name.toLowerCase().includes(lowerSearchTerm)) {
    score += 50
  }
  
  // Description contains search term
  if (product.description && product.description.toLowerCase().includes(lowerSearchTerm)) {
    score += 20
  }
  
  // SKU match
  if (product.sku && product.sku.toLowerCase().includes(lowerSearchTerm)) {
    score += 30
  }
  
  // Category match
  if (product.categories) {
    product.categories.forEach(category => {
      if (category.name.toLowerCase().includes(lowerSearchTerm)) {
        score += 15
      }
    })
  }
  
  // Tag match
  if (product.tags) {
    product.tags.forEach(tag => {
      if (tag.name.toLowerCase().includes(lowerSearchTerm)) {
        score += 10
      }
    })
  }
  
  // Boost featured products
  if (product.is_featured) {
    score += 5
  }
  
  // Boost products with higher ratings
  if (product.rating) {
    score += product.rating * 2
  }
  
  return score
}

/**
 * Sort products by relevance
 */
export function sortByRelevance(products, searchTerm) {
  return products.sort((a, b) => {
    const scoreA = calculateRelevanceScore(a, searchTerm)
    const scoreB = calculateRelevanceScore(b, searchTerm)
    return scoreB - scoreA
  })
}

/**
 * Filter products by criteria
 */
export function filterProducts(products, filters) {
  return products.filter(product => {
    // Price filter
    if (filters.price_min !== undefined && product.price < filters.price_min) {
      return false
    }
    if (filters.price_max !== undefined && product.price > filters.price_max) {
      return false
    }
    
    // Rating filter
    if (filters.rating !== undefined && product.rating < filters.rating) {
      return false
    }
    
    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      const productCategoryIds = product.categories?.map(cat => cat.id) || []
      const hasMatchingCategory = filters.categories.some(catId => 
        productCategoryIds.includes(catId)
      )
      if (!hasMatchingCategory) return false
    }
    
    // Brand filter
    if (filters.brands && filters.brands.length > 0) {
      if (!filters.brands.includes(product.brand_id)) {
        return false
      }
    }
    
    // Tag filter
    if (filters.tags && filters.tags.length > 0) {
      const productTagIds = product.tags?.map(tag => tag.id) || []
      const hasMatchingTag = filters.tags.some(tagId => 
        productTagIds.includes(tagId)
      )
      if (!hasMatchingTag) return false
    }
    
    // Stock filter
    if (filters.in_stock && product.stock_status !== 'in_stock') {
      return false
    }
    
    // Sale filter
    if (filters.on_sale && !product.is_on_sale) {
      return false
    }
    
    return true
  })
}

/**
 * Debounce function for search input
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function for scroll events
 */
export function throttle(func, limit) {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Format search result count
 */
export function formatResultCount(count) {
  if (count === 0) return 'No results'
  if (count === 1) return '1 result'
  if (count < 1000) return `${count} results`
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K results`
  return `${(count / 1000000).toFixed(1)}M results`
}

/**
 * Generate search URL with parameters
 */
export function generateSearchUrl(baseUrl, params) {
  const query = buildSearchQuery(params)
  return query ? `${baseUrl}?${query}` : baseUrl
}

/**
 * Extract search terms from query
 */
export function extractSearchTerms(query) {
  if (!query) return []
  
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(term => term.length > 1)
    .map(term => term.replace(/[^\w]/g, ''))
    .filter(term => term.length > 0)
}

/**
 * Check if search query is valid
 */
export function isValidSearchQuery(query) {
  if (!query || typeof query !== 'string') return false
  
  const trimmed = query.trim()
  return trimmed.length >= 2 && trimmed.length <= 100
}

/**
 * Normalize search query
 */
export function normalizeSearchQuery(query) {
  if (!query) return ''
  
  return query
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

/**
 * Get search query suggestions based on popular searches
 */
export function getQuerySuggestions(query, popularSearches, limit = 5) {
  if (!query || query.length < 2) return []
  
  const lowerQuery = query.toLowerCase()
  
  return popularSearches
    .filter(search => search.query.toLowerCase().includes(lowerQuery))
    .slice(0, limit)
    .map(search => search.query)
}
