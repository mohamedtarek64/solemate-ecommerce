import { ref, computed } from 'vue'

export function useProductMedia() {
  // State
  const selectedImage = ref(0)
  const selectedVideo = ref(0)
  const isZoomed = ref(false)
  const zoomedImage = ref('')

  // Computed
  const mainProductImage = computed(() => {
    // This would be passed from the parent component
    return ''
  })

  // Methods
  const zoomImage = (imageSrc) => {
    zoomedImage.value = imageSrc
    isZoomed.value = true
  }

  const closeZoom = () => {
    isZoomed.value = false
    zoomedImage.value = ''
  }

  const selectImage = (index) => {
    selectedImage.value = index
  }

  const selectVideo = (index) => {
    selectedVideo.value = index
  }

  const nextImage = (images) => {
    if (images && images.length > 0) {
      selectedImage.value = (selectedImage.value + 1) % images.length
    }
  }

  const prevImage = (images) => {
    if (images && images.length > 0) {
      selectedImage.value = selectedImage.value === 0 ? images.length - 1 : selectedImage.value - 1
    }
  }

  return {
    // State
    selectedImage,
    selectedVideo,
    isZoomed,
    zoomedImage,

    // Computed
    mainProductImage,

    // Methods
    zoomImage,
    closeZoom,
    selectImage,
    selectVideo,
    nextImage,
    prevImage
  }
}
