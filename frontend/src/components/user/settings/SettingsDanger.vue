<template>
  <div class="bg-[#2d2218] rounded-lg p-6 border border-red-500/50">
    <h3 class="text-xl font-semibold text-red-500 mb-6">Danger Zone</h3>

    <div class="space-y-6">
      <div class="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
        <h4 class="text-white font-medium mb-2">Delete Account</h4>
        <p class="text-[#ccaa8e] text-sm mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
        <button @click="$emit('confirm-delete')" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['confirm-delete'])
</script>
