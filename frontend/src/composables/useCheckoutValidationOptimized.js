import { ref, computed, watch } from 'vue'
import { debounce } from '@/utils'
import performanceMonitorEnhanced from '@/utils/performanceMonitorEnhanced'

export function useCheckoutValidationOptimized() {
  // Validation state
  const validationErrors = ref({})
  const isValidating = ref(false)
  const validationCache = ref(new Map())

  // Validation rules
  const validationRules = {
    firstName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s]+$/,
      message: 'First name must be 2-50 characters and contain only letters'
    },
    lastName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s]+$/,
      message: 'Last name must be 2-50 characters and contain only letters'
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    },
    phone: {
      required: true,
      pattern: /^[\+]?[1-9][\d]{0,15}$/,
      message: 'Please enter a valid phone number'
    },
    address: {
      required: true,
      minLength: 10,
      maxLength: 200,
      message: 'Address must be 10-200 characters'
    },
    city: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s]+$/,
      message: 'City must be 2-50 characters and contain only letters'
    },
    zipCode: {
      required: true,
      pattern: /^\d{5}(-\d{4})?$/,
      message: 'Please enter a valid ZIP code'
    },
    country: {
      required: true,
      message: 'Please select a country'
    }
  }

  // Optimized field validation
  const validateField = async (fieldName, value, rules = validationRules[fieldName]) => {
    if (!rules) return { isValid: true, error: null }

    const cacheKey = `${fieldName}_${value}`
    
    // Check cache first
    if (validationCache.value.has(cacheKey)) {
      return validationCache.value.get(cacheKey)
    }

    const measurement = performanceMonitorEnhanced.startMeasure(`validate-${fieldName}`, 'validation')
    
    try {
      const errors = []

      // Required validation
      if (rules.required && (!value || value.trim() === '')) {
        errors.push(`${fieldName} is required`)
      }

      // Length validation
      if (value && rules.minLength && value.length < rules.minLength) {
        errors.push(`${fieldName} must be at least ${rules.minLength} characters`)
      }

      if (value && rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${fieldName} must be no more than ${rules.maxLength} characters`)
      }

      // Pattern validation
      if (value && rules.pattern && !rules.pattern.test(value)) {
        errors.push(rules.message || `${fieldName} format is invalid`)
      }

      const result = {
        isValid: errors.length === 0,
        error: errors.length > 0 ? errors[0] : null
      }

      // Cache the result
      validationCache.value.set(cacheKey, result)
      
      measurement.end()
      return result
    } catch (error) {
      console.error(`❌ Error validating ${fieldName}:`, error)
      return { isValid: false, error: 'Validation error occurred' }
    }
  }

  // Debounced validation for real-time feedback
  const validateFieldDebounced = debounce(async (fieldName, value) => {
    isValidating.value = true
    
    try {
      const result = await validateField(fieldName, value)
      
      if (result.isValid) {
        delete validationErrors.value[fieldName]
      } else {
        validationErrors.value[fieldName] = result.error
      }
    } catch (error) {
      console.error(`❌ Error in debounced validation for ${fieldName}:`, error)
    } finally {
      isValidating.value = false
    }
  }, 300)

  // Validate entire form
  const validateForm = async (formData) => {
    const measurement = performanceMonitorEnhanced.startMeasure('form-validation', 'validation')
    isValidating.value = true
    
    try {
      const errors = {}
      const validationPromises = []

      // Validate all fields in parallel
      for (const [fieldName, value] of Object.entries(formData)) {
        if (validationRules[fieldName]) {
          validationPromises.push(
            validateField(fieldName, value).then(result => ({
              fieldName,
              result
            }))
          )
        }
      }

      const results = await Promise.all(validationPromises)
      
      // Process results
      results.forEach(({ fieldName, result }) => {
        if (!result.isValid) {
          errors[fieldName] = result.error
        }
      })

      validationErrors.value = errors
      
      measurement.end()
      return {
        isValid: Object.keys(errors).length === 0,
        errors
      }
    } catch (error) {
      console.error('❌ Error validating form:', error)
      return { isValid: false, errors: { general: 'Form validation failed' } }
    } finally {
      isValidating.value = false
    }
  }

  // Validate shipping data
  const validateShippingData = async (shippingData) => {
    return await validateForm({
      firstName: shippingData.firstName,
      lastName: shippingData.lastName,
      email: shippingData.email,
      phone: shippingData.phone,
      address: shippingData.address,
      city: shippingData.city,
      zipCode: shippingData.zipCode,
      country: shippingData.country
    })
  }

  // Validate payment data
  const validatePaymentData = async (paymentData) => {
    const errors = {}

    // Validate customer info
    if (!paymentData.customerName || paymentData.customerName.trim() === '') {
      errors.customerName = 'Customer name is required'
    }

    if (!paymentData.customerEmail || paymentData.customerEmail.trim() === '') {
      errors.customerEmail = 'Customer email is required'
    } else if (!validationRules.email.pattern.test(paymentData.customerEmail)) {
      errors.customerEmail = validationRules.email.message
    }

    // Validate payment method
    if (!paymentData.paymentMethod) {
      errors.paymentMethod = 'Payment method is required'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  // Clear validation cache
  const clearValidationCache = () => {
    validationCache.value.clear()
    }

  // Clear specific field validation
  const clearFieldValidation = (fieldName) => {
    delete validationErrors.value[fieldName]
    
    // Remove from cache
    for (const [key] of validationCache.value) {
      if (key.startsWith(`${fieldName}_`)) {
        validationCache.value.delete(key)
      }
    }
  }

  // Computed properties
  const hasErrors = computed(() => Object.keys(validationErrors.value).length > 0)
  const errorCount = computed(() => Object.keys(validationErrors.value).length)
  const isFormValid = computed(() => !hasErrors.value && !isValidating.value)

  // Watch for validation errors changes
  watch(validationErrors, (newErrors) => {
    }, { deep: true })

  return {
    // State
    validationErrors,
    isValidating,
    hasErrors,
    errorCount,
    isFormValid,
    
    // Methods
    validateField,
    validateFieldDebounced,
    validateForm,
    validateShippingData,
    validatePaymentData,
    clearValidationCache,
    clearFieldValidation,
    
    // Rules
    validationRules
  }
}
