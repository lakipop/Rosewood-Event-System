<template>
  <div v-if="!isReady" class="min-h-screen bg-zinc-950 flex items-center justify-center">
    <div class="text-center">
      <div class="w-8 h-8 border-4 rounded-full animate-spin mx-auto mb-3" style="border-color: #c4a07a; border-top-color: transparent;"></div>
      <p class="text-zinc-400 text-sm">Loading...</p>
    </div>
  </div>

  <div v-else class="min-h-screen bg-zinc-800">
    <AppHeader />
    
    <div class="flex">
      <AppSidebar />
      
      <main class="flex-1 lg:ml-64 p-4 sm:p-6">
        <div class="w-full max-w-7xl mx-auto space-y-6">
          <!-- Header -->
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold text-zinc-100 mb-1">User Management</h1>
              <p class="text-zinc-400 text-sm">Manage system users and access</p>
            </div>
            <button
              @click="showAddModal = true"
              class="px-4 py-2 rounded-lg font-medium transition-all"
              style="background: linear-gradient(135deg, #c4a07a 0%, #a67c52 100%); color: #1a1a1a;"
            >
              <span class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add User
              </span>
            </button>
          </div>

          <!-- Filters -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-zinc-300 mb-2">Role</label>
              <select
                v-model="filters.role"
                @change="fetchUsers"
                class="w-full px-4 py-2 rounded-lg border bg-zinc-900 text-zinc-100"
                style="border-color: rgba(196, 160, 122, 0.3);"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="client">Client</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-zinc-300 mb-2">Status</label>
              <select
                v-model="filters.status"
                @change="fetchUsers"
                class="w-full px-4 py-2 rounded-lg border bg-zinc-900 text-zinc-100"
                style="border-color: rgba(196, 160, 122, 0.3);"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-zinc-300 mb-2">Search</label>
              <input
                v-model="filters.search"
                @input="fetchUsers"
                type="text"
                placeholder="Search by name or email..."
                class="w-full px-4 py-2 rounded-lg border bg-zinc-900 text-zinc-100"
                style="border-color: rgba(196, 160, 122, 0.3);"
              />
            </div>
          </div>

          <!-- Role Stats -->
          <div v-if="roleStats" class="grid grid-cols-3 gap-4">
            <div class="rounded-xl p-5" style="background: linear-gradient(135deg, rgba(196, 160, 122, 0.15) 0%, rgba(90, 63, 43, 0.08) 100%); border: 1px solid rgba(196, 160, 122, 0.3);">
              <p class="text-xs font-medium mb-1" style="color: #d6b99f;">Admins</p>
              <p class="text-2xl font-bold text-zinc-100">{{ roleStats.admin || 0 }}</p>
            </div>
            <div class="rounded-xl p-5" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(29, 78, 216, 0.08) 100%); border: 1px solid rgba(59, 130, 246, 0.3);">
              <p class="text-xs font-medium mb-1 text-blue-300">Managers</p>
              <p class="text-2xl font-bold text-zinc-100">{{ roleStats.manager || 0 }}</p>
            </div>
            <div class="rounded-xl p-5" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(21, 128, 61, 0.08) 100%); border: 1px solid rgba(34, 197, 94, 0.3);">
              <p class="text-xs font-medium mb-1 text-green-300">Clients</p>
              <p class="text-2xl font-bold text-zinc-100">{{ roleStats.client || 0 }}</p>
            </div>
          </div>

          <!-- Users Table -->
          <div class="rounded-xl overflow-hidden" style="background: rgba(39, 39, 42, 0.7); border: 1px solid rgba(196, 160, 122, 0.2);">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead style="background: rgba(196, 160, 122, 0.1);">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">User</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Contact</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Role</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-700">
                  <tr v-for="user in users" :key="user.user_id" class="hover:bg-zinc-700/50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-zinc-100">{{ user.full_name }}</div>
                      <div class="text-xs text-zinc-400">ID: {{ user.user_id }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-zinc-300">{{ user.email }}</div>
                      <div class="text-xs text-zinc-400">{{ user.phone || 'N/A' }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="getRoleBadgeClass(user.role)" class="px-2 py-1 text-xs rounded-full font-medium">
                        {{ user.role }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="getStatusBadgeClass(user.status)" class="px-2 py-1 text-xs rounded-full font-medium">
                        {{ user.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        @click="editUser(user)"
                        class="text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </button>
                      <button
                        @click="deleteUser(user)"
                        class="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  <tr v-if="loading">
                    <td colspan="5" class="px-6 py-8 text-center text-zinc-400">
                      <div class="flex justify-center">
                        <div class="w-6 h-6 border-4 rounded-full animate-spin" style="border-color: #c4a07a; border-top-color: transparent;"></div>
                      </div>
                    </td>
                  </tr>
                  <tr v-else-if="users.length === 0">
                    <td colspan="5" class="px-6 py-8 text-center text-zinc-400">
                      No users found
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Add/Edit User Modal -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div class="bg-zinc-900 rounded-xl max-w-md w-full p-6" style="border: 1px solid rgba(196, 160, 122, 0.3);">
        <h2 class="text-xl font-bold text-zinc-100 mb-4">{{ showEditModal ? 'Edit User' : 'Add New User' }}</h2>
        
        <form @submit.prevent="showEditModal ? updateUser() : createUser()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">Full Name</label>
            <input
              v-model="formData.full_name"
              type="text"
              required
              class="w-full px-4 py-2 rounded-lg border bg-zinc-800 text-zinc-100"
              style="border-color: rgba(196, 160, 122, 0.3);"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">Email</label>
            <input
              v-model="formData.email"
              type="email"
              required
              class="w-full px-4 py-2 rounded-lg border bg-zinc-800 text-zinc-100"
              style="border-color: rgba(196, 160, 122, 0.3);"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">Phone</label>
            <input
              v-model="formData.phone"
              type="tel"
              class="w-full px-4 py-2 rounded-lg border bg-zinc-800 text-zinc-100"
              style="border-color: rgba(196, 160, 122, 0.3);"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">Password {{ showEditModal ? '(leave blank to keep current)' : '' }}</label>
            <input
              v-model="formData.password"
              type="password"
              :required="!showEditModal"
              class="w-full px-4 py-2 rounded-lg border bg-zinc-800 text-zinc-100"
              style="border-color: rgba(196, 160, 122, 0.3);"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">Role</label>
            <select
              v-model="formData.role"
              required
              class="w-full px-4 py-2 rounded-lg border bg-zinc-800 text-zinc-100"
              style="border-color: rgba(196, 160, 122, 0.3);"
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="client">Client</option>
            </select>
          </div>

          <div v-if="showEditModal">
            <label class="block text-sm font-medium text-zinc-300 mb-2">Status</label>
            <select
              v-model="formData.status"
              required
              class="w-full px-4 py-2 rounded-lg border bg-zinc-800 text-zinc-100"
              style="border-color: rgba(196, 160, 122, 0.3);"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div v-if="error" class="p-3 rounded-lg bg-red-500/20 border border-red-500/50">
            <p class="text-red-400 text-sm">{{ error }}</p>
          </div>

          <div class="flex gap-3">
            <button
              type="submit"
              :disabled="saving"
              class="flex-1 px-4 py-2 rounded-lg font-medium transition-all"
              style="background: linear-gradient(135deg, #c4a07a 0%, #a67c52 100%); color: #1a1a1a;"
            >
              {{ saving ? 'Saving...' : (showEditModal ? 'Update' : 'Create') }}
            </button>
            <button
              type="button"
              @click="closeModal"
              class="flex-1 px-4 py-2 rounded-lg font-medium bg-zinc-700 text-zinc-100 hover:bg-zinc-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const isReady = ref(false)
const loading = ref(false)
const saving = ref(false)
const error = ref('')

const users = ref<any[]>([])
const roleStats = ref<any>(null)
const filters = ref({
  role: '',
  status: '',
  search: ''
})

const showAddModal = ref(false)
const showEditModal = ref(false)
const formData = ref({
  user_id: null,
  full_name: '',
  email: '',
  phone: '',
  password: '',
  role: 'client',
  status: 'active'
})

// Fetch users
const fetchUsers = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const query = new URLSearchParams()
    if (filters.value.role) query.append('role', filters.value.role)
    if (filters.value.status) query.append('status', filters.value.status)
    if (filters.value.search) query.append('search', filters.value.search)

    const response = await $fetch<any>(`/api/users?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    
    if (response.success) {
      users.value = response.data || []
      
      // Transform roleCounts array to object
      const countsObj: any = {}
      response.roleCounts.forEach((rc: any) => {
        countsObj[rc.role] = rc.count
      })
      roleStats.value = countsObj
    }
  } catch (err: any) {
    console.error('Failed to fetch users:', err)
    if (err.statusCode === 401) {
      navigateTo('/auth/login')
    }
  } finally {
    loading.value = false
  }
}

// Create user
const createUser = async () => {
  saving.value = true
  error.value = ''
  
  try {
    const response = await $fetch<any>('/api/users', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      body: {
        full_name: formData.value.full_name,
        email: formData.value.email,
        phone: formData.value.phone,
        password: formData.value.password,
        role: formData.value.role
      }
    })
    
    if (response.success) {
      closeModal()
      await fetchUsers()
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to create user'
  } finally {
    saving.value = false
  }
}

// Edit user
const editUser = (user: any) => {
  formData.value = {
    user_id: user.user_id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone || '',
    password: '',
    role: user.role,
    status: user.status
  }
  showEditModal.value = true
}

// Update user
const updateUser = async () => {
  saving.value = true
  error.value = ''
  
  try {
    const body: any = {
      full_name: formData.value.full_name,
      phone: formData.value.phone,
      role: formData.value.role,
      status: formData.value.status
    }
    
    if (formData.value.password) {
      body.password = formData.value.password
    }

    const response = await $fetch<any>(`/api/users/${formData.value.user_id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      body
    })
    
    if (response.success) {
      closeModal()
      await fetchUsers()
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to update user'
  } finally {
    saving.value = false
  }
}

// Delete user
const deleteUser = async (user: any) => {
  if (!confirm(`Are you sure you want to delete ${user.full_name}?`)) {
    return
  }
  
  try {
    await $fetch(`/api/users/${user.user_id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    
    await fetchUsers()
  } catch (err: any) {
    alert(err.data?.message || 'Failed to delete user')
  }
}

// Close modal
const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  formData.value = {
    user_id: null,
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'client',
    status: 'active'
  }
  error.value = ''
}

// Get role badge class
const getRoleBadgeClass = (role: string) => {
  const classes: Record<string, string> = {
    'admin': 'bg-purple-500/20 text-purple-300',
    'manager': 'bg-blue-500/20 text-blue-300',
    'client': 'bg-green-500/20 text-green-300'
  }
  return classes[role] || 'bg-gray-500/20 text-gray-300'
}

// Get status badge class
const getStatusBadgeClass = (status: string) => {
  return status === 'active' 
    ? 'bg-green-500/20 text-green-300'
    : 'bg-red-500/20 text-red-300'
}

onMounted(async () => {
  await new Promise(resolve => setTimeout(resolve, 100))
  
  if (!authStore.user) {
    navigateTo('/auth/login')
  } else if (authStore.user.role !== 'admin') {
    navigateTo('/')
  } else {
    isReady.value = true
    await fetchUsers()
  }
})
</script>
