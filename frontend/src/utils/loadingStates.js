// Loading states management for better UX

import { ref, computed, readonly } from 'vue'

/**
 * Global loading states manager
 */
class LoadingStatesManager {
  constructor() {
    this.states = new Map()
    this.listeners = new Set()
  }

  setLoading(key, isLoading, message = '') {
    const currentState = this.states.get(key)
    const newState = {
      loading: isLoading,
      message,
      timestamp: Date.now()
    }

    this.states.set(key, newState)

    // Notify listeners if state changed
    if (!currentState || currentState.loading !== isLoading) {
      this.notifyListeners(key, newState)
    }
  }

  isLoading(key) {
    return this.states.get(key)?.loading || false
  }

  getMessage(key) {
    return this.states.get(key)?.message || ''
  }

  getState(key) {
    return this.states.get(key) || { loading: false, message: '', timestamp: 0 }
  }

  isAnyLoading() {
    return Array.from(this.states.values()).some(state => state.loading)
  }

  getLoadingStates() {
    return Array.from(this.states.entries()).map(([key, state]) => ({
      key,
      ...state
    }))
  }

  addListener(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  notifyListeners(key, state) {
    this.listeners.forEach(callback => callback(key, state))
  }

  clear() {
    this.states.clear()
    this.notifyListeners('*', { loading: false, message: '', timestamp: Date.now() })
  }

  remove(key) {
    this.states.delete(key)
    this.notifyListeners(key, { loading: false, message: '', timestamp: Date.now() })
  }
}

// Global instance
export const loadingStatesManager = new LoadingStatesManager()

/**
 * Composable for managing loading states
 */
export function useLoadingState(key, initialMessage = '') {
  const loading = computed(() => loadingStatesManager.isLoading(key))
  const message = computed(() => loadingStatesManager.getMessage(key))
  const state = computed(() => loadingStatesManager.getState(key))

  const setLoading = (isLoading, message = '') => {
    loadingStatesManager.setLoading(key, isLoading, message)
  }

  const startLoading = (message = '') => {
    setLoading(true, message)
  }

  const stopLoading = () => {
    setLoading(false)
  }

  return {
    loading: readonly(loading),
    message: readonly(message),
    state: readonly(state),
    setLoading,
    startLoading,
    stopLoading
  }
}

/**
 * Composable for managing multiple loading states
 */
export function useMultipleLoadingStates(keys) {
  const states = ref({})

  // Initialize states
  keys.forEach(key => {
    states.value[key] = {
      loading: false,
      message: '',
      timestamp: 0
    }
  })

  const updateState = (key, isLoading, message = '') => {
    if (states.value[key]) {
      states.value[key] = {
        loading: isLoading,
        message,
        timestamp: Date.now()
      }
    }
  }

  const isLoading = (key) => {
    return states.value[key]?.loading || false
  }

  const getMessage = (key) => {
    return states.value[key]?.message || ''
  }

  const isAnyLoading = computed(() => {
    return Object.values(states.value).some(state => state.loading)
  })

  const loadingCount = computed(() => {
    return Object.values(states.value).filter(state => state.loading).length
  })

  return {
    states: readonly(states),
    isLoading,
    getMessage,
    isAnyLoading,
    loadingCount,
    updateState
  }
}

/**
 * Loading state for API calls
 */
export function useApiLoadingState(apiKey, defaultMessage = 'Loading...') {
  const { loading, message, setLoading, startLoading, stopLoading } = useLoadingState(apiKey, defaultMessage)

  const withLoading = async (apiCall, customMessage = '') => {
    try {
      startLoading(customMessage || defaultMessage)
      const result = await apiCall()
      return result
    } finally {
      stopLoading()
    }
  }

  return {
    loading: readonly(loading),
    message: readonly(message),
    withLoading,
    startLoading,
    stopLoading
  }
}

/**
 * Optimized loading component props
 */
export function useOptimizedLoadingProps() {
  const globalLoading = computed(() => loadingStatesManager.isAnyLoading())
  const loadingStates = computed(() => loadingStatesManager.getLoadingStates())

  const getPrimaryLoading = computed(() => {
    const states = loadingStates.value
    if (states.length === 0) return null

    // Return the most recent loading state
    return states
      .filter(state => state.loading)
      .sort((a, b) => b.timestamp - a.timestamp)[0]
  })

  const getLoadingMessage = computed(() => {
    const primary = getPrimaryLoading.value
    return primary?.message || 'Loading...'
  })

  return {
    globalLoading: readonly(globalLoading),
    loadingStates: readonly(loadingStates),
    primaryLoading: readonly(getPrimaryLoading),
    loadingMessage: readonly(getLoadingMessage)
  }
}

/**
 * Loading state for forms
 */
export function useFormLoadingState(formKey) {
  const { loading, message, setLoading } = useLoadingState(formKey)

  const submitWithLoading = async (submitFn, successMessage = '') => {
    try {
      setLoading(true, 'Submitting...')
      const result = await submitFn()

      if (successMessage) {
        setLoading(false, successMessage)
        // Clear success message after 2 seconds
        setTimeout(() => setLoading(false, ''), 2000)
      } else {
        setLoading(false)
      }

      return result
    } catch (error) {
      setLoading(false, error.message || 'Submission failed')
      throw error
    }
  }

  return {
    loading: readonly(loading),
    message: readonly(message),
    submitWithLoading,
    setLoading
  }
}

/**
 * Loading state for navigation
 */
export function useNavigationLoadingState() {
  const { loading, message, setLoading } = useLoadingState('navigation')

  const navigateWithLoading = async (navigateFn, targetPage = '') => {
    try {
      setLoading(true, `Navigating to ${targetPage}...`)
      await navigateFn()
    } finally {
      setLoading(false)
    }
  }

  return {
    loading: readonly(loading),
    message: readonly(message),
    navigateWithLoading,
    setLoading
  }
}

/**
 * Loading state for file operations
 */
export function useFileLoadingState(operation = 'file') {
  const { loading, message, setLoading } = useLoadingState(operation)

  const processWithLoading = async (processFn, fileName = '') => {
    try {
      setLoading(true, `Processing ${fileName}...`)
      const result = await processFn()
      setLoading(false, `${fileName} processed successfully`)

      // Clear success message after 3 seconds
      setTimeout(() => setLoading(false, ''), 3000)

      return result
    } catch (error) {
      setLoading(false, `Failed to process ${fileName}`)
      throw error
    }
  }

  return {
    loading: readonly(loading),
    message: readonly(message),
    processWithLoading,
    setLoading
  }
}

/**
 * Loading state for search operations
 */
export function useSearchLoadingState() {
  const { loading, message, setLoading } = useLoadingState('search')

  const searchWithLoading = async (searchFn, query = '') => {
    try {
      setLoading(true, `Searching for "${query}"...`)
      const result = await searchFn()
      setLoading(false, `Found ${result.length || 0} results`)

      // Clear message after 2 seconds
      setTimeout(() => setLoading(false, ''), 2000)

      return result
    } catch (error) {
      setLoading(false, 'Search failed')
      throw error
    }
  }

  return {
    loading: readonly(loading),
    message: readonly(message),
    searchWithLoading,
    setLoading
  }
}

/**
 * Loading state for data synchronization
 */
export function useSyncLoadingState() {
  const { loading, message, setLoading } = useLoadingState('sync')

  const syncWithLoading = async (syncFn, operation = 'Synchronizing') => {
    try {
      setLoading(true, `${operation}...`)
      const result = await syncFn()
      setLoading(false, 'Synchronization complete')

      // Clear message after 3 seconds
      setTimeout(() => setLoading(false, ''), 3000)

      return result
    } catch (error) {
      setLoading(false, 'Synchronization failed')
      throw error
    }
  }

  return {
    loading: readonly(loading),
    message: readonly(message),
    syncWithLoading,
    setLoading
  }
}
