import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/utils/apiClient'
import { useToast } from 'vue-toastification'

export const useCategoryStore = defineStore('categories', () => {
  // State
  const categories = ref([])
  const categoryTree = ref([])
  const currentCategory = ref(null)
  const isLoading = ref(false)
  const errors = ref({})

  // Getters
  const hasCategories = computed(() => categories.value.length > 0)
  const hasCategoryTree = computed(() => categoryTree.value.length > 0)
  const topLevelCategories = computed(() => 
    categories.value.filter(category => !category.parent_id)
  )

  // Actions
  const setCategories = (categoryList) => {
    categories.value = categoryList
  }

  const setCategoryTree = (tree) => {
    categoryTree.value = tree
  }

  const setCurrentCategory = (category) => {
    currentCategory.value = category
  }

  const setErrors = (errorData) => {
    errors.value = errorData
  }

  const clearErrors = () => {
    errors.value = {}
  }

  // Get all categories
  const getCategories = async (params = {}) => {
    isLoading.value = true
    clearErrors()
    
    try {
      const response = await apiClient.get('/v1/categories', { params })
      setCategories(response.data.data)
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch categories'
      setErrors(error.response?.data?.errors || {})
      useToast().error(errorMessage)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Get category tree (hierarchical structure)
  const getCategoryTree = async () => {
    try {
      const response = await apiClient.get('/v1/categories/tree')
      setCategoryTree(response.data.data)
      return response.data
    } catch (error) {
      console.error('Error fetching category tree:', error)
      setCategoryTree([])
      throw error
    }
  }

  // Get single category by ID
  const getCategory = async (id) => {
    isLoading.value = true
    clearErrors()
    
    try {
      const response = await apiClient.get(`/v1/categories/${id}`)
      setCurrentCategory(response.data.data)
      return response.data.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Category not found'
      setErrors(error.response?.data?.errors || {})
      useToast().error(errorMessage)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Get category breadcrumbs
  const getCategoryBreadcrumbs = (categoryId) => {
    const breadcrumbs = []
    const findCategory = (categories, id, path = []) => {
      for (const category of categories) {
        const currentPath = [...path, category]
        
        if (category.id === id) {
          return currentPath
        }
        
        if (category.children && category.children.length > 0) {
          const found = findCategory(category.children, id, currentPath)
          if (found) return found
        }
      }
      return null
    }
    
    const path = findCategory(categoryTree.value, categoryId)
    return path || []
  }

  // Get subcategories
  const getSubcategories = (parentId) => {
    return categories.value.filter(category => category.parent_id === parentId)
  }

  // Build category tree from flat list
  const buildCategoryTree = (flatCategories) => {
    const categoryMap = new Map()
    const rootCategories = []

    // Create map of all categories
    flatCategories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] })
    })

    // Build tree structure
    flatCategories.forEach(category => {
      if (category.parent_id && categoryMap.has(category.parent_id)) {
        categoryMap.get(category.parent_id).children.push(categoryMap.get(category.id))
      } else {
        rootCategories.push(categoryMap.get(category.id))
      }
    })

    return rootCategories
  }

  // Search categories
  const searchCategories = async (query) => {
    try {
      const response = await apiClient.get('/v1/categories/search', {
        params: { search: query }
      })
      return response.data.data
    } catch (error) {
      console.error('Error searching categories:', error)
      return []
    }
  }

  // Get category statistics
  const getCategoryStats = async () => {
    try {
      const response = await apiClient.get('/v1/categories/stats')
      return response.data.data
    } catch (error) {
      console.error('Error fetching category stats:', error)
      return {}
    }
  }

  // Clear all data
  const clearCategories = () => {
    categories.value = []
    categoryTree.value = []
    currentCategory.value = null
  }

  return {
    // State
    categories,
    categoryTree,
    currentCategory,
    isLoading,
    errors,
    
    // Getters
    hasCategories,
    hasCategoryTree,
    topLevelCategories,
    
    // Actions
    setCategories,
    setCategoryTree,
    setCurrentCategory,
    setErrors,
    clearErrors,
    getCategories,
    getCategoryTree,
    getCategory,
    getCategoryBreadcrumbs,
    getSubcategories,
    buildCategoryTree,
    searchCategories,
    getCategoryStats,
    clearCategories
  }
})
