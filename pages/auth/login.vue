<template>
  <div class="bg-zinc-800 rounded-xl shadow-2xl p-8 border border-zinc-900">
    <div class="text-center mb-8">
      <div class="text-secondary-400 text-5xl mx-auto mb-3">🌲</div>
      <h2 class="text-2xl font-bold text-zinc-100">Welcome Back</h2>
      <p class="text-zinc-400 text-sm mt-1">Sign in to Rosewood Events</p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-zinc-300 mb-2">Email</label>
        <input
          v-model="email"
          type="email"
          placeholder="your@email.com"
          class="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-zinc-300 mb-2">Password</label>
        <input
          v-model="password"
          type="password"
          placeholder="••••••••"
          class="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required
        />
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="!loading">Sign In</span>
        <span v-else>Signing in...</span>
      </button>

      <div class="text-center text-sm text-zinc-400">
        Don't have an account?
        <NuxtLink to="/auth/register" class="text-primary-400 hover:text-primary-300 font-medium">
          Register
        </NuxtLink>
      </div>
    </form>

    <div v-if="error" class="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
      {{ error }}
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
