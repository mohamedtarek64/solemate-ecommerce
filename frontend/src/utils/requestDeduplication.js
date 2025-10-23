/**
 * Request Deduplication Utility
 * Prevents duplicate simultaneous requests to the same endpoint
 */

class RequestDeduplicator {
  constructor() {
    this.pendingRequests = new Map()
  }

  /**
   * Generate request key
   */
  generateKey(url, options = {}) {
    const method = options.method || 'GET'
    const body = options.body ? JSON.stringify(options.body) : ''
    return `${method}:${url}:${body}`
  }

  /**
   * Execute deduplicated request
   */
  async request(url, options = {}, fetcher = null) {
    const key = this.generateKey(url, options)

    // If request is already pending, return the same promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)
    }

    // Create new request promise
    const requestPromise = (async () => {
      try {
        const result = fetcher
          ? await fetcher()
          : await fetch(url, options).then(res => res.json())

        return result
      } finally {
        // Remove from pending requests when done
        this.pendingRequests.delete(key)
      }
    })()

    // Store promise
    this.pendingRequests.set(key, requestPromise)

    return requestPromise
  }

  /**
   * Cancel pending request
   */
  cancel(url, options = {}) {
    const key = this.generateKey(url, options)
    this.pendingRequests.delete(key)
  }

  /**
   * Clear all pending requests
   */
  clear() {
    this.pendingRequests.clear()
  }

  /**
   * Get pending requests count
   */
  getPendingCount() {
    return this.pendingRequests.size
  }

  /**
   * Check if request is pending
   */
  isPending(url, options = {}) {
    const key = this.generateKey(url, options)
    return this.pendingRequests.has(key)
  }
}

// Export singleton instance
export const requestDeduplicator = new RequestDeduplicator()

// Export class for testing
export { RequestDeduplicator }

/**
 * Deduplicated fetch wrapper
 */
export async function deduplicatedFetch(url, options = {}) {
  return requestDeduplicator.request(url, options)
}

export default requestDeduplicator
