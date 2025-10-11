<template>
  <header class="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
    <div class="container mx-auto px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-secondary-400 text-3xl">🌲</span>
          <div>
            <h1 class="text-xl font-bold text-zinc-100">Rosewood Events</h1>
            <p class="text-xs text-zinc-500">Event Management System</p>
          </div>
        </div>

        <div v-if="authStore.isAuthenticated" class="flex items-center gap-4">
          <span class="text-sm text-zinc-400">{{ authStore.user?.fullName }}</span>
          <button
            @click="handleLogout"
            class="px-4 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition"
          >
            Logout →
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/auth/login')
}
</script>
