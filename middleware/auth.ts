export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();
  
  // Initialize auth from sessionStorage if not already done
  if (!authStore.isAuthenticated && import.meta.client) {
    authStore.initAuth();
  }
  
  // Check if user is authenticated
  if (!authStore.isAuthenticated || !authStore.user || !authStore.token) {
    // Redirect to login page
    return navigateTo('/auth/login');
  }
});
