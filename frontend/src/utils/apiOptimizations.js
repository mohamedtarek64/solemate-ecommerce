// API optimization utilities

/**
 * Request deduplication - prevent duplicate API calls
 */
class RequestDeduplicator {
  constructor() {
    this.pendingRequests = new Map()
  }

  async deduplicate(key, requestFn) {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key)
    })

    this.pendingRequests.set(key, promise)
    return promise
  }

  clear() {
    this.pendingRequests.clear()
  }
}

/**
 * Retry mechanism for failed requests
 */
class RetryManager {
  constructor(maxRetries = 3, baseDelay = 1000) {
    this.maxRetries = maxRetries
    this.baseDelay = baseDelay
  }

  async retry(requestFn, retries = this.maxRetries) {
    try {
      return await requestFn()
    } catch (error) {
      if (retries > 0 && this.shouldRetry(error)) {
        const delay = this.calculateDelay(this.maxRetries - retries)
        await this.sleep(delay)
        return this.retry(requestFn, retries - 1)
      }
      throw error
    }
  }

  shouldRetry(error) {
    // Retry on network errors or 5xx status codes
    return !error.response || (error.response.status >= 500 && error.response.status < 600)
  }

  calculateDelay(attempt) {
    // Exponential backoff with jitter
    const exponentialDelay = this.baseDelay * Math.pow(2, attempt)
    const jitter = Math.random() * 1000
    return Math.min(exponentialDelay + jitter, 30000) // Max 30 seconds
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * Connection pooling for API requests
 */
class ConnectionPool {
  constructor(maxConnections = 6) {
    this.maxConnections = maxConnections
    this.activeConnections = 0
    this.queue = []
  }

  async acquire() {
    return new Promise((resolve) => {
      if (this.activeConnections < this.maxConnections) {
        this.activeConnections++
        resolve()
      } else {
        this.queue.push(resolve)
      }
    })
  }

  release() {
    this.activeConnections--
    if (this.queue.length > 0) {
      const next = this.queue.shift()
      this.activeConnections++
      next()
    }
  }

  async execute(requestFn) {
    await this.acquire()
    try {
      return await requestFn()
    } finally {
      this.release()
    }
  }
}

/**
 * Request batching for multiple API calls
 */
class RequestBatcher {
  constructor(batchSize = 10, batchDelay = 100) {
    this.batchSize = batchSize
    this.batchDelay = batchDelay
    this.batch = []
    this.timer = null
  }

  add(requestFn) {
    return new Promise((resolve, reject) => {
      this.batch.push({ requestFn, resolve, reject })

      if (this.batch.length >= this.batchSize) {
        this.processBatch()
      } else if (!this.timer) {
        this.timer = setTimeout(() => this.processBatch(), this.batchDelay)
      }
    })
  }

  async processBatch() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    const currentBatch = this.batch.splice(0, this.batchSize)

    if (currentBatch.length === 0) return

    // Execute requests in parallel
    const promises = currentBatch.map(({ requestFn }) => requestFn())

    try {
      const results = await Promise.allSettled(promises)

      results.forEach((result, index) => {
        const { resolve, reject } = currentBatch[index]
        if (result.status === 'fulfilled') {
          resolve(result.value)
        } else {
          reject(result.reason)
        }
      })
    } catch (error) {
      // Handle unexpected errors
      currentBatch.forEach(({ reject }) => reject(error))
    }
  }
}

/**
 * Prefetch manager for predictive loading
 */
class PrefetchManager {
  constructor() {
    this.prefetchQueue = new Set()
    this.prefetched = new Set()
  }

  prefetch(url, priority = 'low') {
    if (this.prefetched.has(url) || this.prefetchQueue.has(url)) {
      return
    }

    this.prefetchQueue.add(url)

    // Use requestIdleCallback for low priority prefetching
    if (priority === 'low' && 'requestIdleCallback' in window) {
      requestIdleCallback(() => this.executePrefetch(url))
    } else {
      // High priority prefetching
      this.executePrefetch(url)
    }
  }

  async executePrefetch(url) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        // Cache the response
        const data = await response.json()
        // Store in cache (you can integrate with your cache system)
        this.prefetched.add(url)
      }
    } catch (error) {
      console.warn('Prefetch failed for:', url, error)
    } finally {
      this.prefetchQueue.delete(url)
    }
  }

  isPrefetched(url) {
    return this.prefetched.has(url)
  }
}

/**
 * Request compression for large payloads
 */
class RequestCompressor {
  constructor() {
    this.supported = 'CompressionStream' in window
  }

