// Test Carousel Functionality
// Test data
const testProduct = {
  id: 1,
  name: 'Converse Weapon Mid Top',
  images: [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg', 
    'https://example.com/image3.jpg',
    'https://example.com/image4.jpg'
  ]
}

// Test functions
function testGetProductImages(product) {
  const images = product.images || [product.image].filter(Boolean)
  return images
}

function testNextImage(product, currentIndex) {
  const images = testGetProductImages(product)
  if (!images.length) return 0
  const newIndex = (currentIndex + 1) % images.length
  return newIndex
}

function testPrevImage(product, currentIndex) {
  const images = testGetProductImages(product)
  if (!images.length) return 0
  const newIndex = (currentIndex - 1 + images.length) % images.length
  return newIndex
}

// Run tests
let currentIndex = 0
// Test next
currentIndex = testNextImage(testProduct, currentIndex)
currentIndex = testNextImage(testProduct, currentIndex)
currentIndex = testNextImage(testProduct, currentIndex)

// Test prev
currentIndex = testPrevImage(testProduct, currentIndex)
currentIndex = testPrevImage(testProduct, currentIndex)

