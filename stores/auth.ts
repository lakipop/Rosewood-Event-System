import { defineStore } from 'pinia'

interface User {
  userId: number
  email: string
  fullName: string
  role: string
  status: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    isAuthenticated: false
  }),

  actions: {
    async login(email: string, password: string) {
      try {
        const response: any = await $fetch('/api/auth/login', {
          method: 'POST',
          body: { email, password }
        })

        this.token = response.token
        this.user = response.user
        this.isAuthenticated = true

        // Store token in sessionStorage
        if (import.meta.client) {
          sessionStorage.setItem('auth_token', response.token)
          sessionStorage.setItem('user', JSON.stringify(response.user))
        }

        return { success: true }
      } catch (error: any) {
        console.error('Login failed:', error)
        return {
          success: false,
          message: error.data?.message || 'Login failed'
        }
      }
    },

    async register(email: string, password: string, fullName: string, phone?: string) {
      try {
        const response: any = await $fetch('/api/auth/register', {
          method: 'POST',
          body: { email, password, fullName, phone }
        })

        this.token = response.token
        this.user = response.user
        this.isAuthenticated = true

        // Store token in sessionStorage
        if (import.meta.client) {
          sessionStorage.setItem('auth_token', response.token)
          sessionStorage.setItem('user', JSON.stringify(response.user))
        }

        return { success: true }
      } catch (error: any) {
        console.error('Registration failed:', error)
        return {
          success: false,
          message: error.data?.message || 'Registration failed'
        }
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false

      if (import.meta.client) {
        sessionStorage.removeItem('auth_token')
        sessionStorage.removeItem('user')
      }
    },

    initAuth() {
      if (import.meta.client) {
        console.log('🔍 [Auth] Initializing auth from sessionStorage...')
        const token = sessionStorage.getItem('auth_token')
        const userStr = sessionStorage.getItem('user')

        console.log('🔍 [Auth] Token exists:', !!token)
        console.log('🔍 [Auth] User exists:', !!userStr)

        if (token && userStr) {
          try {
            this.token = token
            this.user = JSON.parse(userStr)
            this.isAuthenticated = true
            console.log('✅ [Auth] Auth restored successfully:', this.user?.email)
          } catch (error) {
            console.error('❌ [Auth] Failed to parse user data:', error)
            this.logout()
          }
        } else {
          console.log('⚠️ [Auth] No stored auth data found')
        }
      }
    }
  },

  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    isManager: (state) => state.user?.role === 'manager',
    isClient: (state) => state.user?.role === 'client',
    getAuthToken: (state) => state.token
  }
})
