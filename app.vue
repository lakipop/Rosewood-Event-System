<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

// Initialize auth on app mount
onMounted(() => {
  authStore.initAuth()
})
</script>
