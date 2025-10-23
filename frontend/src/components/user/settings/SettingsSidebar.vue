<template>
  <aside class="lg:col-span-1">
    <div class="bg-[#231910] rounded-xl p-6">
      <h2 class="text-3xl font-bold mb-8">My Account</h2>
      <nav class="flex flex-col space-y-2">
        <router-link
          to="/profile"
          class="flex items-center gap-3 rounded-md px-4 py-3 hover:bg-[#4a3421] text-[#ccaa8e] hover:text-white font-semibold text-sm transition-colors"
        >
          <span class="material-symbols-outlined">person</span>
          <span>Profile</span>
        </router-link>
        <router-link
          to="/orders"
          class="flex items-center gap-3 rounded-md px-4 py-3 hover:bg-[#4a3421] text-[#ccaa8e] hover:text-white font-semibold text-sm transition-colors"
        >
          <span class="material-symbols-outlined">receipt_long</span>
          <span>Orders</span>
        </router-link>
        <router-link
          to="/wishlist"
          class="flex items-center gap-3 rounded-md px-4 py-3 hover:bg-[#4a3421] text-[#ccaa8e] hover:text-white font-semibold text-sm transition-colors"
        >
          <span class="material-symbols-outlined">favorite_border</span>
          <span>Wishlist</span>
        </router-link>
        <router-link
          to="/settings"
          class="flex items-center gap-3 rounded-md px-4 py-3 bg-orange-500 text-white font-bold text-sm"
        >
          <span class="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </router-link>
        <div class="border-t border-[#4a3421] my-4"></div>
        <button
          @click="$emit('logout')"
          class="flex items-center gap-3 rounded-md px-4 py-3 hover:bg-[#4a3421] text-[#ccaa8e] hover:text-white font-semibold text-sm transition-colors"
        >
          <span class="material-symbols-outlined">logout</span>
          <span>Logout</span>
        </button>
      </nav>
    </div>
  </aside>
</template>

<script setup>
defineEmits(['logout'])
</script>
