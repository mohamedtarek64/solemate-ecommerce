import { ref, reactive, computed } from 'vue'

export function useForm(initialData = {}) {
  const form = reactive({ ...initialData })
  const errors = ref({})
  const isSubmitting = ref(false)
  
  // Set form data
  const setForm = (data) => {
    Object.assign(form, data)
  }
  
  // Set field value
  const setField = (field, value) => {
    form[field] = value
    // Clear error when user starts typing
    if (errors.value[field]) {
      delete errors.value[field]
    }
  }
  
  // Set error for specific field
  const setError = (field, message) => {
    errors.value[field] = message
  }
  
  // Set multiple errors
  const setErrors = (errorObject) => {
    errors.value = { ...errorObject }
  }
  
  // Clear specific error
  const clearError = (field) => {
    if (errors.value[field]) {
      delete errors.value[field]
    }
  }
  
  // Clear all errors
  const clearErrors = () => {
    errors.value = {}
  }
  
  // Check if form has errors
  const hasErrors = computed(() => Object.keys(errors.value).length > 0)
  
  // Get error for specific field
  const getError = (field) => errors.value[field] || ''
  
  // Check if field has error
  const hasError = (field) => !!errors.value[field]
  
  // Reset form to initial data
  const reset = () => {
    Object.assign(form, initialData)
    clearErrors()
    isSubmitting.value = false
  }
  
  // Validate form with custom validator
  const validate = (validator) => {
    const validationErrors = validator(form)
    setErrors(validationErrors)
    return Object.keys(validationErrors).length === 0
  }
  
  // Submit form with custom handler
  const submit = async (handler) => {
    try {
      isSubmitting.value = true
      clearErrors()
      
      const result = await handler(form)
      return result
    } catch (error) {
      console.error('Form submission error:', error)
      throw error
    } finally {
      isSubmitting.value = false
    }
  }
  
  return {
    form,
    errors: errors.value,
    isSubmitting,
    setForm,
    setField,
    setError,
    setErrors,
    clearError,
    clearErrors,
    hasErrors,
    getError,
    hasError,
    reset,
    validate,
    submit
  }
}
