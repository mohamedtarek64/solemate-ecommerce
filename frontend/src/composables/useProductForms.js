import { ref } from 'vue'

export function useProductForms() {
  // Modal states
  const showAddProductModal = ref(false)
  const showEditProductModal = ref(false)
  const showProductModal = ref(false)
  const isSubmitting = ref(false)
  const selectedProduct = ref(null)

  // New product form
  const newProduct = ref({
    name: '',
    slug: '',
    sku: '',
    brand: '',
    gender: '',
    category: '',
    status: 'draft',
    price: '',
    quantity: '',
    description: '',
    short_description: '',
    colors: []
  })

  // Edit product form
  const editProductForm = ref({
    name: '',
    brand: '',
    category: '',
    price: '',
    compare_price: '',
    quantity: '',
    sku: '',
    weight: '',
    status: 'active',
    featured: false,
    image_url: '',
    images: '',
    video_url: '',
    description: '',
    short_description: '',
    colors: []
  })

  // Form functions
  const resetNewProduct = () => {
    newProduct.value = {
      name: '',
      slug: '',
      sku: '',
      brand: '',
      gender: '',
      category: '',
      status: 'draft',
      price: '',
      quantity: '',
      description: '',
      short_description: '',
      colors: []
    }
  }

  const resetEditProduct = () => {
    editProductForm.value = {
      name: '',
      brand: '',
      category: '',
      price: '',
      compare_price: '',
      quantity: '',
      sku: '',
      weight: '',
      status: 'active',
      featured: false,
      image_url: '',
      images: '',
      video_url: '',
      description: '',
      short_description: '',
      colors: []
    }
  }

  // Color management functions
  const addColor = () => {
    newProduct.value.colors.push({
      code: '#000000',
      name: '',
      price: newProduct.value.price || '',
      quantity: newProduct.value.quantity || '',
      image_url: '',
      images: '',
      video_url: '',
      videos: '',
      gallery_images: ''
    })
  }

  const removeColor = (index) => {
    newProduct.value.colors.splice(index, 1)
  }

  // Product CRUD operations
  const addProduct = async (loadProducts, showToastMessage) => {
    try {
      isSubmitting.value = true

      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')

      // Prepare product data
      const productData = {
        name: newProduct.value.name,
        slug: newProduct.value.slug || newProduct.value.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        sku: newProduct.value.sku || `PROD-${Date.now()}`,
        brand: newProduct.value.brand,
        gender: newProduct.value.gender,
        category: newProduct.value.category,
        status: newProduct.value.status,
        price: parseFloat(newProduct.value.price),
        quantity: parseInt(newProduct.value.quantity),
        description: newProduct.value.description,
        short_description: newProduct.value.short_description,
        colors: newProduct.value.colors.filter(color => color.code && color.code.trim()).map(color => ({
          code: color.code.trim(),
          name: color.name ? color.name.trim() : color.code.trim(),
          price: color.price ? parseFloat(color.price) : null,
          quantity: color.quantity ? parseInt(color.quantity) : null,
          image_url: color.image_url || null,
          images: color.images ? color.images.split(',').map(img => img.trim()).filter(img => img) : [],
          video_url: color.video_url || null,
          videos: color.videos ? color.videos.split(',').map(vid => vid.trim()).filter(vid => vid) : [],
          gallery_images: color.gallery_images ? color.gallery_images.split(',').map(img => img.trim()).filter(img => img) : []
        }))
      }

      const response = await fetch('http://127.0.0.1:8000/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(productData)
      })

      if (response.ok) {
        await loadProducts()
        showAddProductModal.value = false
        resetNewProduct()
        showToastMessage('Product added successfully!', 'success')
      } else {
        const errorResult = await response.json()
        throw new Error(errorResult.message || 'Failed to add product')
      }
    } catch (err) {
      console.error('Error adding product:', err)
      showToastMessage('Error adding product: ' + err.message, 'error')
    } finally {
      isSubmitting.value = false
    }
  }

  const updateProduct = async (selectedProduct, loadProducts, showToastMessage) => {
    try {
      isSubmitting.value = true

      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')

      // Prepare product data
      const productData = {
        name: editProductForm.value.name,
        brand: editProductForm.value.brand,
        category: editProductForm.value.category,
        price: parseFloat(editProductForm.value.price),
        quantity: parseInt(editProductForm.value.quantity),
        image_url: editProductForm.value.image_url,
        images: editProductForm.value.images ? editProductForm.value.images.split(',').map(img => img.trim()).filter(img => img) : [],
        video_url: editProductForm.value.video_url,
        description: editProductForm.value.description
      }

      const response = await fetch(`http://127.0.0.1:8000/api/admin/products/${selectedProduct.value.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(productData)
      })

      if (response.ok) {
        await loadProducts()
        showEditProductModal.value = false
        selectedProduct.value = null
        showToastMessage('Product updated successfully!', 'success')
      } else {
        const errorResult = await response.json()
        throw new Error(errorResult.message || 'Failed to update product')
      }
    } catch (err) {
      console.error('Error updating product:', err)
      showToastMessage('Error updating product: ' + err.message, 'error')
    } finally {
      isSubmitting.value = false
    }
  }

  const viewProduct = (product) => {
    showProductModal.value = true
    selectedProduct.value = product
  }

  const editProduct = (product) => {
    showEditProductModal.value = true
    selectedProduct.value = product
    editProductForm.value = {
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      image_url: product.image_url,
      images: Array.isArray(product.images) ? product.images.join(', ') : (product.images || ''),
      video_url: product.video_url || '',
      description: product.description
    }
  }

  // Export functions
  const exportProducts = async (showToastMessage) => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')

      const response = await fetch('http://127.0.0.1:8000/api/admin/products/export', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        showToastMessage('Products exported successfully!', 'success')
      } else {
        throw new Error('Failed to export products')
      }
    } catch (err) {
      console.error('Error exporting products:', err)
      showToastMessage('Error exporting products: ' + err.message, 'error')
    }
  }

  const bulkDelete = async (selectedProducts, loadProducts, showToastMessage) => {
    if (confirm(`Are you sure you want to delete ${selectedProducts.value.length} products?`)) {
      try {
        const token = localStorage.getItem('auth_token') || localStorage.getItem('token')

        for (const productId of selectedProducts.value) {
          const response = await fetch(`http://127.0.0.1:8000/api/products/${productId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          })

          if (!response.ok) {
            throw new Error(`Failed to delete product ${productId}`)
          }
        }

        await loadProducts()
        selectedProducts.value = []
        showToastMessage('Products deleted successfully!', 'success')
      } catch (err) {
        console.error('Error deleting products:', err)
        showToastMessage('Error deleting products: ' + err.message, 'error')
      }
    }
  }

  return {
    // States
    showAddProductModal,
    showEditProductModal,
    showProductModal,
    isSubmitting,
    selectedProduct,
    newProduct,
    editProductForm,

    // Functions
    resetNewProduct,
    resetEditProduct,
    addColor,
    removeColor,
    addProduct,
    updateProduct,
    viewProduct,
    editProduct,
    exportProducts,
    bulkDelete
  }
}
