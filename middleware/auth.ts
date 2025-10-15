export default defineNuxtRouteMiddleware((to, from) => {
  // Skip middleware on server-side rendering
  if (import.meta.server) {
    console.log('🛡️ [Auth Middleware] Skipping on server-side')
    return
  }

  const authStore = useAuthStore();
  
  console.log('🛡️ [Auth Middleware] Checking auth for:', to.path)
  console.log('🛡️ [Auth Middleware] isAuthenticated:', authStore.isAuthenticated)
  console.log('🛡️ [Auth Middleware] User:', authStore.user?.email)
  console.log('🛡️ [Auth Middleware] Token:', authStore.token ? 'exists' : 'missing')
  
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    console.log('❌ [Auth Middleware] Not authenticated, redirecting to login')
    return navigateTo('/auth/login');
  }
  
  console.log('✅ [Auth Middleware] Authenticated, allowing access')
});
