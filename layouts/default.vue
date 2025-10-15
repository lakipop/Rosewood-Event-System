<template>
  <div class="min-h-screen bg-zinc-950">
    <AppHeader @toggle-sidebar="toggleSidebar" />
    
    <div class="flex">
      <AppSidebar 
        v-if="authStore.isAuthenticated" 
        :is-open="isSidebarOpen"
        @close="closeSidebar"
      />
      
      <main 
        class="flex-1 pt-16 transition-all duration-300 "
        :class="authStore.isAuthenticated && isSidebarOpen ? 'lg:ml-64' : ''"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const isSidebarOpen = ref(false)

// Open sidebar by default on desktop
onMounted(() => {
  if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
    isSidebarOpen.value = true
  }
})

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

// Close sidebar on route change (mobile only)
const router = useRouter()
router.afterEach(() => {
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    isSidebarOpen.value = false
  }
})
</script>
