<template>
  <!-- Overlay for mobile -->
  <div
    v-if="isSidebarOpen"
    @click="closeSidebar"
    class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
  ></div>

  <!-- Sidebar -->
  <aside
    class="fixed left-0 top-0 h-screen w-64 backdrop-blur-2xl bg-gradient-to-b from-zinc-900/95 via-zinc-900/90 to-zinc-950/95 border-r border-zinc-800/50 transition-transform duration-300 ease-in-out shadow-2xl"
    :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    style="z-index: 45;"
  >
    <div class="h-full flex flex-col">
      <!-- Sidebar Header Spacer -->
      <div class="h-16 border-b border-zinc-800/30 bg-gradient-to-r from-white/5 to-transparent"></div>
      
      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        <NuxtLink
          to="/"
          @click="closeSidebar"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-300 hover:text-white transition-all duration-200 group hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5"
          active-class="bg-gradient-to-r from-primary-600/30 to-primary-700/20 text-white border-l-2 border-primary-500 shadow-lg shadow-primary-500/20"
        >
          <div class="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:rotate-3" style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(219, 39, 119, 0.08) 100%);">
            <svg class="w-5 h-5" style="color: #f472b6;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span class="font-medium text-sm">Dashboard</span>
        </NuxtLink>

        <NuxtLink
          to="/events"
          @click="closeSidebar"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-300 hover:text-white transition-all duration-200 group hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5"
          active-class="bg-gradient-to-r from-primary-600/30 to-primary-700/20 text-white border-l-2 border-primary-500 shadow-lg shadow-primary-500/20"
        >
          <div class="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:rotate-3" style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(219, 39, 119, 0.08) 100%);">
            <svg class="w-5 h-5" style="color: #f472b6;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span class="font-medium text-sm">Events</span>
        </NuxtLink>

        <NuxtLink
          to="/services"
          @click="closeSidebar"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-300 hover:text-white transition-all duration-200 group hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5"
          active-class="bg-gradient-to-r from-secondary-600/30 to-secondary-700/20 text-white border-l-2 border-secondary-500 shadow-lg shadow-secondary-500/20"
        >
          <div class="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:rotate-3" style="background: linear-gradient(135deg, rgba(196, 160, 122, 0.15) 0%, rgba(90, 63, 43, 0.08) 100%);">
            <svg class="w-5 h-5" style="color: #c4a07a;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span class="font-medium text-sm">Services</span>
        </NuxtLink>

        <NuxtLink
          to="/payments"
          @click="closeSidebar"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-300 hover:text-white transition-all duration-200 group hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5"
          active-class="bg-gradient-to-r from-secondary-600/30 to-secondary-700/20 text-white border-l-2 border-secondary-500 shadow-lg shadow-secondary-500/20"
        >
          <div class="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:rotate-3" style="background: linear-gradient(135deg, rgba(196, 160, 122, 0.15) 0%, rgba(90, 63, 43, 0.08) 100%);">
            <svg class="w-5 h-5" style="color: #c4a07a;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <span class="font-medium text-sm">Payments</span>
        </NuxtLink>

        <!-- Divider -->
        <div class="my-3 border-t border-zinc-700/30 bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent"></div>
        <div class="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
          <span class="w-1 h-1 rounded-full bg-blue-500"></span>
          Reports
        </div>

        <NuxtLink
          to="/reports/revenue-trends"
          @click="closeSidebar"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-300 hover:text-white transition-all duration-200 group hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5"
          active-class="bg-gradient-to-r from-blue-600/30 to-blue-700/20 text-white border-l-2 border-blue-500 shadow-lg shadow-blue-500/20"
        >
          <div class="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:rotate-3" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.08) 100%);">
            <svg class="w-5 h-5" style="color: #60a5fa;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <span class="font-medium text-sm">Revenue Trends</span>
        </NuxtLink>

        <NuxtLink
          to="/reports/service-profitability"
          @click="closeSidebar"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-300 hover:text-white transition-all duration-200 group hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5"
          active-class="bg-gradient-to-r from-green-600/30 to-green-700/20 text-white border-l-2 border-green-500 shadow-lg shadow-green-500/20"
        >
          <div class="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:rotate-3" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(21, 128, 61, 0.08) 100%);">
            <svg class="w-5 h-5" style="color: #4ade80;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span class="font-medium text-sm">Service Profitability</span>
        </NuxtLink>

        <NuxtLink
          to="/reports/client-segments"
          @click="closeSidebar"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-300 hover:text-white transition-all duration-200 group hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5"
          active-class="bg-gradient-to-r from-purple-600/30 to-purple-700/20 text-white border-l-2 border-purple-500 shadow-lg shadow-purple-500/20"
        >
          <div class="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:rotate-3" style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(126, 34, 206, 0.08) 100%);">
            <svg class="w-5 h-5" style="color: #a78bfa;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span class="font-medium text-sm">Client Segments</span>
        </NuxtLink>

        <!-- Admin Section -->
        <div v-if="authStore.user?.role === 'admin'" class="my-3 border-t border-zinc-700/30 bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent"></div>
        <div v-if="authStore.user?.role === 'admin'" class="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
          <span class="w-1 h-1 rounded-full bg-red-500"></span>
          Admin
        </div>

        <NuxtLink
          v-if="authStore.user?.role === 'admin'"
          to="/users"
          @click="closeSidebar"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-300 hover:text-white transition-all duration-200 group hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5"
          active-class="bg-gradient-to-r from-red-600/30 to-red-700/20 text-white border-l-2 border-red-500 shadow-lg shadow-red-500/20"
        >
          <div class="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:rotate-3" style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.08) 100%);">
            <svg class="w-5 h-5" style="color: #f87171;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <span class="font-medium text-sm">User Management</span>
        </NuxtLink>

        <NuxtLink
          v-if="authStore.user?.role === 'admin'"
          to="/activity-logs"
          @click="closeSidebar"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-300 hover:text-white transition-all duration-200 group hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5"
          active-class="bg-gradient-to-r from-orange-600/30 to-orange-700/20 text-white border-l-2 border-orange-500 shadow-lg shadow-orange-500/20"
        >
          <div class="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:rotate-3" style="background: linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(249, 115, 22, 0.08) 100%);">
            <svg class="w-5 h-5" style="color: #fb923c;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span class="font-medium text-sm">Activity Logs</span>
        </NuxtLink>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const isSidebarOpen = ref(false)

// Open sidebar by default on desktop
onMounted(() => {
  if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
    isSidebarOpen.value = true
  }
  
  // Listen for toggle events
  window.addEventListener('toggle-sidebar', toggleSidebar)
  window.addEventListener('close-sidebar', closeSidebar)
})

onUnmounted(() => {
  window.removeEventListener('toggle-sidebar', toggleSidebar)
  window.removeEventListener('close-sidebar', closeSidebar)
})

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
  console.log('🔄 Sidebar toggled:', isSidebarOpen.value)
}

const closeSidebar = () => {
  // Only auto-close on mobile
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    isSidebarOpen.value = false
    console.log('❌ Sidebar closed (mobile)')
  }
}
</script>

<style scoped>
/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(236, 72, 153, 0.5) 0%, rgba(219, 39, 119, 0.3) 100%);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(236, 72, 153, 0.7) 0%, rgba(219, 39, 119, 0.5) 100%);
}
</style>
