import { ref, computed, onMounted } from 'vue'
import { useImages } from './useImages'

export function useHomeData() {
  // Images from useImages
  const {
    heroImage,
    featuredImages,
    categoryImages,
    instagramImages,
    fetchHomePageImages
  } = useImages()

  // Featured products data
  const featuredProducts = ref([
    {
      id: 1,
      name: 'Retro Runner',
      description: 'A timeless design for everyday wear.',
      price: 120,
      originalPrice: null,
      rating: 4.8,
      badge: 'HOT',
      badgeColor: 'bg-primary-orange',
      isWishlisted: false,
      image: featuredImages.value[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3'
    },
    {
      id: 2,
      name: 'Street Style Classic',
      description: 'Iconic style with a modern twist.',
      price: 110,
      originalPrice: 150,
      rating: 4.9,
      badge: 'SALE',
      badgeColor: 'bg-accent-green',
      isWishlisted: true,
      image: featuredImages.value[1] || 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3'
    },
    {
      id: 3,
      name: 'Performance Trainer',
      description: 'Engineered for peak performance.',
      price: 180,
      originalPrice: null,
      rating: 5.0,
      badge: null,
      badgeColor: null,
      isWishlisted: false,
      image: featuredImages.value[2] || 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3'
    }
  ])

  // Categories data
  const categories = ref([
    {
      id: 1,
      name: 'Sports',
      description: 'Performance & Training',
      icon: 'sports_soccer',
      image: categoryImages.value[0] || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
      gradient: 'from-primary-orange/20 to-accent-green/20',
      hoverGradient: 'from-primary-orange/30 to-accent-green/30',
      route: '/products?category=sports'
    },
    {
      id: 2,
      name: 'Lifestyle',
      description: 'Casual & Comfort',
      icon: 'directions_walk',
      image: categoryImages.value[1] || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
      gradient: 'from-purple-500/20 to-pink-500/20',
      hoverGradient: 'from-purple-500/30 to-pink-500/30',
      route: '/products?category=lifestyle'
    },
    {
      id: 3,
      name: 'Running',
      description: 'Speed & Endurance',
      icon: 'running',
      image: categoryImages.value[2] || 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      hoverGradient: 'from-blue-500/30 to-cyan-500/30',
      route: '/products?category=running'
    },
    {
      id: 4,
      name: 'Gym',
      description: 'Strength & Power',
      icon: 'fitness_center',
      image: categoryImages.value[3] || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
      gradient: 'from-green-500/20 to-emerald-500/20',
      hoverGradient: 'from-green-500/30 to-emerald-500/30',
      route: '/products?category=gym'
    }
  ])

  // Trending categories data
  const trendingCategories = ref([
    {
      id: 1,
      name: 'Lifestyle',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOE_Q31FM3hotsT5tzdm2ohOqlpb3tylH7UZJYXfjXefd6ZwQIzWy-7qNsf431iSYj885lP73f6G0jgthujlT_mDLFbi8RspiCaqMkEmX3efJiMTAmknqsg2VNSIwC18_3P8dQzgOzDjJ4-Qv209q9Hll7GL4edOfEVFr5l7NWDq8eZlRh7Z2HWVL3oIyhG2XvGrNHk9TrRb89-kQq5nW53cMFnKpe7FzYtOKBDaAsaQ_CYGCNNiWKwv_Bt5UVKYcLQeRR45j5YiY',
      route: '/products?category=lifestyle'
    },
    {
      id: 2,
      name: 'Running',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1wO-de0k9OB2a7JS_W3uhEhK2FFHHVOl09LHX6oZ0o8-Ypu9FbRn1em7yU3x0ZG7U9tSLQaHIubdGW7-ImQuQYTGbNp5wKFLqzFDc1OrhcAGwhSCPqA132VP4NvuxuThqVOPnFk_XIBL7Vl7_Y1SdVxIA4mCcNVOS5Jw0N30EJ5Gc6oYW-6IxDl8mJnJ6IFTODMgkesuTt3dpsvmoUQgVNzF6wzWDBti8e4RZ69SSD4SYtiQco01EvErH2MIjheJb7m3pFoLikoQ',
      route: '/products?category=running'
    },
    {
      id: 3,
      name: 'Basketball',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAK_jVZg-rISRjorruof5nkkwZLc0oz16UqxQuLHSWL_FCDMQraYUSCS_fUcAw-FQGP9oOkvt0oamfzAwjwZwQDYcgGlteVa5n5V8gJiIOB9AK9MSCOIjIOWDxKHfOEmWukpF4krJNiVYtS3qiUYJKuV0t-meYn-0pjQsbfqcK7WuLjAUfBcDG_Z7xhz5YZk9sgUew4lwOvEOGFic7v0VNH4FEW3JSohlm-ysxoHb28Sw8QBGWPjNx5ix3BdINRB5jMJ1tkUdQu7Yo',
      route: '/products?category=basketball'
    },
    {
      id: 4,
      name: 'Skateboarding',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhqszI7KiFEfN01aJcKN5Qt9QF0AjDrjK4TaprQ9oAFEyiqFlnUUsiLoS8TL4IHpLQ9gMhUPSdxvcDlHSDCxkGakb3L_pyhmZyQJrmhQaQeQEgPOTS326GsO6ATPT31KXwKcpJqn31p1YwgPhQIPNgBvuwG4AI6Ow0oBHu_fdiZ2S7I1DPj7GFYkc_YVJk1-5-eGGvilXnD3TqO18a-TQsiti-ZkrV7M-iO-KxcjI5h2l27s09hrVMqmQc9zPedMx-AayZ4YIrFBA',
      route: '/products?category=skateboarding'
    }
  ])

  // Features data
  const features = ref([
    {
      id: 1,
      icon: 'local_shipping',
      title: 'Free Shipping',
      description: 'On orders over $100'
    },
    {
      id: 2,
      icon: 'assignment_return',
      title: 'Easy Returns',
      description: '30-day return policy'
    },
    {
      id: 3,
      icon: 'verified_user',
      title: 'Secure Payments',
      description: 'Trusted & encrypted'
    },
    {
      id: 4,
      icon: 'military_tech',
      title: 'Authenticity Guaranteed',
      description: '100% Genuine products'
    }
  ])

  // Hero product data
  const heroProduct = ref({
    id: 'quantum-leap-x1',
    name: 'Quantum Leap X1',
    description: 'Experience the future of footwear. Unparalleled comfort, futuristic design.',
    badge: 'NEW ARRIVAL',
    badgeColor: 'bg-orange-500',
    backgroundImage: heroImage,
    sizes: [7, 8, 9, 10, 11],
    selectedSize: 9
  })

  // Instagram posts data
  const instagramPosts = ref(instagramImages.value || [])

  // Loading and error states
  const isLoadingProducts = ref(false)
  const productsError = ref(null)
  const cartItemsCount = ref(0)
  const searchSuggestions = ref([])

  // Load featured products from API
  const loadFeaturedProducts = async () => {
    try {
      isLoadingProducts.value = true
      productsError.value = null

      // Mock data for development
      // const response = await fetch('/api/featured-products')
      // const data = await response.json()
      // featuredProducts.value = data

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

    } catch (error) {
      console.error('Error loading featured products:', error)
      productsError.value = 'Failed to load products. Please try again.'
    } finally {
      isLoadingProducts.value = false
    }
  }

  // Load cart items count
  const loadCartItemsCount = async () => {
    try {
      // Mock data for development
      // const response = await fetch('/api/cart/count')
      // const data = await response.json()
      // cartItemsCount.value = data.count

      // Simulate API call
      cartItemsCount.value = Math.floor(Math.random() * 5)
    } catch (error) {
      console.error('Error loading cart count:', error)
    }
  }

  // Search suggestions
  const getSearchSuggestions = (query) => {
    if (!query || query.length < 2) {
      searchSuggestions.value = []
      return
    }

    // Mock suggestions - replace with real API call
    const mockSuggestions = [
      { id: 1, name: 'Nike Air Max', type: 'Product', icon: 'sports_soccer' },
      { id: 2, name: 'Running Shoes', type: 'Category', icon: 'category' },
      { id: 3, name: 'Adidas', type: 'Brand', icon: 'branding_watermark' },
      { id: 4, name: 'Basketball', type: 'Category', icon: 'sports_basketball' }
    ]

    searchSuggestions.value = mockSuggestions.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5)
  }

  // Initialize data
  onMounted(() => {
    loadFeaturedProducts()
    loadCartItemsCount()
  })

  // Computed properties
  const discountPercentage = computed(() => (product) => {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    }
    return null
  })

  const formatPrice = (price) => {
    return `$${price}`
  }

  const formatRating = (rating) => {
    return rating.toFixed(1)
  }

  return {
    // Data
    featuredProducts,
    categories,
    trendingCategories,
    features,
    heroProduct,
    instagramPosts,

    // Images
    heroImage,
    featuredImages,
    categoryImages,
    instagramImages,

    // States
    isLoadingProducts,
    productsError,
    cartItemsCount,
    searchSuggestions,

    // Computed
    discountPercentage,

    // Methods
    formatPrice,
    formatRating,
    fetchHomePageImages,
    loadFeaturedProducts,
    loadCartItemsCount,
    getSearchSuggestions
  }
}
