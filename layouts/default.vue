<template>
  <div class="min-h-screen bg-zinc-950">
    <AppHeader />
    
    <div class="flex">
      <AppSidebar v-if="authStore.isAuthenticated" />
      
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
</script>
