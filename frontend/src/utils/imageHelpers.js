/**
 * Image utility functions for visual search
 */

/**
 * Validate image file
 */
export function validateImageFile(file) {
  const errors = []
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']
  if (!allowedTypes.includes(file.type)) {
    errors.push('Invalid file type. Please upload JPEG, PNG, GIF, WebP, or BMP images.')
  }
  
  // Check file size (10MB max)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    errors.push('File size too large. Maximum size is 10MB.')
  }
  
  // Check file name
  if (!file.name || file.name.trim() === '') {
    errors.push('Invalid file name.')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Create image preview from file
 */
export function createImagePreview(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      resolve(e.target.result)
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read image file'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * Resize image to specified dimensions
 */
export function resizeImage(file, maxWidth = 800, maxHeight = 600, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }
      
      // Set canvas dimensions
      canvas.width = width
      canvas.height = height
      
      // Draw and resize image
      ctx.drawImage(img, 0, 0, width, height)
      
      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          })
          resolve(resizedFile)
        } else {
          reject(new Error('Failed to resize image'))
        }
      }, file.type, quality)
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Compress image file
 */
export function compressImage(file, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      
      ctx.drawImage(img, 0, 0)
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          })
          resolve(compressedFile)
        } else {
          reject(new Error('Failed to compress image'))
        }
      }, file.type, quality)
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Get image dimensions
 */
export function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        aspectRatio: img.width / img.height
      })
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Generate image hash for duplicate detection
 */
export function generateImageHash(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const arrayBuffer = e.target.result
      const hashBuffer = crypto.subtle.digest('SHA-256', arrayBuffer)
      
      hashBuffer.then((hash) => {
        const hashArray = Array.from(new Uint8Array(hash))
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        resolve(hashHex)
      }).catch(reject)
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Extract dominant colors from image
 */
export function extractDominantColors(file, colorCount = 5) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Resize image for faster processing
      const maxSize = 200
      let { width, height } = img
      
      if (width > height) {
        height = (height * maxSize) / width
        width = maxSize
      } else {
        width = (width * maxSize) / height
        height = maxSize
      }
      
      canvas.width = width
      canvas.height = height
      
      ctx.drawImage(img, 0, 0, width, height)
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, width, height)
      const data = imageData.data
      
      // Count colors
      const colorCounts = {}
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const hex = rgbToHex(r, g, b)
        
        colorCounts[hex] = (colorCounts[hex] || 0) + 1
      }
      
      // Sort by frequency and get top colors
      const sortedColors = Object.entries(colorCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, colorCount)
        .map(([hex, count]) => ({
          hex,
          count,
          percentage: (count / (width * height)) * 100
        }))
      
      resolve(sortedColors)
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

/**
 * Convert hex to RGB
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r, g, b) {
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  
  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

/**
 * Calculate color similarity
 */
export function calculateColorSimilarity(color1, color2) {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  
  if (!rgb1 || !rgb2) return 0
  
  // Calculate Euclidean distance in RGB space
  const distance = Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  )
  
  // Convert distance to similarity score (0-1)
  const maxDistance = Math.sqrt(3 * Math.pow(255, 2))
  return Math.max(0, 1 - (distance / maxDistance))
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get file extension
 */
export function getFileExtension(filename) {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

/**
 * Check if file is image
 */
export function isImageFile(file) {
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']
  return imageTypes.includes(file.type)
}

/**
 * Create thumbnail from image
 */
export function createThumbnail(file, size = 150) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Calculate thumbnail dimensions
      let { width, height } = img
      
      if (width > height) {
        height = (height * size) / width
        width = size
      } else {
        width = (width * size) / height
        height = size
      }
      
      canvas.width = width
      canvas.height = height
      
      // Draw thumbnail
      ctx.drawImage(img, 0, 0, width, height)
      
      // Convert to data URL
      const thumbnail = canvas.toDataURL('image/jpeg', 0.8)
      resolve(thumbnail)
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Rotate image
 */
export function rotateImage(file, degrees = 90) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Set canvas dimensions based on rotation
      if (degrees === 90 || degrees === 270) {
        canvas.width = img.height
        canvas.height = img.width
      } else {
        canvas.width = img.width
        canvas.height = img.height
      }
      
      // Rotate context
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((degrees * Math.PI) / 180)
      ctx.drawImage(img, -img.width / 2, -img.height / 2)
      
      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const rotatedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          })
          resolve(rotatedFile)
        } else {
          reject(new Error('Failed to rotate image'))
        }
      }, file.type, 0.8)
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Flip image horizontally
 */
export function flipImageHorizontally(file) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      
      // Flip horizontally
      ctx.scale(-1, 1)
      ctx.drawImage(img, -img.width, 0)
      
      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const flippedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          })
          resolve(flippedFile)
        } else {
          reject(new Error('Failed to flip image'))
        }
      }, file.type, 0.8)
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Apply image filters
 */
export function applyImageFilter(file, filterType) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      
      ctx.drawImage(img, 0, 0)
      
      // Apply filter
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      
      switch (filterType) {
        case 'grayscale':
          for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
            data[i] = gray
            data[i + 1] = gray
            data[i + 2] = gray
          }
          break
          
        case 'sepia':
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            
            data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189))
            data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168))
            data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131))
          }
          break
          
        case 'invert':
          for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i]
            data[i + 1] = 255 - data[i + 1]
            data[i + 2] = 255 - data[i + 2]
          }
          break
      }
      
      ctx.putImageData(imageData, 0, 0)
      
      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const filteredFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          })
          resolve(filteredFile)
        } else {
          reject(new Error('Failed to apply filter'))
        }
      }, file.type, 0.8)
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.src = URL.createObjectURL(file)
  })
}
