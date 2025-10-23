/**
 * Request Batching Utility
 * Batches multiple API requests to reduce server load and improve performance
 */

class RequestBatcher {
  constructor(batchTimeout = 50) {
    this.batchTimeout = batchTimeout
    this.pendingRequests = new Map()
    this.batchQueue = []
  }

  // Add request to batch
  async batchRequest(key, requestFn, ...args) {
    return new Promise((resolve, reject) => {
      const requestId = `${key}_${Date.now()}_${Math.random()}`

      // Add to pending requests
      this.pendingRequests.set(requestId, {
        resolve,
        reject,
        requestFn,
        args,
        key
      })

      // Schedule batch processing
      this.scheduleBatch()
    })
  }

  // Schedule batch processing
  scheduleBatch() {
    if (this.batchTimeoutId) {
      clearTimeout(this.batchTimeoutId)
    }

    this.batchTimeoutId = setTimeout(() => {
      this.processBatch()
    }, this.batchTimeout)
  }

  // Process batched requests
  async processBatch() {
    const requests = Array.from(this.pendingRequests.values())
    this.pendingRequests.clear()

    if (requests.length === 0) return

    // Group requests by key
    const groupedRequests = this.groupRequestsByKey(requests)

    // Process each group
    for (const [key, groupRequests] of groupedRequests) {
      await this.processGroup(key, groupRequests)
    }
  }

  // Group requests by key
  groupRequestsByKey(requests) {
    const grouped = new Map()

    requests.forEach(request => {
      if (!grouped.has(request.key)) {
        grouped.set(request.key, [])
      }
      grouped.get(request.key).push(request)
    })

    return grouped
  }

  // Process a group of requests
  async processGroup(key, requests) {
    try {
      // Execute all requests in parallel
      const promises = requests.map(request =>
        request.requestFn(...request.args)
      )

      const results = await Promise.allSettled(promises)

      // Resolve or reject each request
      results.forEach((result, index) => {
        const request = requests[index]

        if (result.status === 'fulfilled') {
          request.resolve(result.value)
        } else {
          request.reject(result.reason)
        }
      })
    } catch (error) {
      // Reject all requests in the group
      requests.forEach(request => {
        request.reject(error)
      })
    }
  }
}

// Global batcher instance
export const globalBatcher = new RequestBatcher()

// Debounced function utility
export const debounce = (func, wait, immediate = false) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func(...args)
  }
}

// Throttled function utility
export const throttle = (func, limit) => {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Request deduplication
export const createRequestDeduplicator = () => {
  const pendingRequests = new Map()

  return async (key, requestFn) => {
    if (pendingRequests.has(key)) {
      return pendingRequests.get(key)
    }

    const promise = requestFn().finally(() => {
      pendingRequests.delete(key)
    })

    pendingRequests.set(key, promise)
    return promise
  }
}

// Retry utility with exponential backoff
export const retryWithBackoff = async (
  fn,
  maxRetries = 3,
  baseDelay = 1000,
  maxDelay = 10000
) => {
  let lastError

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (attempt === maxRetries) {
        throw error
      }

      const delay = Math.min(
        baseDelay * Math.pow(2, attempt),
        maxDelay
      )

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

// Request queue with priority
export class PriorityRequestQueue {
  constructor(maxConcurrent = 6) {
    this.maxConcurrent = maxConcurrent
    this.running = 0
    this.queue = []
  }

  async add(requestFn, priority = 0) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        requestFn,
        priority,
        resolve,
        reject
      })

      // Sort by priority (higher priority first)
      this.queue.sort((a, b) => b.priority - a.priority)

      this.processQueue()
    })
  }

  async processQueue() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return
    }

    const request = this.queue.shift()
    this.running++

    try {
      const result = await request.requestFn()
      request.resolve(result)
    } catch (error) {
      request.reject(error)
    } finally {
      this.running--
      this.processQueue()
    }
  }
}

// Global priority queue
export const globalPriorityQueue = new PriorityRequestQueue()
