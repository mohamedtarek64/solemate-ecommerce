// Image API Service - handles all image-related API calls with token authentication
// Uses products_women table from database

const API_BASE_URL = 'http://127.0.0.1:8000/api'

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token')
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

// Load images by type from database
export const loadImagesByType = async (type) => {
  try {
    const response = await fetch(`${API_BASE_URL}/images?type=${type}`, {
      headers: getAuthHeaders()
    })

    if (response.ok) {
      const data = await response.json()
      return data.images || []
    }
    return []
  } catch (error) {
    console.error(`Error loading ${type} images:`, error)
    return []
  }
}

// Load hero image from products_women table
export const loadHeroImage = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/public/product-images/hero`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      return data.image_url || null
    }
    return null
  } catch (error) {
    console.error('Error loading hero image:', error)
    return null
  }
}

// Load featured images from products_women table
export const loadFeaturedImages = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/public/product-images/featured`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      return data.images?.map(img => img.image_url) || []
    }
    return []
  } catch (error) {
    console.error('Error loading featured images:', error)
    return []
  }
}

// Load category images from products_women table
export const loadCategoryImages = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/public/product-images/categories`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      return data.images?.map(img => img.image_url) || []
    }
    return []
  } catch (error) {
    console.error('Error loading category images:', error)
    return []
  }
}

// Load instagram images from products_women table
export const loadInstagramImages = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/public/product-images/instagram`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      return data.images?.map(img => img.image_url) || []
    }
    return []
  } catch (error) {
    console.error('Error loading instagram images:', error)
    return []
  }
}

// Load all images at once from products_women table
export const loadAllImages = async () => {
  try {
    const [hero, featured, categories, instagram] = await Promise.all([
      loadHeroImage(),
      loadFeaturedImages(),
      loadCategoryImages(),
      loadInstagramImages()
    ])

    return {
      heroImage: hero,
      featuredImages: featured,
      categoryImages: categories,
      instagramImages: instagram
    }
  } catch (error) {
    console.error('Error loading all images:', error)
    return {
      heroImage: null,
      featuredImages: [],
      categoryImages: [],
      instagramImages: []
    }
  }
}

// Get all product images from products_women table (for admin or debugging)
export const getAllImages = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/public/product-images/all`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      return data.images || []
    }
    return []
  } catch (error) {
    console.error('Error loading all product images:', error)
    return []
  }
}
