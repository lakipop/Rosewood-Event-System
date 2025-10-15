export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();
  
  console.log('🛡️ [Auth Middleware] Checking auth for:', to.path)
  console.log('🛡️ [Auth Middleware] isAuthenticated:', authStore.isAuthenticated)
  console.log('🛡️ [Auth Middleware] User:', authStore.user?.email)
  
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    console.log('❌ [Auth Middleware] Not authenticated, redirecting to login')
    return navigateTo('/auth/login');
  }
  
  console.log('✅ [Auth Middleware] Authenticated, allowing access')
});
