/**
 * Product Filters Composable
 * 
 * Enhanced filtering with caching and performance optimizations
 */

import { ref, watch } from 'vue'
import advancedCache from '@/utils/advancedCache'
import { debounce } from '@/utils/performance'

export function useProductFilters(fetchProducts, currentTab) {
  // Filter state
  const filters = ref({
    search: '',
    brand: '',
    size: '',
    color: '',
    category: '',
    price: 500,
    min_price: 0,
    max_price: 1000,
    sort: 'popular',
    colors: []
  })

  // Cache configuration
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  // Generate cache key from filters
  const generateCacheKey = (tab, page = 1) => {
    const filterStr = JSON.stringify({
      tab,
      page,
      search: filters.value.search,
      brand: filters.value.brand,
      size: filters.value.size,
      colors: filters.value.colors.sort(), // Sort for consistent keys
      category: filters.value.category,
      min_price: filters.value.min_price,
      max_price: filters.value.price || filters.value.max_price,
      sort: filters.value.sort
    })
    return `products_filtered_${btoa(filterStr)}`
  }

  // Debounced apply filters
  const debouncedApply = debounce(async () => {
    await fetchProducts(currentTab.value, 1)
  }, 300)

  // Update a single filter
  const updateFilter = (key, value) => {
    filters.value[key] = value
    debouncedApply()
  }

  // Update multiple filters at once
  const updateFilters = (updates) => {
    Object.keys(updates).forEach(key => {
      filters.value[key] = updates[key]
    })
    debouncedApply()
  }

  // Apply filters immediately
  const applyFilters = async () => {
    await fetchProducts(currentTab.value, 1)
  }

  // Clear all filters
  const clearFilters = () => {
    filters.value = {
      search: '',
      brand: '',
      size: '',
      color: '',
      category: '',
      price: 500,
      min_price: 0,
      max_price: 1000,
      sort: 'popular',
      colors: []
    }
    applyFilters()
  }

  // Clear specific filter
  const clearFilter = (key) => {
    if (key === 'colors') {
      filters.value.colors = []
    } else if (key === 'price') {
      filters.value.price = 500
      filters.value.max_price = 1000
    } else {
      filters.value[key] = ''
    }
    debouncedApply()
  }

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.value.search) count++
    if (filters.value.brand) count++
    if (filters.value.size) count++
    if (filters.value.colors && filters.value.colors.length > 0) count++
    if (filters.value.category) count++
    if (filters.value.price !== 500 || filters.value.max_price !== 1000) count++
    return count
  }

  // Load filters from localStorage
  const loadFiltersFromStorage = () => {
    try {
      const stored = localStorage.getItem('products_filters')
      if (stored) {
        const parsed = JSON.parse(stored)
        // Only restore non-sensitive filters
        filters.value = {
          ...filters.value,
          ...parsed,
          search: '', // Don't restore search
        }
        }
    } catch (error) {
      console.warn('⚠️ Failed to load filters from storage:', error)
    }
  }

  // Save filters to localStorage
  const saveFiltersToStorage = () => {
    try {
      localStorage.setItem('products_filters', JSON.stringify(filters.value))
    } catch (error) {
      console.warn('⚠️ Failed to save filters to storage:', error)
    }
  }

  // Watch filters and save to storage
  watch(() => filters.value, () => {
    saveFiltersToStorage()
  }, { deep: true })

  return {
    filters,
    updateFilter,
    updateFilters,
    applyFilters,
    clearFilters,
    clearFilter,
    getActiveFiltersCount,
    loadFiltersFromStorage,
    generateCacheKey,
    CACHE_TTL
  }
}


 * Product Filters Composable
 * 
 * Enhanced filtering with caching and performance optimizations
 */

import { ref, watch } from 'vue'
import advancedCache from '@/utils/advancedCache'
import { debounce } from '@/utils/performance'

export function useProductFilters(fetchProducts, currentTab) {
  // Filter state
  const filters = ref({
    search: '',
    brand: '',
    size: '',
    color: '',
    category: '',
    price: 500,
    min_price: 0,
    max_price: 1000,
    sort: 'popular',
    colors: []
  })

  // Cache configuration
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  // Generate cache key from filters
  const generateCacheKey = (tab, page = 1) => {
    const filterStr = JSON.stringify({
      tab,
      page,
      search: filters.value.search,
      brand: filters.value.brand,
      size: filters.value.size,
      colors: filters.value.colors.sort(), // Sort for consistent keys
      category: filters.value.category,
      min_price: filters.value.min_price,
      max_price: filters.value.price || filters.value.max_price,
      sort: filters.value.sort
    })
    return `products_filtered_${btoa(filterStr)}`
  }

  // Debounced apply filters
  const debouncedApply = debounce(async () => {
    await fetchProducts(currentTab.value, 1)
  }, 300)

  // Update a single filter
  const updateFilter = (key, value) => {
    filters.value[key] = value
    debouncedApply()
  }

  // Update multiple filters at once
  const updateFilters = (updates) => {
    Object.keys(updates).forEach(key => {
      filters.value[key] = updates[key]
    })
    debouncedApply()
  }

  // Apply filters immediately
  const applyFilters = async () => {
    await fetchProducts(currentTab.value, 1)
  }

  // Clear all filters
  const clearFilters = () => {
    filters.value = {
      search: '',
      brand: '',
      size: '',
      color: '',
      category: '',
      price: 500,
      min_price: 0,
      max_price: 1000,
      sort: 'popular',
      colors: []
    }
    applyFilters()
  }

  // Clear specific filter
  const clearFilter = (key) => {
    if (key === 'colors') {
      filters.value.colors = []
    } else if (key === 'price') {
      filters.value.price = 500
      filters.value.max_price = 1000
    } else {
      filters.value[key] = ''
    }
    debouncedApply()
  }

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.value.search) count++
    if (filters.value.brand) count++
    if (filters.value.size) count++
    if (filters.value.colors && filters.value.colors.length > 0) count++
    if (filters.value.category) count++
    if (filters.value.price !== 500 || filters.value.max_price !== 1000) count++
    return count
  }

  // Load filters from localStorage
  const loadFiltersFromStorage = () => {
    try {
      const stored = localStorage.getItem('products_filters')
      if (stored) {
        const parsed = JSON.parse(stored)
        // Only restore non-sensitive filters
        filters.value = {
          ...filters.value,
          ...parsed,
          search: '', // Don't restore search
        }
        }
    } catch (error) {
      console.warn('⚠️ Failed to load filters from storage:', error)
    }
  }

  // Save filters to localStorage
  const saveFiltersToStorage = () => {
    try {
      localStorage.setItem('products_filters', JSON.stringify(filters.value))
    } catch (error) {
      console.warn('⚠️ Failed to save filters to storage:', error)
    }
  }

  // Watch filters and save to storage
  watch(() => filters.value, () => {
    saveFiltersToStorage()
  }, { deep: true })

  return {
    filters,
    updateFilter,
    updateFilters,
    applyFilters,
    clearFilters,
    clearFilter,
    getActiveFiltersCount,
    loadFiltersFromStorage,
    generateCacheKey,
    CACHE_TTL
  }
}

