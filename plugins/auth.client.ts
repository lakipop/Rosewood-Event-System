// Auth initialization plugin
// This runs before any page loads to restore auth state from sessionStorage
export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  
  console.log('🔌 [Auth Plugin] Running auth plugin...')
  
  // Initialize auth state from sessionStorage immediately
  if (import.meta.client) {
    authStore.initAuth()
    console.log('🔌 [Auth Plugin] Auth initialized, isAuthenticated:', authStore.isAuthenticated)
  }
})
