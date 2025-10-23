/**
 * Request Batching System
 * Batches multiple API requests into a single request to reduce network overhead
 */

class RequestBatcher {
  constructor() {
    this.batchQueue = new Map()
    this.batchDelay = 50 // milliseconds to wait before sending batch
    this.maxBatchSize = 10 // maximum requests per batch
  }

  /**
   * Add request to batch queue
   */
  async batchRequest(endpoint, params = {}) {
    const requestKey = `${endpoint}:${JSON.stringify(params)}`
    
    // Check if request is already in queue
    if (this.batchQueue.has(requestKey)) {
      return this.batchQueue.get(requestKey).promise
    }

    // Create promise for this request
    let resolver, rejector
    const promise = new Promise((resolve, reject) => {
      resolver = resolve
      rejector = reject
    })

    // Add to queue
    this.batchQueue.set(requestKey, {
      endpoint,
      params,
      promise,
      resolver,
      rejector,
      timestamp: Date.now()
    })

    // Schedule batch execution
    this.scheduleBatch()

    return promise
  }

  /**
   * Schedule batch execution
   */
  scheduleBatch() {
    if (this.batchTimeout) {
      return // Already scheduled
    }

    this.batchTimeout = setTimeout(() => {
      this.executeBatch()
    }, this.batchDelay)
  }

  /**
   * Execute batch of requests
   */
  async executeBatch() {
    clearTimeout(this.batchTimeout)
    this.batchTimeout = null

    if (this.batchQueue.size === 0) {
      return
    }

    // Group requests by endpoint
    const groups = new Map()
    
    for (const [key, request] of this.batchQueue.entries()) {
      if (!groups.has(request.endpoint)) {
        groups.set(request.endpoint, [])
      }
      groups.get(request.endpoint).push({ key, ...request })
    }

    // Execute each group
    for (const [endpoint, requests] of groups.entries()) {
      try {
        // For now, execute requests individually
        // In future, implement true batching at API level
        await Promise.all(
          requests.map(async (req) => {
            try {
              const result = await this.executeRequest(req.endpoint, req.params)
              req.resolver(result)
              this.batchQueue.delete(req.key)
            } catch (error) {
              req.rejector(error)
              this.batchQueue.delete(req.key)
            }
          })
        )
      } catch (error) {
        console.error('Batch execution error:', error)
      }
    }
  }

  /**
   * Execute single request
   */
  async executeRequest(endpoint, params) {
    // Import dynamically to avoid circular dependency
    const { default: apiClient } = await import('./apiClient')
    
    const response = await apiClient.get(endpoint, { params })
    return response.data
  }

  /**
   * Clear batch queue
   */
  clear() {
    this.batchQueue.clear()
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
      this.batchTimeout = null
    }
  }

  /**
   * Get queue stats
   */
  getStats() {
    return {
      queueSize: this.batchQueue.size,
      pending: this.batchTimeout !== null
    }
  }
}

// Create singleton instance
const batcherInstance = new RequestBatcher()

export default batcherInstance

