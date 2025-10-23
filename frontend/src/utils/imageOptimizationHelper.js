/**
 * Image Optimization Helper
 * Quick utility to optimize images across the app
 */

/**
 * Optimize all images on page load
 */
export function optimizePageImages() {
  if (typeof window === 'undefined') return

  // Add loading="lazy" to images below fold
  requestAnimationFrame(() => {
    const images = document.querySelectorAll('img:not([loading])')
    images.forEach((img, index) => {
      // First 3 images load eagerly, rest lazy
      if (index >= 3) {
        img.loading = 'lazy'
      }
    })
  })
}

/**
 * Setup intersection observer for lazy sections
 */
export function setupLazySections() {
  if (typeof IntersectionObserver === 'undefined') return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const section = entry.target
          section.classList.add('visible', 'fade-in')
          observer.unobserve(section)
        }
      })
    },
    { rootMargin: '50px', threshold: 0.1 }
  )

  requestAnimationFrame(() => {
    const sections = document.querySelectorAll('[data-lazy-section]')
    sections.forEach(section => observer.observe(section))
  })
}

/**
 * Preload critical images
 */
export function preloadCriticalImages(imageUrls) {
  if (!Array.isArray(imageUrls)) return

  imageUrls.forEach(url => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = url
    document.head.appendChild(link)
  })
}

/**
 * Preload single image
 */
export function preloadImage(url) {
  if (!url) return Promise.resolve()
  
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to preload image: ${url}`))
    img.src = url
  })
}

/**
 * Image optimization helper object
 */
export const imageOptimizationHelper = {
  preloadImage,
  preloadCriticalImages,
  optimizePageImages,
  setupLazySections,
  convertToOptimizedImage,
  optimizeImagesInContainer,
  getOptimizedImageUrl
}

/**
 * Convert regular img to optimized with loading
 */
export function convertToOptimizedImage(imgElement) {
  if (!imgElement || imgElement.hasAttribute('data-optimized')) return

  const src = imgElement.src || imgElement.dataset.src
  
  // Add lazy loading
  imgElement.loading = 'lazy'
  
  // Add data attribute to mark as optimized
  imgElement.setAttribute('data-optimized', 'true')
  
  // Add fade-in class when loaded
  imgElement.addEventListener('load', () => {
    imgElement.classList.add('img-loaded')
  }, { once: true })
}

/**
 * Batch optimize all images in container
 */
export function optimizeImagesInContainer(containerSelector) {
  const container = document.querySelector(containerSelector)
  if (!container) return

  const images = container.querySelectorAll('img')
  images.forEach(convertToOptimizedImage)
}

/**
 * Get optimized image URL (add format and quality params if supported)
 */
export function getOptimizedImageUrl(url, options = {}) {
  const {
    width = null,
    height = null,
    quality = 85,
    format = 'webp'
  } = options

  // If URL already has params or is data URL, return as is
  if (!url || url.startsWith('data:') || url.includes('?')) {
    return url
  }

  // For external CDN images (like Adidas), use their optimization params
  if (url.includes('assets.adidas.com')) {
    let optimizedUrl = url
    if (width) {
      optimizedUrl = optimizedUrl.replace(/w_\d+/, `w_${width}`)
    }
    optimizedUrl += optimizedUrl.includes('?') ? '&' : '?'
    optimizedUrl += `f_auto,q_${quality}`
    return optimizedUrl
  }

  return url
}

/**
 * Create responsive image srcset
 */
export function createResponsiveSrcSet(baseUrl, sizes = [320, 640, 960, 1280, 1920]) {
  return sizes
    .map(size => `${getOptimizedImageUrl(baseUrl, { width: size })} ${size}w`)
    .join(', ')
}

/**
 * Add CSS for image optimization effects
 */
export function addImageOptimizationStyles() {
  if (document.getElementById('image-optimization-styles')) return

  const style = document.createElement('style')
  style.id = 'image-optimization-styles'
  style.textContent = `
    /* Image Loading States */
    img[loading="lazy"] {
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
    }

    img[loading="lazy"].img-loaded,
    img[loading="lazy"][src] {
      opacity: 1;
    }

    /* Fade in animation for lazy sections */
    [data-lazy-section] {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.4s ease-out, transform 0.4s ease-out;
    }

    [data-lazy-section].visible {
      opacity: 1;
      transform: translateY(0);
    }

    /* Loading skeleton for images */
    .img-skeleton {
      background: linear-gradient(
        90deg,
        #f0f0f0 25%,
        #e0e0e0 50%,
        #f0f0f0 75%
      );
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s infinite;
    }

    @keyframes skeleton-loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `
  document.head.appendChild(style)
}

/**
 * Initialize all image optimizations
 */
export function initImageOptimizations() {
  optimizePageImages()
  setupLazySections()
  addImageOptimizationStyles()
}

