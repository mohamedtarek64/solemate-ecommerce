<template>
  <div class="lg:col-span-1">
    <div class="bg-[#2d2218] rounded-lg p-6 border border-[#4a3421]">
      <h3 class="text-lg font-semibold text-white mb-4">Settings</h3>
      <nav class="space-y-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="onClick(tab.id)"
          :class="[
            'w-full text-left px-4 py-3 rounded-lg transition-colors',
            activeTab === tab.id
              ? 'bg-orange-500 text-white'
              : 'text-[#ccaa8e] hover:bg-[#4a3421] hover:text-white'
          ]"
        >
          <span class="material-symbols-outlined mr-3 text-sm">{{ tab.icon }}</span>
          {{ tab.name }}
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  tabs: { type: Array, required: true },
  activeTab: { type: String, required: true }
})
const emit = defineEmits(['update:activeTab'])
const onClick = (id) => emit('update:activeTab', id)
</script>
