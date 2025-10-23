<template>
  <div class="bg-neutral-900 text-neutral-100">
    <div class="relative min-h-screen flex items-center justify-center">
      <!-- Background Image -->
      <div class="absolute inset-0 z-0">
        <img
          alt="Background of shoes"
          class="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuClKAbqcptjuKYvMPpx-e4SC5PiZdBDY4sruvtJ23lfMLKVCY3wqXpFfkdP-F6yx_nDcYh1Sg_Vuz5w4cKw7QsfltR1k2pAPgSrKa5yrnwFCsDxqUOoMnPz1WHZ2g8pduInKisATsZ3RMMxI1Qmk9X3IBavqx4tGrKoLm-30FAhmz8bzn-GEqkcrDrE9IQReDHI6APsbf4RwGngr093VIHo2HVHuFyFsQPWaYjHS0uodXCLwWofAd37lyT9uUw1qEbaRjhs7nfF7sI"
        />
        <div class="absolute inset-0 bg-black opacity-60"></div>
      </div>

      <!-- Content -->
      <div class="relative z-10 flex flex-col min-h-screen w-full">
        <!-- Header -->
        <header class="sticky top-0 z-10 bg-neutral-900-transparent backdrop-blur-sm">
          <div class="container px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between border-b border-neutral-800 py-4">
              <!-- Brand -->
              <div class="flex items-center gap-3">
                <svg fill="var(--primary-500)" height="24" viewBox="0 0 48 48" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"></path>
                </svg>
                <h1 class="text-xl font-bold">SoleMate</h1>
              </div>

              <!-- Navigation - Enhanced with Router Links -->
              <nav class="hidden md:flex items-center gap-8 text-sm font-medium">
                <router-link to="/products?new=true" class="hover:text-primary-500 transition-colors">New Arrivals</router-link>
                <router-link to="/products?category=men" class="hover:text-primary-500 transition-colors">Men</router-link>
                <router-link to="/products?category=women" class="hover:text-primary-500 transition-colors">Women</router-link>
                <router-link to="/products?category=kids" class="hover:text-primary-500 transition-colors">Kids</router-link>
              </nav>

              <!-- Header Actions - Enhanced -->
              <div class="flex items-center gap-4">
                <router-link to="/products" class="p-2 rounded-full hover:bg-neutral-800-50 transition-colors" title="Search Products">
                  <span class="material-symbols-outlined">search</span>
                </router-link>
                <router-link to="/products" class="hidden md:flex p-2 rounded-full hover:bg-neutral-800-50 transition-colors" title="Shop Now">
                  <span class="material-symbols-outlined">shopping_bag</span>
                </router-link>
                <router-link to="/" class="hidden md:flex px-4 py-2 bg-primary-500 hover:bg-orange-600 rounded-full text-white font-medium text-sm transition-colors">
                  Browse Shop
                </router-link>
              </div>
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <main class="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div class="w-full max-w-lg bg-neutral-800-60 backdrop-blur-md p-10 rounded-xl" style="max-width: 32rem; padding: 3rem;">
            <!-- Title -->
            <div>
              <h2 class="mt-8 text-center font-bold tracking-tight text-neutral-100" style="font-size: 3rem; margin-top: 2rem; margin-bottom: 1rem;">
                Join SoleMate
              </h2>
              <p class="text-center text-neutral-400" style="font-size: 1.125rem; margin: 0;">
                Create your account and start shopping.
              </p>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleRegister" style="margin-top: 3rem;">
              <!-- Error Message -->
              <div v-if="error" style="padding: 0.75rem; background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 0.375rem; color: #fca5a5; font-size: 0.875rem; text-align: center;">
                {{ error }}
              </div>

              <!-- Input Fields -->
              <div class="rounded-lg shadow-lg" style="margin-bottom: 2rem;">
                <!-- Full Name -->
                <div>
                  <label class="sr-only" for="full-name">Full Name</label>
                  <input
                    v-model="form.fullName"
                    autocomplete="name"
                    class="form-input appearance-none relative block w-full px-4 py-4 border text-neutral-100 placeholder-neutral-400 focus:z-10 text-base rounded-t-lg"
                    id="full-name"
                    name="full-name"
                    placeholder="Full Name"
                    required
                    type="text"
                    style="padding: 1rem; font-size: 1rem;"
                  />
                </div>

                <!-- Email -->
                <div>
                  <label class="sr-only" for="email-address">Email address</label>
                  <input
                    v-model="form.email"
                    autocomplete="email"
                    class="form-input appearance-none relative block w-full px-4 py-4 border text-neutral-100 placeholder-neutral-400 focus:z-10 text-base"
                    id="email-address"
                    name="email"
                    placeholder="Email address"
                    required
                    type="email"
                    style="padding: 1rem; font-size: 1rem; margin-top: -1px;"
                  />
                </div>

                <!-- Password -->
                <div style="position: relative;">
                  <label class="sr-only" for="password">Password</label>
                  <input
                    v-model="form.password"
                    autocomplete="new-password"
                    class="form-input appearance-none relative block w-full px-4 py-4 border text-neutral-100 placeholder-neutral-400 focus:z-10 text-base"
                    id="password"
                    name="password"
                    placeholder="Password"
                    required
                    :type="showPassword ? 'text' : 'password'"
                    style="padding: 1rem 3rem 1rem 1rem; font-size: 1rem; margin-top: -1px;"
                  />
                  <button
                    @click="togglePasswordVisibility"
                    type="button"
                    class="absolute text-neutral-400 hover:text-neutral-200 transition-colors"
                    style="top: 50%; right: 1rem; transform: translateY(-50%); border: none; background: transparent; cursor: pointer; z-index: 10;"
                    :title="showPassword ? 'Hide password' : 'Show password'"
                  >
                    <span class="material-symbols-outlined" style="font-size: 1.25rem;">
                      {{ showPassword ? 'visibility_off' : 'visibility' }}
                    </span>
                  </button>
                  <!-- Password Requirements -->
                  <div v-if="form.password" class="mt-2 text-xs text-neutral-400" style="padding: 0 1rem;">
                    <div class="flex items-center gap-2">
                      <span :class="form.password.length >= 6 ? 'text-green-400' : 'text-neutral-500'">✓</span>
                      <span>At least 6 characters</span>
                    </div>
                  </div>
                </div>

                <!-- Confirm Password -->
                <div style="position: relative;">
                  <label class="sr-only" for="confirm-password">Confirm Password</label>
                  <input
                    v-model="form.confirmPassword"
                    autocomplete="new-password"
                    class="form-input appearance-none relative block w-full px-4 py-4 border text-neutral-100 placeholder-neutral-400 focus:z-10 text-base rounded-b-lg"
                    id="confirm-password"
                    name="confirm-password"
                    placeholder="Confirm Password"
                    required
                    :type="showConfirmPassword ? 'text' : 'password'"
                    style="padding: 1rem 3rem 1rem 1rem; font-size: 1rem; margin-top: -1px;"
                  />
                  <button
                    @click="toggleConfirmPasswordVisibility"
                    type="button"
                    class="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-200 transition-colors"
                    style="top: 0; right: 0; height: 100%; padding: 0 1rem; border: none; background: transparent; cursor: pointer;"
                    :title="showConfirmPassword ? 'Hide password' : 'Show password'"
                  >
                    <span class="material-symbols-outlined" style="font-size: 1.25rem;">
                      {{ showConfirmPassword ? 'visibility_off' : 'visibility' }}
                    </span>
                  </button>
                </div>
              </div>

              <!-- Terms and Conditions -->
              <div class="flex items-center" style="margin-bottom: 2rem;">
                <input
                  class="h-4 w-4 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-0 checkbox-custom"
                  id="terms-and-conditions"
                  name="terms-and-conditions"
                  type="checkbox"
                  v-model="form.termsAccepted"
                  required
                />
                <label class="ml-2 block text-sm text-neutral-400" for="terms-and-conditions" style="font-size: 1rem;">
                  I agree to the
                  <a class="font-medium text-primary-500 hover:text-orange-400" href="/terms.html" target="_blank" style="font-size: 1rem;">
                    Terms and Conditions
                  </a>
                </label>
              </div>

              <!-- Submit Button -->
              <div style="margin-bottom: 2rem;">
                <button
                  type="submit"
                  :disabled="isSubmitting || isLoading"
                  class="relative w-full flex justify-center border border-transparent font-bold rounded-lg text-white bg-primary-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  style="padding: 1rem 1.5rem; font-size: 1.125rem; cursor: pointer;"
                  :style="{ cursor: (isSubmitting || isLoading) ? 'not-allowed' : 'pointer', opacity: (isSubmitting || isLoading) ? 0.6 : 1 }"
                >
                  <span v-if="isSubmitting || isLoading" style="display: flex; align-items: center;">
                    <span style="display: inline-block; width: 1.25rem; height: 1.25rem; border: 2px solid transparent; border-top-color: currentColor; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 0.5rem;"></span>
                    Creating Account...
                  </span>
                  <span v-else>Sign Up</span>
                </button>
              </div>
            </form>

            <!-- Divider -->
            <div class="relative" style="margin: 2rem 0;">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-neutral-700"></div>
              </div>
              <div class="relative flex justify-center" style="font-size: 1rem;">
                <span class="px-4 bg-neutral-800-transparent backdrop-blur-sm text-neutral-400" style="font-size: 1rem;">Or continue with</span>
              </div>
            </div>

            <!-- Social Login -->
            <div class="grid grid-cols-2 gap-4" style="margin-top: 2rem;">
              <div>
                <button
                  @click="handleSocialRegister('google')"
                  type="button"
                  class="w-full inline-flex justify-center border border-neutral-700 rounded-lg shadow-sm bg-neutral-800-60 backdrop-blur-sm font-medium text-neutral-100 hover:bg-neutral-700 transition-colors"
                  style="padding: 1rem; font-size: 1rem;"
                >
                  <span class="sr-only">Sign in with Google</span>
                  <svg aria-hidden="true" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path clip-rule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.418 2.865 8.165 6.837 9.489.5.092.682-.218.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.338 4.695-4.566 4.942.359.308.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0020 10c0-5.523-4.477-10-10-10z" fill-rule="evenodd"></path>
                  </svg>
                </button>
              </div>
              <div>
                <button
                  @click="handleSocialRegister('facebook')"
                  type="button"
                  class="w-full inline-flex justify-center border border-neutral-700 rounded-lg shadow-sm bg-neutral-800-60 backdrop-blur-sm font-medium text-neutral-100 hover:bg-neutral-700 transition-colors"
                  style="padding: 1rem; font-size: 1rem;"
                >
                  <span class="sr-only">Sign in with Facebook</span>
                  <svg aria-hidden="true" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path clip-rule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" fill-rule="evenodd"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Sign In Link -->
            <div class="text-center text-neutral-400" style="margin-top: 2rem; font-size: 1rem;">
              Already have an account?
              <router-link class="font-medium text-primary-500 hover:text-orange-400" to="/login" style="font-size: 1rem;">
                Sign in
              </router-link>
            </div>

            <!-- Quick Access Links - Enhanced Design -->
            <div class="quick-access-grid" style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid rgba(64, 64, 64, 0.5);">
              <div style="text-align: center; margin-bottom: 1rem;">
                <p style="color: #9ca3af; font-size: 0.875rem; margin-bottom: 1rem;">Explore SoleMate</p>
              </div>
              <div class="grid grid-cols-3 gap-3">
                <router-link to="/" class="quick-link-card" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; background: rgba(212, 165, 116, 0.1); border: 1px solid rgba(212, 165, 116, 0.3); border-radius: 8px; text-decoration: none; transition: all 0.2s;">
                  <span class="material-symbols-outlined" style="color: #d4a574; font-size: 2rem; margin-bottom: 0.5rem;">home</span>
                  <span style="color: #d4a574; font-size: 0.75rem; font-weight: 500;">Home</span>
                </router-link>
                <router-link to="/products" class="quick-link-card" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; background: rgba(212, 165, 116, 0.1); border: 1px solid rgba(212, 165, 116, 0.3); border-radius: 8px; text-decoration: none; transition: all 0.2s;">
                  <span class="material-symbols-outlined" style="color: #d4a574; font-size: 2rem; margin-bottom: 0.5rem;">storefront</span>
                  <span style="color: #d4a574; font-size: 0.75rem; font-weight: 500;">Products</span>
                </router-link>
                <router-link to="/about" class="quick-link-card" style="display: flex; flex-direction: column; align-items: center; padding: 1rem; background: rgba(212, 165, 116, 0.1); border: 1px solid rgba(212, 165, 116, 0.3); border-radius: 8px; text-decoration: none; transition: all 0.2s;">
                  <span class="material-symbols-outlined" style="color: #d4a574; font-size: 2rem; margin-bottom: 0.5rem;">info</span>
                  <span style="color: #d4a574; font-size: 0.75rem; font-weight: 500;">About</span>
                </router-link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
