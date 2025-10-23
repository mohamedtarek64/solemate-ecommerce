/**
 * Search Service
 * Handles all search-related API calls
 */

const API_BASE_URL = 'http://127.0.0.1:8000/api'

/**
 * Search for products
 * @param {Object} params - Search parameters
 * @returns {Promise<Object>}
 */
export const searchProducts = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      q: params.query || '',
      min_price: params.minPrice || 0,
      max_price: params.maxPrice || 999999,
      sort: params.sort || 'relevance',
      limit: params.limit || 20
    })

    if (params.brand) {
      queryParams.append('brand', params.brand)
    }

    if (params.category) {
      queryParams.append('category', params.category)
    }

    const response = await fetch(`${API_BASE_URL}/search?${queryParams}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Search error:', error)
    throw error
  }
}

/**
 * Get search suggestions
 * @param {string} query - Search query
 * @returns {Promise<Array>}
 */
export const getSearchSuggestions = async (query) => {
  try {
    if (!query || query.length < 1) {
      return []
    }

    const response = await fetch(
      `${API_BASE_URL}/search/suggestions?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.success ? data.data : []
  } catch (error) {
    console.error('Suggestions error:', error)
    return []
  }
}

/**
 * Get popular searches
 * @returns {Promise<Array>}
 */
export const getPopularSearches = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/search/popular`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.success ? data.data : []
  } catch (error) {
    console.error('Popular searches error:', error)
    return []
  }
}

/**
 * Save search to history (localStorage)
 * @param {string} query - Search query
 */
export const saveSearchHistory = (query) => {
  try {
    const history = getSearchHistory()
    const updatedHistory = [query, ...history.filter(q => q !== query)].slice(0, 10)
    localStorage.setItem('search_history', JSON.stringify(updatedHistory))
  } catch (error) {
    console.error('Error saving search history:', error)
  }
}

/**
 * Get search history from localStorage
 * @returns {Array<string>}
 */
export const getSearchHistory = () => {
  try {
    const history = localStorage.getItem('search_history')
    return history ? JSON.parse(history) : []
  } catch (error) {
    console.error('Error getting search history:', error)
    return []
  }
}

/**
 * Clear search history
 */
export const clearSearchHistory = () => {
  try {
    localStorage.removeItem('search_history')
  } catch (error) {
    console.error('Error clearing search history:', error)
  }
}

export default {
  searchProducts,
  getSearchSuggestions,
  getPopularSearches,
  saveSearchHistory,
  getSearchHistory,
  clearSearchHistory
}
