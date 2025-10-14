<template>
  <header class="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-gradient-to-r from-zinc-900/95 via-zinc-900/90 to-rose-800/20 border-b border-zinc-800/50 shadow-2xl">
    <div class="h-16 px-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <!-- Hamburger Menu Toggle -->
        <button
          v-if="authStore.isAuthenticated"
          @click="toggleSidebar"
          class="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all duration-200"
          aria-label="Toggle sidebar"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Logo - Always visible -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-2xl shadow-lg shadow-primary-500/20 animate-float">
            🌹
          </div>
          <div class="hidden sm:block">
            <h1 class="text-lg font-bold bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent">Rosewood Events</h1>
            <p class="text-xs text-zinc-500">Event Management System</p>
          </div>
        </div>
      </div>

      <!-- User Menu -->
      <div v-if="authStore.isAuthenticated" class="flex items-center gap-3">
        <div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-white/5 to-white/10 border border-white/10">
          <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span class="text-sm text-zinc-300">{{ authStore.user?.fullName }}</span>
        </div>
        <button
          @click="handleLogout"
          class="px-4 py-2 text-sm text-zinc-300 hover:text-white rounded-lg transition-all duration-200 backdrop-blur-sm hover:bg-gradient-to-r hover:from-red-500/20 hover:to-red-600/10 border border-transparent hover:border-red-500/50"
        >
          Logout →
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// Toggle sidebar using custom event
const toggleSidebar = () => {
  window.dispatchEvent(new CustomEvent('toggle-sidebar'))
}

const handleLogout = () => {
  authStore.logout()
  router.push('/auth/login')
}
</script>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
</style>
