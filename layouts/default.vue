<template>
  <div class="min-h-screen bg-zinc-950">
    <AppHeader />
    
    <div class="flex">
      <AppSidebar v-if="authStore.isAuthenticated" />
      
      <main class="flex-1 lg:ml-64 flex justify-center items-start">
        <div class="max-w-6xl px-4 sm:px-12 py-6">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
</script>
