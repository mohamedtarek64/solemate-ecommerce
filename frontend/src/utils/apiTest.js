import api from '../services/api'

export const testApiConnection = async () => {
  try {
    // Test health check
    const healthResponse = await api.get('/health')
    // Test products endpoint
    const productsResponse = await api.get('/products?page=1&per_page=5')
    // Test featured products
    const featuredResponse = await api.get('/products/featured')
    return { success: true, message: 'API connection successful' }
    
  } catch (error) {
    console.error('❌ API connection failed:', error)
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || 'API connection failed' 
    }
  }
}

export const testAuthEndpoints = async () => {
  try {
    // Test if auth endpoints are accessible (should return 401 without token)
    const authResponse = await api.get('/auth/user')
    return { success: true, message: 'Auth endpoints accessible' }
    
  } catch (error) {
    if (error.response?.status === 401) {
      ')
      return { success: true, message: 'Auth endpoints working correctly' }
    }
    
    console.error('❌ Auth endpoints test failed:', error)
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || 'Auth endpoints test failed' 
    }
  }
}

export const testCartEndpoints = async () => {
  try {
    // Test if cart endpoints are accessible (should return 401 without token)
    const cartResponse = await api.get('/cart')
    return { success: true, message: 'Cart endpoints accessible' }
    
  } catch (error) {
    if (error.response?.status === 401) {
      ')
      return { success: true, message: 'Cart endpoints working correctly' }
    }
    
    console.error('❌ Cart endpoints test failed:', error)
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || 'Cart endpoints test failed' 
    }
  }
}

export const runAllTests = async () => {
  const results = {
    health: await testApiConnection(),
    auth: await testAuthEndpoints(),
    cart: await testCartEndpoints()
  }
  
  const allPassed = Object.values(results).every(result => result.success)
  
  return { allPassed, results }
}
