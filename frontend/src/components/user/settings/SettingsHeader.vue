<template>
  <header class="sticky top-0 z-10 bg-[#231910]/80 backdrop-blur-sm">
    <div class="container mx-auto flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#4a3421] px-4 sm:px-6 lg:px-8 py-3">
      <router-link to="/" class="flex items-center gap-4 hover:opacity-80 transition-opacity">
        <svg class="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
        </svg>
        <h1 class="text-2xl font-bold tracking-tight">SoleMate</h1>
      </router-link>

      <nav class="hidden md:flex items-center gap-8">
        <router-link to="/products?new=true" class="text-sm font-medium hover:text-orange-500 transition-colors">New Arrivals</router-link>
        <router-link to="/products?category=men" class="text-sm font-medium hover:text-orange-500 transition-colors">Men</router-link>
        <router-link to="/products?category=women" class="text-sm font-medium hover:text-orange-500 transition-colors">Women</router-link>
        <router-link to="/products?category=kids" class="text-sm font-medium hover:text-orange-500 transition-colors">Kids</router-link>
      </nav>

      <div class="flex items-center gap-2">
        <button @click="showSearchModal = true" class="flex h-10 w-10 items-center justify-center rounded-full bg-[#4a3421] text-white transition-colors hover:bg-[#5a4431]">
          <span class="material-symbols-outlined text-xl">search</span>
        </button>
        <router-link to="/wishlist" class="flex h-10 w-10 items-center justify-center rounded-full bg-[#4a3421] text-white transition-colors hover:bg-[#5a4431]">
          <span class="material-symbols-outlined text-xl">favorite_border</span>
        </router-link>
        <router-link to="/cart" class="flex h-10 w-10 items-center justify-center rounded-full bg-[#4a3421] text-white transition-colors hover:bg-[#5a4431]">
          <span class="material-symbols-outlined text-xl">shopping_bag</span>
        </router-link>
        <ProfileDropdown />
      </div>
    </div>

    <!-- Search Modal -->
    <SearchModal v-model="showSearchModal" @close="showSearchModal = false" />
  </header>
</template>

<script setup>
import { ref } from 'vue'
import ProfileDropdown from '@/components/ProfileDropdown.vue'
import SearchModal from '@/components/search/SearchModal.vue'

const showSearchModal = ref(false)
</script>
