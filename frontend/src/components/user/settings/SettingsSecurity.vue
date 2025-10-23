<template>
  <div class="bg-[#2d2218] rounded-lg p-6 border border-[#4a3421]">
    <h3 class="text-xl font-semibold text-white mb-6">Security Settings</h3>

    <form @submit.prevent="$emit('submit')" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-white mb-2">Current Password</label>
        <input
          v-model="passwordForm.current_password"
          type="password"
          class="w-full px-4 py-3 bg-[#4a3421] border border-[#714f32] rounded-lg text-white placeholder-[#ccaa8e] focus:border-orange-500 focus:outline-none"
          placeholder="Enter your current password"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-white mb-2">New Password</label>
        <input
          v-model="passwordForm.new_password"
          type="password"
          class="w-full px-4 py-3 bg-[#4a3421] border border-[#714f32] rounded-lg text-white placeholder-[#ccaa8e] focus:border-orange-500 focus:outline-none"
          placeholder="Enter your new password"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-white mb-2">Confirm New Password</label>
        <input
          v-model="passwordForm.confirm_password"
          type="password"
          class="w-full px-4 py-3 bg-[#4a3421] border border-[#714f32] rounded-lg text-white placeholder-[#ccaa8e] focus:border-orange-500 focus:outline-none"
          placeholder="Confirm your new password"
        />
      </div>

      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="isUpdating"
          class="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          <span v-if="isUpdating" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></span>
          Update Password
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
defineProps({
  passwordForm: { type: Object, required: true },
  isUpdating: { type: Boolean, required: true }
})
defineEmits(['submit'])
</script>
