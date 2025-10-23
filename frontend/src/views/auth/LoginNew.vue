<template>
  <div class="flex flex-col min-h-screen bg-gray-900 text-white">
    <!-- Header -->
    <header class="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-sm">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between border-b border-gray-800 py-4">
          <div class="flex items-center gap-3">
            <svg fill="#f97306" height="24" viewBox="0 0 48 48" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"></path>
            </svg>
            <h1 class="text-xl font-bold">SoleMate</h1>
          </div>
          <nav class="hidden md:flex items-center gap-8 text-sm font-medium">
            <router-link to="/products?new=true" class="hover:text-orange-500 transition-colors">New Arrivals</router-link>
            <router-link to="/products?category=men" class="hover:text-orange-500 transition-colors">Men</router-link>
            <router-link to="/products?category=women" class="hover:text-orange-500 transition-colors">Women</router-link>
            <router-link to="/products?category=kids" class="hover:text-orange-500 transition-colors">Kids</router-link>
          </nav>
          <div class="flex items-center gap-4">
            <button class="p-2 rounded-full hover:bg-gray-800 transition-colors">
              <span class="material-symbols-outlined">search</span>
            </button>
            <button class="p-2 rounded-full hover:bg-gray-800 transition-colors">
              <span class="material-symbols-outlined">favorite</span>
            </button>
            <button class="md:hidden p-2 rounded-full hover:bg-gray-800 transition-colors">
              <span class="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-md space-y-8 bg-gray-800/30 p-8 rounded-lg border border-gray-800">
        <div>
          <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-white">
            Welcome Back
          </h2>
          <p class="mt-2 text-center text-sm text-gray-400">
            Log in to your SoleMate account.
          </p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="mt-8 space-y-6">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label class="sr-only" for="email-address">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autocomplete="email"
                required
                v-model="form.email"
                class="form-input appearance-none rounded-none relative block w-full px-3 py-3 border text-white placeholder-gray-400 focus:z-10 sm:text-sm rounded-t-md"
                placeholder="Email address"
              />
            </div>
            <div>
              <label class="sr-only" for="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                v-model="form.password"
                class="form-input appearance-none rounded-none relative block w-full px-3 py-3 border text-white placeholder-gray-400 focus:z-10 sm:text-sm rounded-b-md"
                placeholder="Password"
              />
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                v-model="form.remember"
                class="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-600 rounded bg-gray-800"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-400">
                Remember me
              </label>
            </div>
            <div class="text-sm">
              <a class="font-medium text-orange-500 hover:text-orange-400" href="#">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading"
              class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-orange-500 transition-colors disabled:opacity-50"
            >
              <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ loading ? 'Logging in...' : 'Log In' }}
            </button>
          </div>
        </form>

        <!-- Divider -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-700"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-gray-800/0 backdrop-blur-sm text-gray-400">Or continue with</span>
          </div>
        </div>

        <!-- Social Login -->
        <div class="mt-6 grid grid-cols-2 gap-3">
          <div>
            <button
              @click="handleSocialLogin('google')"
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-gray-800 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
            >
              <span class="sr-only">Sign in with Google</span>
              <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path clip-rule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.418 2.865 8.165 6.837 9.489.5.092.682-.218.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.338 4.695-4.566 4.942.359.308.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0020 10c0-5.523-4.477-10-10-10z" fill-rule="evenodd"></path>
              </svg>
            </button>
          </div>
          <div>
            <button
              @click="handleSocialLogin('facebook')"
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-gray-800 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
            >
              <span class="sr-only">Sign in with Facebook</span>
              <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path clip-rule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" fill-rule="evenodd"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Sign Up Link -->
        <div class="text-center text-sm text-gray-400">
          Don't have an account?
          <router-link class="font-medium text-orange-500 hover:text-orange-400" to="/register">
            Sign up
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useToast } from 'vue-toastification'
import { useLoginNew } from '@/composables/auth/LoginNew.js'

const router = useRouter()
const { login } = useAuth()
const toast = useToast()

// Use composable
const {
  form,
  loading,
  handleLogin,
  handleSocialLogin
} = useLoginNew(router, login, toast)
</script>

<style scoped>
@import '@/styles/auth/LoginNew.css';
</style>
