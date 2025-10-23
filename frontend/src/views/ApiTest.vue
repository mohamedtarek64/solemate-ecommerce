<template>
  <div class="api-test-container">
    <div class="max-w-4xl mx-auto p-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-8">API Connection Test</h1>
      
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-700 mb-4">Test Results</h2>
        
        <div class="space-y-4">
          <div v-for="(test, key) in testResults" :key="key" class="flex items-center justify-between p-4 rounded-lg border">
            <div class="flex items-center space-x-3">
              <div :class="[
                'w-3 h-3 rounded-full',
                test.success ? 'bg-green-500' : 'bg-red-500'
              ]"></div>
              <span class="font-medium capitalize">{{ key }} Test</span>
            </div>
            <div class="text-sm text-gray-600">
              {{ test.message }}
            </div>
          </div>
        </div>
        
        <div class="mt-6 flex space-x-4">
          <button 
            @click="runTests" 
            :disabled="loading"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Running Tests...' : 'Run Tests' }}
          </button>
          
          <button 
            @click="clearResults" 
            class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Clear Results
          </button>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-700 mb-4">API Configuration</h2>
        <div class="bg-gray-100 p-4 rounded-lg">
          <pre class="text-sm text-gray-700">{{ apiConfig }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { runAllTests } from '@/utils/apiTest'
import { API_CONFIG } from '@/config/api'

export default {
  name: 'ApiTest',
  setup() {
    const loading = ref(false)
    const testResults = ref({})
    const apiConfig = ref(API_CONFIG)
    
    const runTests = async () => {
      loading.value = true
      try {
        const results = await runAllTests()
        testResults.value = results.results
      } catch (error) {
        console.error('Test error:', error)
        testResults.value = {
          error: {
            success: false,
            message: error.message || 'Test failed'
          }
        }
      } finally {
        loading.value = false
      }
    }
    
    const clearResults = () => {
      testResults.value = {}
    }
    
    onMounted(() => {
      // Auto-run tests on mount
      runTests()
    })
    
    return {
      loading,
      testResults,
      apiConfig,
      runTests,
      clearResults
    }
  }
}
</script>

<style scoped>
.api-test-container {
  min-height: 100vh;
  background-color: #f8fafc;
}
</style>
