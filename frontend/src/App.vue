<template>
  <div id="app">
    <!-- Router View for different pages -->
    <router-view />

    <!-- Global Notification Container -->
    <NotificationContainer />

  </div>
</template>

<script setup>
import NotificationContainer from '@/components/NotificationContainer.vue'

// App.vue is now just a router wrapper with global components
// Auth initialization will be handled in individual components that need it
</script>

<style scoped>
@import './App.css';
</style>
