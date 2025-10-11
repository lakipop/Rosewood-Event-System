<template>
  <div class="bg-zinc-900 rounded-xl shadow-2xl p-8 border border-zinc-800">
    <div class="text-center mb-8">
      <div class="text-secondary-400 text-5xl mx-auto mb-3">🌲</div>
      <h2 class="text-2xl font-bold text-zinc-100">Create Account</h2>
      <p class="text-zinc-400 text-sm mt-1">Join Rosewood Events</p>
    </div>

    <form @submit.prevent="handleRegister" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-zinc-300 mb-2">Full Name</label>
        <input
          v-model="fullName"
          type="text"
          placeholder="John Doe"
          class="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required
        />
      </div>

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
        <label class="block text-sm font-medium text-zinc-300 mb-2">Phone (Optional)</label>
        <input
          v-model="phone"
          type="tel"
          placeholder="+1 234 567 8900"
          class="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
        <span v-if="!loading">Create Account</span>
        <span v-else>Creating Account...</span>
      </button>

      <div class="text-center text-sm text-zinc-400">
        Already have an account?
        <NuxtLink to="/auth/login" class="text-primary-400 hover:text-primary-300 font-medium">
          Sign In
        </NuxtLink>
      </div>
    </form>

    <div v-if="error" class="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
      {{ error }}
    </div>
    <div v-if="success" class="mt-4 p-3 bg-green-900/20 border border-green-800 rounded-lg text-green-400 text-sm">
      {{ success }}
    </div>
  </div>
</template>

<script setup lang="ts">
const fullName = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

definePageMeta({
  layout: 'auth'
})

const authStore = useAuthStore()
const router = useRouter()

const handleRegister = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const result = await authStore.register(
      email.value,
      password.value,
      fullName.value,
      phone.value || undefined
    )

    if (result.success) {
      success.value = 'Registration successful! Redirecting...'
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } else {
      error.value = result.message || 'Registration failed'
    }
  } catch (e: any) {
    error.value = e.message || 'An error occurred'
  } finally {
    loading.value = false
  }
}
</script>
