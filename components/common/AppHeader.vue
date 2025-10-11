<template>
  <header class="sticky top-0 z-50 backdrop-blur-xl bg-zinc-900/80 border-b border-zinc-800/50 shadow-lg">
    <div class="container mx-auto px-4 sm:px-6 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background: linear-gradient(135deg, rgba(196, 160, 122, 0.2) 0%, rgba(90, 63, 43, 0.1) 100%);">
            <svg class="w-6 h-6" style="color: #c4a07a;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div>
            <h1 class="text-lg font-bold text-zinc-100">Rosewood Events</h1>
            <p class="text-xs text-zinc-500">Event Management System</p>
          </div>
        </div>

        <div v-if="authStore.isAuthenticated" class="flex items-center gap-3">
          <span class="text-sm text-zinc-400 hidden sm:inline">{{ authStore.user?.fullName }}</span>
          <button
            @click="handleLogout"
            class="px-4 py-2 text-sm text-zinc-300 hover:text-white rounded-lg transition backdrop-blur-sm hover:bg-white/10 border border-transparent hover:border-zinc-700"
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
