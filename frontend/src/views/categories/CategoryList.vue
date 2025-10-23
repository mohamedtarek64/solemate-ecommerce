<template>
  <div class="category-list-page">
    <!-- Breadcrumb -->
    <div class="bg-white border-b border-gray-200">
      <div class="container mx-auto px-4 py-4">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-4">
            <li>
              <router-link to="/" class="text-gray-400 hover:text-orange-600">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
              </router-link>
            </li>
            <li>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span class="ml-4 text-sm font-medium text-gray-500">Categories</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>

    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="category-list-header">
        <h1 class="category-list-title">Shop by Category</h1>
        <p class="category-list-description">
          Discover our wide range of products organized by category. Find exactly what you're looking for with our comprehensive category system.
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="category-list-loading">
        <div v-for="i in 6" :key="i" class="category-skeleton">
          <div class="category-skeleton-card">
            <div class="category-skeleton-image"></div>
            <div class="category-skeleton-content">
              <div class="category-skeleton-title"></div>
              <div class="category-skeleton-description"></div>
              <div class="category-skeleton-subcategories"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Categories Grid -->
      <div v-else class="category-grid">
        <div
          v-for="category in categories"
          :key="category.id"
          class="category-card"
        >
          <!-- Category Image -->
          <div class="category-card-image">
            <img
              :src="category.image || '/images/placeholder-category.jpg'"
              :alt="category.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              @error="handleImageError"
            >
            <div class="category-card-overlay"></div>

            <!-- Product Count Badge -->
            <div class="absolute top-4 right-4">
              <span class="category-card-badge">
                {{ category.products_count || 0 }} products
              </span>
            </div>
          </div>

          <!-- Category Info -->
          <div class="category-card-content">
            <h3 class="category-card-title">
              {{ category.name }}
            </h3>
            <p v-if="category.description" class="category-card-description">
              {{ category.description }}
            </p>

            <!-- Subcategories -->
            <div v-if="category.children && category.children.length > 0" class="category-card-subcategories">
              <p class="category-card-subcategories-title">Subcategories:</p>
              <div class="category-card-subcategories-list">
                <span
                  v-for="child in category.children.slice(0, 3)"
                  :key="child.id"
                  class="category-card-subcategory"
                >
                  {{ child.name }}
                </span>
                <span
                  v-if="category.children.length > 3"
                  class="category-card-subcategory"
                >
                  +{{ category.children.length - 3 }} more
                </span>
              </div>
            </div>

            <!-- Action Button -->
            <router-link
              :to="`/products?category=${category.id}`"
              class="category-card-action"
            >
              Shop Now
              <svg class="category-card-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && categories.length === 0" class="category-empty-state">
        <svg class="category-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
        <h3 class="category-empty-title">No categories found</h3>
        <p class="category-empty-description">There are no categories available at the moment.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCategoryList } from '@/composables/useCategories.js'

// Use the separated script
const { categories, loading, handleImageError } = useCategoryList()
</script>
