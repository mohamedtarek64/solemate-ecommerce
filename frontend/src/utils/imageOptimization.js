/**
 * Image Optimization Utilities
 * Provides utilities for optimizing image loading and performance
 */

// WebP support detection
export const supportsWebP = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
}

// Generate optimized image URL
export const getOptimizedImageUrl = (originalUrl, options = {}) => {
  if (!originalUrl) return null

  const {
    width = null,
    height = null,
    quality = 80,
    format = 'auto'
  } = options

  // If it's an external URL, return as is
  if (originalUrl.startsWith('http')) {
    return originalUrl
  }

  // For local images, you could implement image optimization here
  return originalUrl
}

// Lazy loading with Intersection Observer
export const createLazyImageLoader = () => {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        const src = img.dataset.src

        if (src) {
          img.src = src
          img.classList.remove('lazy')
          img.classList.add('loaded')
          observer.unobserve(img)
        }
      }
    })
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  })

  return imageObserver
}

// Preload critical images
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// Preload multiple images
export const preloadImages = (srcs) => {
  return Promise.all(srcs.map(preloadImage))
}

// Generate responsive image sources
export const generateResponsiveSources = (baseUrl, sizes = [480, 768, 1024, 1200]) => {
  if (!baseUrl) return []

  return sizes.map(size => ({
    src: getOptimizedImageUrl(baseUrl, { width: size }),
    width: size
  }))
}

// Image compression (client-side)
export const compressImage = (file, quality = 0.8, maxWidth = 1200) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(resolve, 'image/jpeg', quality)
    }

    img.src = URL.createObjectURL(file)
  })
}

// Progressive image loading
export const createProgressiveLoader = (placeholderUrl, fullUrl) => {
  return new Promise((resolve) => {
    const img = new Image()

    // Load placeholder first
    const placeholder = new Image()
    placeholder.onload = () => {
      resolve(placeholder)

      // Then load full image
      img.onload = () => resolve(img)
      img.src = fullUrl
    }

    placeholder.src = placeholderUrl
  })
}

// Image error handling
export const createImageErrorHandler = (fallbackSrc) => {
  return (event) => {
    const img = event.target
    if (img.src !== fallbackSrc) {
      img.src = fallbackSrc
    }
  }
}

// Performance monitoring for images
export const monitorImagePerformance = () => {
  const images = document.querySelectorAll('img')
  const performanceData = []

  images.forEach((img, index) => {
    const startTime = performance.now()

    img.addEventListener('load', () => {
      const loadTime = performance.now() - startTime
      performanceData.push({
        index,
        src: img.src,
        loadTime,
        size: img.naturalWidth * img.naturalHeight
      })
    })
  })

  return performanceData
}
