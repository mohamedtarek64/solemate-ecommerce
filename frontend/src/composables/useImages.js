import { ref } from 'vue'
import { loadAllImages, getAllImages } from '@/services/imageApiService'

export function useImages() {
  // Image data - using API endpoints with token from database
  const heroImage = ref('')
  const featuredImages = ref([])
  const categoryImages = ref([])
  const instagramImages = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Function to load images from database with token
  const loadImagesFromAPI = async () => {
    try {
    loading.value = true
    error.value = null

      const token = localStorage.getItem('auth_token')

      if (!token) {
        // Try public endpoints first
        await loadImagesFromPublicAPI()
        return
      }

      const images = await loadAllImages()

      // Update reactive refs with loaded images
      heroImage.value = images.heroImage || ''
      featuredImages.value = images.featuredImages || []
      categoryImages.value = images.categoryImages || []
      instagramImages.value = images.instagramImages || []

      } catch (error) {
      console.error('Error loading images from database:', error)
      error.value = error.message || 'Failed to load images'
    } finally {
      loading.value = false
    }
  }

  // Function to load images from public endpoints (no token required)
  const loadImagesFromPublicAPI = async () => {
    try {
      // Load hero image from products_women table
      const heroResponse = await fetch('/api/public/product-images/hero')
      if (heroResponse.ok) {
        const heroData = await heroResponse.json()
        if (heroData.success && heroData.image_url) {
          heroImage.value = heroData.image_url
          } else {
          console.warn('Hero image API returned no image:', heroData.message)
          // Set a fallback image
          heroImage.value = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3'
        }
      } else {
        console.error('Failed to load hero image:', heroResponse.status)
        // Set a fallback image
        heroImage.value = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3'
      }

      // Load featured images from products_women table
      const featuredResponse = await fetch('/api/public/product-images/featured')
      if (featuredResponse.ok) {
        const featuredData = await featuredResponse.json()
        featuredImages.value = featuredData.images?.map(img => img.image_url) || []
        }

      // Load category images from products_women table
      const categoryResponse = await fetch('/api/public/product-images/categories')
      if (categoryResponse.ok) {
        const categoryData = await categoryResponse.json()
        categoryImages.value = categoryData.images?.map(img => img.image_url) || []
        }

      // Load instagram images from products_women table
      const instagramResponse = await fetch('/api/public/product-images/instagram')
      if (instagramResponse.ok) {
        const instagramData = await instagramResponse.json()
        instagramImages.value = instagramData.images?.map(img => img.image_url) || []
        }

      } catch (error) {
      console.error('Error loading images from products_women table:', error)
      error.value = 'Failed to load images from products_women table'
    }
  }

  // Function to refresh images (useful for admin or after updates)
  const refreshImages = async () => {
    await loadImagesFromAPI()
  }

  // Function to get all images (for debugging or admin)
  const getAllImagesFromDB = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        return []
      }

      const allImages = await getAllImages()
      return allImages
    } catch (error) {
      console.error('Error getting all images:', error)
      return []
    }
  }

  return {
    // Reactive data
    heroImage,
    featuredImages,
    categoryImages,
    instagramImages,
    loading,
    error,

    // Methods
    loadImagesFromAPI,
    loadImagesFromPublicAPI,
    refreshImages,
    getAllImagesFromDB
  }
}
