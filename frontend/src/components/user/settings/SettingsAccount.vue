<template>
  <div class="bg-[#2d2218] rounded-lg p-6 border border-[#4a3421]">
    <h3 class="text-xl font-semibold text-white mb-6">Account Settings</h3>

    <form @submit.prevent="$emit('submit')" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-white mb-2">First Name</label>
          <input
            v-model="accountForm.first_name"
            type="text"
            class="w-full px-4 py-3 bg-[#4a3421] border border-[#714f32] rounded-lg text-white placeholder-[#ccaa8e] focus:border-orange-500 focus:outline-none"
            placeholder="Enter your first name"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-white mb-2">Last Name</label>
          <input
            v-model="accountForm.last_name"
            type="text"
            class="w-full px-4 py-3 bg-[#4a3421] border border-[#714f32] rounded-lg text-white placeholder-[#ccaa8e] focus:border-orange-500 focus:outline-none"
            placeholder="Enter your last name"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-white mb-2">Email Address</label>
        <input
          v-model="accountForm.email"
          type="email"
          class="w-full px-4 py-3 bg-[#4a3421] border border-[#714f32] rounded-lg text-white placeholder-[#ccaa8e] focus:border-orange-500 focus:outline-none"
          placeholder="Enter your email address"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-white mb-2">Phone Number</label>
        <input
          v-model="accountForm.phone"
          type="tel"
          class="w-full px-4 py-3 bg-[#4a3421] border border-[#714f32] rounded-lg text-white placeholder-[#ccaa8e] focus:border-orange-500 focus:outline-none"
          placeholder="Enter your phone number"
        />
      </div>

      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="isUpdating"
          class="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          <span v-if="isUpdating" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></span>
          Update Account
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
defineProps({
  accountForm: { type: Object, required: true },
  isUpdating: { type: Boolean, required: true }
})
defineEmits(['submit'])
</script>
