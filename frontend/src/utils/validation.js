/**
 * Validation utilities for forms and data
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validatePassword = (password) => {
  const errors = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone number
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Validate name format
 * @param {string} name - Name to validate
 * @returns {Object} Validation result
 */
export const validateName = (name) => {
  const errors = []
  
  if (!name || name.trim().length === 0) {
    errors.push('Name is required')
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long')
  } else if (name.trim().length > 50) {
    errors.push('Name must be less than 50 characters')
  } else if (!/^[a-zA-Z\s\u0600-\u06FF]+$/.test(name.trim())) {
    errors.push('Name can only contain letters and spaces')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate form data
 * @param {Object} formData - Form data to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation result
 */
export const validateForm = (formData, rules) => {
  const errors = {}
  let isValid = true

  Object.keys(rules).forEach(field => {
    const value = formData[field]
    const fieldRules = rules[field]
    const fieldErrors = []

    // Required validation
    if (fieldRules.required && (!value || value.toString().trim() === '')) {
      fieldErrors.push(`${fieldRules.label || field} is required`)
    }

    // Email validation
    if (value && fieldRules.email && !isValidEmail(value)) {
      fieldErrors.push(`${fieldRules.label || field} must be a valid email`)
    }

    // Password validation
    if (value && fieldRules.password) {
      const passwordValidation = validatePassword(value)
      if (!passwordValidation.isValid) {
        fieldErrors.push(...passwordValidation.errors)
      }
    }

    // Phone validation
    if (value && fieldRules.phone && !isValidPhone(value)) {
      fieldErrors.push(`${fieldRules.label || field} must be a valid phone number`)
    }

    // Name validation
    if (value && fieldRules.name) {
      const nameValidation = validateName(value)
      if (!nameValidation.isValid) {
        fieldErrors.push(...nameValidation.errors)
      }
    }

    // Min length validation
    if (value && fieldRules.minLength && value.length < fieldRules.minLength) {
      fieldErrors.push(`${fieldRules.label || field} must be at least ${fieldRules.minLength} characters`)
    }

    // Max length validation
    if (value && fieldRules.maxLength && value.length > fieldRules.maxLength) {
      fieldErrors.push(`${fieldRules.label || field} must be less than ${fieldRules.maxLength} characters`)
    }

    // Custom validation
    if (value && fieldRules.custom && typeof fieldRules.custom === 'function') {
      const customResult = fieldRules.custom(value, formData)
      if (customResult !== true) {
        fieldErrors.push(customResult || `${fieldRules.label || field} is invalid`)
      }
    }

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors
      isValid = false
    }
  })

  return {
    isValid,
    errors
  }
}

/**
 * Common validation rules for forms
 */
export const validationRules = {
  login: {
    email: {
      required: true,
      email: true,
      label: 'Email'
    },
    password: {
      required: true,
      label: 'Password'
    }
  },
  
  register: {
    name: {
      required: true,
      name: true,
      label: 'Full Name'
    },
    email: {
      required: true,
      email: true,
      label: 'Email'
    },
    password: {
      required: true,
      password: true,
      label: 'Password'
    },
    password_confirmation: {
      required: true,
      label: 'Confirm Password',
      custom: (value, formData) => {
        return value === formData.password || 'Passwords do not match'
      }
    },
    terms: {
      required: true,
      label: 'Terms and Conditions',
      custom: (value) => {
        return value === true || 'You must accept the terms and conditions'
      }
    }
  },
  
  forgotPassword: {
    email: {
      required: true,
      email: true,
      label: 'Email'
    }
  },
  
  resetPassword: {
    password: {
      required: true,
      password: true,
      label: 'New Password'
    },
    password_confirmation: {
      required: true,
      label: 'Confirm Password',
      custom: (value, formData) => {
        return value === formData.password || 'Passwords do not match'
      }
    }
  },
  
  twoFactor: {
    code: {
      required: true,
      minLength: 6,
      maxLength: 6,
      label: 'Verification Code',
      custom: (value) => {
        return /^\d{6}$/.test(value) || 'Code must be 6 digits'
      }
    }
  }
}

/**
 * Sanitize user input
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
}

/**
 * Format phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  
  return phone
}
