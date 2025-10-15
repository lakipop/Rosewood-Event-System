<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

// Initialize auth immediately (before mounting)
if (import.meta.client) {
  authStore.initAuth()
}
</script>
