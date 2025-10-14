<template>
  <div v-if="!isReady" class="min-h-screen bg-zinc-950 flex items-center justify-center">
    <div class="text-center">
      <div class="w-8 h-8 border-4 rounded-full animate-spin mx-auto mb-3" style="border-color: #c4a07a; border-top-color: transparent;"></div>
      <p class="text-zinc-400 text-sm">Loading...</p>
    </div>
  </div>

  <div v-else class="min-h-screen bg-zinc-800">
    <AppHeader />
    
    <div class="flex pt-16">
      <AppSidebar />
      
      <main class="flex-1 lg:ml-64 p-4 sm:p-6">
        <div class="w-full max-w-7xl mx-auto space-y-6">
          <!-- Header -->
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold text-zinc-100 mb-1">Activity Logs</h1>
              <p class="text-zinc-400 text-sm">System audit trail and user activity tracking</p>
            </div>
            <button
              @click="fetchLogs"
              class="px-4 py-2 rounded-lg font-medium transition-all"
              style="background: linear-gradient(135deg, #c4a07a 0%, #a67c52 100%); color: #1a1a1a;"
            >
              <span class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </span>
            </button>
          </div>

          <!-- Filters -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-zinc-300 mb-2">Action Type</label>
              <select
                v-model="filters.action"
                @change="fetchLogs"
                class="w-full px-4 py-2 rounded-lg border bg-zinc-900 text-zinc-100"
                style="border-color: rgba(196, 160, 122, 0.3);"
              >
                <option value="">All Actions</option>
                <option value="INSERT">Insert</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-zinc-300 mb-2">Table</label>
              <select
                v-model="filters.table"
                @change="fetchLogs"
                class="w-full px-4 py-2 rounded-lg border bg-zinc-900 text-zinc-100"
                style="border-color: rgba(196, 160, 122, 0.3);"
              >
                <option value="">All Tables</option>
                <option value="events">Events</option>
                <option value="payments">Payments</option>
                <option value="services">Services</option>
                <option value="event_services">Event Services</option>
                <option value="users">Users</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-zinc-300 mb-2">Date Range</label>
              <select
                v-model="filters.days"
                @change="fetchLogs"
                class="w-full px-4 py-2 rounded-lg border bg-zinc-900 text-zinc-100"
                style="border-color: rgba(196, 160, 122, 0.3);"
              >
                <option :value="1">Last 24 Hours</option>
                <option :value="7">Last 7 Days</option>
                <option :value="30">Last 30 Days</option>
                <option :value="90">Last 90 Days</option>
              </select>
            </div>
          </div>

          <!-- Activity Logs Table -->
          <div class="rounded-xl overflow-hidden" style="background: rgba(24, 24, 27, 0.5); border: 1px solid rgba(196, 160, 122, 0.2);">
            <div v-if="loading" class="p-8 text-center">
              <div class="w-8 h-8 border-4 rounded-full animate-spin mx-auto mb-3" style="border-color: #c4a07a; border-top-color: transparent;"></div>
              <p class="text-zinc-400">Loading activity logs...</p>
            </div>

            <div v-else-if="logs.length === 0" class="p-8 text-center">
              <svg class="w-16 h-16 mx-auto mb-3 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p class="text-zinc-400">No activity logs found</p>
            </div>

            <div v-else class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-zinc-900/50 border-b border-zinc-800">
                  <tr>
                    <th class="text-left px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Timestamp</th>
                    <th class="text-left px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">User</th>
                    <th class="text-left px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Action</th>
                    <th class="text-left px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Table</th>
                    <th class="text-left px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Record ID</th>
                    <th class="text-left px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-800">
                  <tr v-for="log in logs" :key="log.log_id" class="hover:bg-zinc-900/30 transition-colors">
                    <td class="px-6 py-4 text-sm text-zinc-300">
                      {{ formatDateTime(log.created_at) }}
                    </td>
                    <td class="px-6 py-4 text-sm text-zinc-300">
                      {{ log.user_name || 'System' }}
                    </td>
                    <td class="px-6 py-4">
                      <span
                        :class="getActionClass(log.action_type)"
                        class="px-3 py-1 text-xs font-medium rounded-full"
                      >
                        {{ log.action_type }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-zinc-300">
                      {{ log.table_name }}
                    </td>
                    <td class="px-6 py-4 text-sm text-zinc-300">
                      {{ log.record_id }}
                    </td>
                    <td class="px-6 py-4 text-sm text-zinc-400">
                      {{ log.description || '-' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Stats Summary -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="rounded-xl p-5" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(21, 128, 61, 0.08) 100%); border: 1px solid rgba(34, 197, 94, 0.3);">
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-xs font-medium mb-2 text-green-400">Total Activities</p>
                  <p class="text-3xl font-bold text-zinc-100">{{ logs.length }}</p>
                </div>
                <div class="p-3 rounded-lg" style="background: rgba(34, 197, 94, 0.2);">
                  <svg class="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div class="rounded-xl p-5" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.08) 100%); border: 1px solid rgba(59, 130, 246, 0.3);">
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-xs font-medium mb-2 text-blue-400">Inserts</p>
                  <p class="text-3xl font-bold text-zinc-100">{{ countByAction('INSERT') }}</p>
                </div>
                <div class="p-3 rounded-lg" style="background: rgba(59, 130, 246, 0.2);">
                  <svg class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
            </div>

            <div class="rounded-xl p-5" style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(126, 34, 206, 0.08) 100%); border: 1px solid rgba(168, 85, 247, 0.3);">
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-xs font-medium mb-2 text-purple-400">Updates</p>
                  <p class="text-3xl font-bold text-zinc-100">{{ countByAction('UPDATE') }}</p>
                </div>
                <div class="p-3 rounded-lg" style="background: rgba(168, 85, 247, 0.2);">
                  <svg class="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const logs = ref<any[]>([])
const loading = ref(false)
const isReady = ref(false)

const filters = ref({
  action: '',
  table: '',
  days: 7
})

const fetchLogs = async () => {
  try {
    loading.value = true
    const params = new URLSearchParams()
    if (filters.value.action) params.append('action', filters.value.action)
    if (filters.value.table) params.append('table', filters.value.table)
    params.append('days', filters.value.days.toString())

    const response = await $fetch<any>(`/api/activity-logs?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    
    logs.value = response.data || []
  } catch (error: any) {
    console.error('Failed to fetch activity logs:', error)
    if (error.statusCode === 401) {
      authStore.logout()
      navigateTo('/auth/login')
    }
  } finally {
    loading.value = false
  }
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getActionClass = (action: string) => {
  const classes = {
    INSERT: 'bg-blue-900/30 text-blue-400 border border-blue-700/50',
    UPDATE: 'bg-purple-900/30 text-purple-400 border border-purple-700/50',
    DELETE: 'bg-red-900/30 text-red-400 border border-red-700/50'
  }
  return classes[action as keyof typeof classes] || 'bg-zinc-900/30 text-zinc-400'
}

const countByAction = (action: string) => {
  return logs.value.filter(log => log.action_type === action).length
}

onMounted(async () => {
  await new Promise(resolve => setTimeout(resolve, 100))
  
  if (!authStore.user) {
    navigateTo('/auth/login')
  } else {
    isReady.value = true
    await fetchLogs()
  }
})
</script>
