<template>
  <div class="bg-[#2d2218] rounded-lg p-6 border border-[#4a3421]">
    <h3 class="text-xl font-semibold text-white mb-6">Privacy Settings</h3>

    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-white font-medium">Profile Visibility</h4>
          <p class="text-[#ccaa8e] text-sm">Make your profile visible to other users</p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input v-model="privacySettings.profile_visible" type="checkbox" class="sr-only peer" />
          <div class="w-11 h-6 bg-[#4a3421] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
        </label>
      </div>

      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-white font-medium">Data Sharing</h4>
          <p class="text-[#ccaa8e] text-sm">Allow sharing of anonymized data for analytics</p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input v-model="privacySettings.data_sharing" type="checkbox" class="sr-only peer" />
          <div class="w-11 h-6 bg-[#4a3421] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
        </label>
      </div>

      <div class="flex justify-end">
        <button @click="$emit('save')" :disabled="isUpdating" class="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50">
          <span v-if="isUpdating" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></span>
          Save Settings
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  privacySettings: { type: Object, required: true },
  isUpdating: { type: Boolean, required: true }
})
defineEmits(['save'])
</script>
