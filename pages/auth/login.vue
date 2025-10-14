<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 relative overflow-hidden">
    <!-- Animated Background Effects -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-20 left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-20 right-20 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-3xl"></div>
    </div>

    <!-- Login Card with Glass Morphism -->
    <div class="relative w-full max-w-md">
      <div class="backdrop-blur-2xl bg-gradient-to-br from-zinc-900/80 via-zinc-900/70 to-zinc-950/80 rounded-2xl shadow-2xl border border-zinc-800/50 p-8 relative overflow-hidden">
        <!-- Glass Shine Effect -->
        <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
        
        <!-- Content -->
        <div class="relative z-10">
          <!-- Logo & Header -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 backdrop-blur-xl border border-primary-500/30 mb-4 shadow-lg shadow-primary-500/20 animate-pulse">
              <span class="text-5xl">🌲</span>
            </div>
            <h2 class="text-3xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-300 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p class="text-zinc-400 text-sm mt-2">Sign in to Rosewood Events</p>
          </div>

          <!-- Login Form -->
          <form @submit.prevent="handleLogin" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-zinc-300 mb-2">Email</label>
              <input
                v-model="email"
                type="email"
                placeholder="your@email.com"
                class="w-full px-4 py-3 bg-zinc-900/50 backdrop-blur-xl border border-zinc-700/50 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200 hover:border-zinc-600"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-zinc-300 mb-2">Password</label>
              <input
                v-model="password"
                type="password"
                placeholder="••••••••"
                class="w-full px-4 py-3 bg-zinc-900/50 backdrop-blur-xl border border-zinc-700/50 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200 hover:border-zinc-600"
                required
              />
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-gradient-to-r from-zinc-800 via-rose-800/80 to-zinc-800 hover:from-zinc-700 hover:to-primary-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span v-if="!loading" class="flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In
              </span>
              <span v-else class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            </button>

            <!-- Register Link -->
            <div class="text-center text-sm text-zinc-400 pt-2">
              Don't have an account?
              <NuxtLink 
                to="/auth/register" 
                class="text-primary-400 hover:text-primary-300 font-medium transition-colors duration-200 hover:underline"
              >
                Register
              </NuxtLink>
            </div>
          </form>

          <!-- Error Message -->
          <div v-if="error" class="mt-6 p-4 bg-red-900/30 backdrop-blur-xl border border-red-800/50 rounded-xl text-red-400 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ error }}</span>
          </div>
        </div>
      </div>

      <!-- Decorative Elements -->
      <div class="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full blur-2xl -z-10"></div>
      <div class="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-secondary-500/20 to-primary-500/20 rounded-full blur-2xl -z-10"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

definePageMeta({
  layout: 'auth'
})

const authStore = useAuthStore()
const router = useRouter()

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    const result = await authStore.login(email.value, password.value)

    if (result.success) {
      await router.push('/')
    } else {
      error.value = result.message || 'Login failed'
    }
  } catch (e: any) {
    error.value = e.message || 'An error occurred'
  } finally {
    loading.value = false
  }
}
</script>