// ✅ Enhanced Register Optimization
import performanceMonitorEnhanced from '@/utils/performanceMonitorEnhanced'
import globalErrorHandler from '@/utils/globalErrorHandler'
import advancedCache from '@/utils/advancedCache'

const router = useRouter()
const authStore = useAuthStore()
const isLoading = ref(false)

// Reactive data
const isSubmitting = ref(false)
const error = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Registration form data
const form = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  termsAccepted: false
})

// Methods
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const handleRegister = async () => {
  if (isSubmitting.value || isLoading.value) return

  // Validation
  if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
    error.value = 'Please fill in all fields'
    return
  }

  if (form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }

  if (form.password.length < 6) {
    error.value = 'Password must be at least 6 characters long'
    return
  }

  if (!form.termsAccepted) {
    error.value = 'Please accept the terms and conditions'
    return
  }

  error.value = ''
  isSubmitting.value = true

  try {
    const response = await authStore.register({
      name: form.fullName,
      email: form.email,
      password: form.password,
      password_confirmation: form.confirmPassword
    })

    if (response.success) {
      // Redirect based on user role
      if (authStore.user?.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/')
      }
    } else {
      // Handle validation errors from backend
      if (response.errors && typeof response.errors === 'object') {
        const errorMessages = []
        Object.keys(response.errors).forEach(field => {
          if (Array.isArray(response.errors[field])) {
            errorMessages.push(...response.errors[field])
          }
        })
        error.value = errorMessages.join('. ') || response.message || 'Registration failed. Please try again.'
      } else {
        error.value = response.message || 'Registration failed. Please try again.'
      }
    }
  } catch (err) {
    console.error('Registration error:', err)
    error.value = err.message || 'Registration failed. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

const handleSocialRegister = async (provider) => {
  try {
    isLoading.value = true
    error.value = ''

    // Get redirect URL from backend
    const response = await fetch(`http://localhost:8000/api/auth/${provider}`)
    const data = await response.json()

    if (data.success && data.data.redirect_url) {
      // Redirect to OAuth provider
      window.location.href = data.data.redirect_url
    } else {
      throw new Error(data.message || 'Failed to initiate OAuth')
    }
  } catch (err) {
    console.error(`${provider} registration error:`, err)
    error.value = `Failed to register with ${provider}: ${err.message}`
    isLoading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  // ✅ Start page load monitoring
  const measurement = performanceMonitorEnhanced.startMeasure('register-page-load', 'page-load')

  try {
    // ✅ Preload background image
    const bgImg = new Image()
    bgImg.src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuClKAbqcptjuKYvMPpx-e4SC5PiZdBDY4sruvtJ23lfMLKVCY3wqXpFfkdP-F6yx_nDcYh1Sg_Vuz5w4cKw7QsfltR1k2pAPgSrKa5yrnwFCsDxqUOoMnPz1WHZ2g8pduInKisATsZ3RMMxI1Qmk9X3IBavqx4tGrKoLm-30FAhmz8bzn-GEqkcrDrE9IQReDHI6APsbf4RwGngr093VIHo2HVHuFyFsQPWaYjHS0uodXCLwWofAd37lyT9uUw1qEbaRjhs7nfF7sI'

    // Initialize auth store
    await authStore.initializeAuth()

    // Check if already authenticated
    if (authStore.isAuthenticated) {
      if (authStore.isAdmin) {
        router.push('/admin/dashboard')
      } else {
        router.push('/')
      }
    }
    
    // ✅ Focus on name input for better UX
    requestAnimationFrame(() => {
      const nameInput = document.getElementById('name')
      if (nameInput) nameInput.focus()
    })
    
    } finally {
    performanceMonitorEnhanced.endMeasure(measurement)
  }
})
</script>

<style scoped>
@import '@/styles/auth/Login.css';

/* Enhanced Quick Links Hover Effects */
.quick-link-card:hover {
  background: rgba(212, 165, 116, 0.2) !important;
  border-color: rgba(212, 165, 116, 0.5) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 165, 116, 0.2);
}

.quick-link-card:hover .material-symbols-outlined {
  transform: scale(1.1);
}

.quick-link-card .material-symbols-outlined {
  transition: transform 0.2s;
}

/* Enhanced text links */
.text-link:hover {
  color: #e5b887 !important;
  text-decoration: underline;
}

/* Responsive Quick Access Grid */
@media (max-width: 640px) {
  .quick-access-grid .grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }
  
  .quick-link-card {
    padding: 0.75rem !important;
  }
  
  .quick-link-card .material-symbols-outlined {
    font-size: 1.5rem !important;
  }
  
  .quick-link-card span:last-child {
    font-size: 0.625rem !important;
  }
}
</style>