  async compress(data) {
    if (!this.supported) {
      return data
    }

    try {
      const stream = new CompressionStream('gzip')
      const writer = stream.writable.getWriter()
      const reader = stream.readable.getReader()

      writer.write(new TextEncoder().encode(JSON.stringify(data)))
      writer.close()

      const chunks = []
      let done = false

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        if (value) {
          chunks.push(value)
        }
      }

      const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
      let offset = 0
      for (const chunk of chunks) {
        compressed.set(chunk, offset)
        offset += chunk.length
      }

      return compressed
    } catch (error) {
      console.warn('Compression failed, falling back to uncompressed:', error)
      return data
    }
  }

  async decompress(compressedData) {
    if (!this.supported) {
      return compressedData
    }

    try {
      const stream = new DecompressionStream('gzip')
      const writer = stream.writable.getWriter()
      const reader = stream.readable.getReader()

      writer.write(compressedData)
      writer.close()

      const chunks = []
      let done = false

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        if (value) {
          chunks.push(value)
        }
      }

      const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
      let offset = 0
      for (const chunk of chunks) {
        decompressed.set(chunk, offset)
        offset += chunk.length
      }

      return JSON.parse(new TextDecoder().decode(decompressed))
    } catch (error) {
      console.warn('Decompression failed:', error)
      return compressedData
    }
  }
}

/**
 * Network status monitoring
 */
class NetworkMonitor {
  constructor() {
    this.online = navigator.onLine
    this.connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    this.listeners = new Set()

    this.setupEventListeners()
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.online = true
      this.notifyListeners('online')
    })

    window.addEventListener('offline', () => {
      this.online = false
      this.notifyListeners('offline')
    })

    if (this.connection) {
      this.connection.addEventListener('change', () => {
        this.notifyListeners('connectionchange')
      })
    }
  }

  addListener(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  notifyListeners(event) {
    this.listeners.forEach(callback => callback(event, this.getStatus()))
  }

  getStatus() {
    return {
      online: this.online,
      effectiveType: this.connection?.effectiveType || 'unknown',
      downlink: this.connection?.downlink || 0,
      rtt: this.connection?.rtt || 0
    }
  }

  isSlowConnection() {
    return this.connection?.effectiveType === 'slow-2g' || this.connection?.effectiveType === '2g'
  }

  shouldUseCompression() {
    return this.isSlowConnection() || this.connection?.downlink < 1
  }
}

// Global instances
export const requestDeduplicator = new RequestDeduplicator()
export const retryManager = new RetryManager()
export const connectionPool = new ConnectionPool()
export const requestBatcher = new RequestBatcher()
export const prefetchManager = new PrefetchManager()
export const requestCompressor = new RequestCompressor()
export const networkMonitor = new NetworkMonitor()

/**
 * Optimized fetch wrapper with all optimizations
 */
export async function optimizedFetch(url, options = {}) {
  const {
    retry = true,
    compress = false,
    deduplicate = true,
    prefetch = false,
    ...fetchOptions
  } = options

  // Check if we should use compression
  const shouldCompress = compress || networkMonitor.shouldUseCompression()

  // Prepare request
  let requestBody = fetchOptions.body
  if (requestBody && shouldCompress && typeof requestBody === 'object') {
    requestBody = await requestCompressor.compress(requestBody)
    fetchOptions.headers = {
      ...fetchOptions.headers,
      'Content-Encoding': 'gzip',
      'Content-Type': 'application/json'
    }
  }

  // Create request function
  const requestFn = async () => {
    return connectionPool.execute(async () => {
      const response = await fetch(url, {
        ...fetchOptions,
        body: requestBody
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      let data = await response.json()

      // Decompress if needed
      if (response.headers.get('Content-Encoding') === 'gzip') {
        data = await requestCompressor.decompress(data)
      }

      return data
    })
  }

  // Add retry logic
  const retryFn = retry ? () => retryManager.retry(requestFn) : requestFn

  // Add deduplication
  const dedupeKey = `${url}_${JSON.stringify(fetchOptions)}`
  const finalFn = deduplicate ?
    () => requestDeduplicator.deduplicate(dedupeKey, retryFn) :
    retryFn

  // Execute request
  const result = await finalFn()

  // Prefetch related resources if requested
  if (prefetch && result.data) {
    // Implement prefetch logic based on response data
    // For example, prefetch next page or related products
  }

  return result
}

/**
 * Batch multiple API calls
 */
export function batchRequests(requests) {
  return Promise.all(requests.map(request =>
    requestBatcher.add(() => optimizedFetch(request.url, request.options))
  ))
}

/**
 * Prefetch resources based on user behavior
 */
export function smartPrefetch(currentPage, userBehavior = {}) {
  // Implement smart prefetching based on current page and user behavior
  const prefetchRules = {
    '/products': () => {
      prefetchManager.prefetch('/api/products?page=2', 'low')
      prefetchManager.prefetch('/api/categories', 'low')
    },
    '/product': () => {
      prefetchManager.prefetch('/api/products/related', 'low')
      prefetchManager.prefetch('/api/reviews', 'low')
    },
    '/cart': () => {
      prefetchManager.prefetch('/api/shipping-methods', 'low')
      prefetchManager.prefetch('/api/payment-methods', 'low')
    }
  }

  const rule = prefetchRules[currentPage]
  if (rule) {
    rule()
  }
}
