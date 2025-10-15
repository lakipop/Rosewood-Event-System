// Auth initialization plugin - runs on client only
// This restores auth state from sessionStorage before routes are resolved
import type { Pinia } from 'pinia'

export default defineNuxtPlugin((nuxtApp) => {
  console.log('🔌 [Auth Plugin] Starting...')
  
  // Access Pinia through nuxtApp to avoid "getActivePinia" error
  const pinia = nuxtApp.$pinia as Pinia
  const authStore = useAuthStore(pinia)
  
  console.log('🔌 [Auth Plugin] Pinia instance:', !!pinia)
  console.log('🔌 [Auth Plugin] Auth store:', !!authStore)
  
  // Initialize auth state from sessionStorage
  if (import.meta.client) {
    console.log('🔌 [Auth Plugin] Calling initAuth()...')
    authStore.initAuth()
    
    console.log('🔌 [Auth Plugin] After initAuth():')
    console.log('  - isAuthenticated:', authStore.isAuthenticated)
    console.log('  - User:', authStore.user?.email || 'null')
    console.log('  - Token:', authStore.token ? 'exists' : 'missing')
  } else {
    console.log('🔌 [Auth Plugin] Skipping - not client-side')
  }
})
