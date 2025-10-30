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
              <h1 class="text-2xl font-bold text-zinc-100 mb-1">Client Segments</h1>
              <p class="text-zinc-400 text-sm">Customer segmentation and value analysis</p>
            </div>
            <button
              @click="fetchSegments"
              class="px-4 py-2 rounded-lg font-medium transition-all"
              style="background: linear-gradient(135deg, #c4a07a 0%, #a67c52 100%); color: #1a1a1a;"
            >
              <span class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reload
              </span>
            </button>
          </div>

          <!-- Segment Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="segment in segments" :key="segment.segment" 
                 class="rounded-xl p-6 transition-all hover:scale-105"
                 :style="getSegmentStyle(segment.segment)">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-lg font-bold text-zinc-100">{{ segment.segment }}</h3>
                  <p class="text-sm text-zinc-400 mt-1">{{ segment.percentage }}% of clients</p>
                </div>
                <div class="p-3 rounded-lg" :style="getSegmentIconStyle(segment.segment)">
                  <svg class="w-6 h-6" :style="getSegmentIconColor(segment.segment)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>

              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-zinc-400">Clients</span>
                  <span class="text-lg font-bold text-zinc-100">{{ segment.client_count }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-zinc-400">Total Events</span>
                  <span class="text-lg font-bold text-zinc-100">{{ segment.total_events }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-zinc-400">Total Spent</span>
                  <span class="text-lg font-bold text-zinc-100">Rs. {{ formatNumber(segment.total_spent) }}</span>
                </div>
                <div class="flex justify-between items-center pt-3 border-t border-zinc-700">
                  <span class="text-sm text-zinc-400">Avg Value</span>
                  <span class="text-xl font-bold" :style="getSegmentValueColor(segment.segment)">
                    Rs. {{ formatNumber(segment.avg_event_value) }}
                  </span>
                </div>
                <div class="text-xs text-zinc-500 text-center pt-2">
                  Last event: {{ formatDate(segment.last_event_date) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Segment Breakdown Table -->
          <div class="rounded-xl overflow-hidden" style="background: rgba(39, 39, 42, 0.7); border: 1px solid rgba(196, 160, 122, 0.2);">
            <div class="p-6">
              <h2 class="text-lg font-bold text-zinc-100 mb-4">Segment Distribution</h2>
              
              <div v-if="segments.length > 0" class="space-y-4">
                <div v-for="segment in segments" :key="segment.segment">
                  <div class="flex justify-between mb-2">
                    <div class="flex items-center gap-3">
                      <span class="text-sm font-medium text-zinc-100">{{ segment.segment }}</span>
                      <span class="text-xs text-zinc-400">{{ segment.client_count }} clients</span>
                    </div>
                    <span class="text-sm font-semibold text-zinc-100">{{ segment.percentage }}%</span>
                  </div>
                  <div class="bg-zinc-700 rounded-full h-4">
                    <div
                      :class="getSegmentBarClass(segment.segment)"
                      class="h-4 rounded-full transition-all flex items-center justify-end pr-2"
                      :style="{ width: segment.percentage + '%' }"
                    >
                      <span v-if="segment.percentage > 10" class="text-xs font-semibold text-zinc-900">
                        {{ segment.percentage }}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="text-center text-zinc-400 py-8">
                No segment data available
              </div>
            </div>
          </div>

          <!-- Detailed Client Segments Table -->
          <div class="rounded-xl overflow-hidden" style="background: rgba(39, 39, 42, 0.7); border: 1px solid rgba(196, 160, 122, 0.2);">
            <div class="p-6">
              <h2 class="text-lg font-bold text-zinc-100 mb-4">Client Segment Details</h2>
              
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-zinc-700">
                      <th class="text-left py-3 px-4 font-semibold text-zinc-300">Segment</th>
                      <th class="text-right py-3 px-4 font-semibold text-zinc-300">Clients</th>
                      <th class="text-right py-3 px-4 font-semibold text-zinc-300">% Share</th>
                      <th class="text-right py-3 px-4 font-semibold text-zinc-300">Total Events</th>
                      <th class="text-right py-3 px-4 font-semibold text-zinc-300">Avg Events/Client</th>
                      <th class="text-right py-3 px-4 font-semibold text-zinc-300">Total Spent</th>
                      <th class="text-right py-3 px-4 font-semibold text-zinc-300">Avg Event Value</th>
                      <th class="text-right py-3 px-4 font-semibold text-zinc-300">Last Event</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="segment in segments" :key="segment.segment" 
                        class="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                      <td class="py-4 px-4">
                        <div class="flex items-center gap-2">
                          <div class="w-3 h-3 rounded-full" :class="getSegmentDotClass(segment.segment)"></div>
                          <span class="font-medium text-zinc-100">{{ segment.segment }}</span>
                        </div>
                      </td>
                      <td class="text-right py-4 px-4 text-zinc-100 font-medium">
                        {{ segment.client_count }}
                      </td>
                      <td class="text-right py-4 px-4">
                        <span class="px-2 py-1 rounded-full text-xs font-semibold" 
                              :class="getSegmentBadgeClass(segment.segment)">
                          {{ segment.percentage }}%
                        </span>
                      </td>
                      <td class="text-right py-4 px-4 text-zinc-100 font-medium">
                        {{ segment.total_events }}
                      </td>
                      <td class="text-right py-4 px-4 text-zinc-300">
                        {{ (segment.total_events / segment.client_count).toFixed(1) }}
                      </td>
                      <td class="text-right py-4 px-4 text-zinc-100 font-semibold">
                        Rs. {{ formatNumber(segment.total_spent) }}
                      </td>
                      <td class="text-right py-4 px-4 font-semibold" 
                          :style="getSegmentValueColor(segment.segment)">
                        Rs. {{ formatNumber(segment.avg_event_value) }}
                      </td>
                      <td class="text-right py-4 px-4 text-zinc-400 text-xs">
                        {{ formatDate(segment.last_event_date) }}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="border-t-2 border-zinc-700 font-bold">
                      <td class="py-4 px-4 text-zinc-100">TOTAL</td>
                      <td class="text-right py-4 px-4 text-zinc-100">{{ totalClients }}</td>
                      <td class="text-right py-4 px-4 text-zinc-100">100%</td>
                      <td class="text-right py-4 px-4 text-zinc-100">{{ totalEvents }}</td>
                      <td class="text-right py-4 px-4 text-zinc-300">
                        {{ (totalEvents / totalClients).toFixed(1) }}
                      </td>
                      <td class="text-right py-4 px-4 text-zinc-100">
                        Rs. {{ formatNumber(totalRevenue) }}
                      </td>
                      <td class="text-right py-4 px-4" style="color: #c4a07a;">
                        Rs. {{ formatNumber(avgValue) }}
                      </td>
                      <td class="text-right py-4 px-4"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <!-- Summary Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="rounded-xl p-5" style="background: linear-gradient(135deg, rgba(196, 160, 122, 0.15) 0%, rgba(90, 63, 43, 0.08) 100%); border: 1px solid rgba(196, 160, 122, 0.3);">
              <p class="text-xs font-medium mb-1" style="color: #d6b99f;">Total Clients</p>
              <p class="text-2xl font-bold text-zinc-100">{{ totalClients }}</p>
            </div>
            <div class="rounded-xl p-5" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(21, 128, 61, 0.08) 100%); border: 1px solid rgba(34, 197, 94, 0.3);">
              <p class="text-xs font-medium mb-1 text-green-300">Total Events</p>
              <p class="text-2xl font-bold text-zinc-100">{{ totalEvents }}</p>
            </div>
            <div class="rounded-xl p-5" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(29, 78, 216, 0.08) 100%); border: 1px solid rgba(59, 130, 246, 0.3);">
              <p class="text-xs font-medium mb-1 text-blue-300">Total Revenue</p>
              <p class="text-2xl font-bold text-zinc-100">Rs. {{ formatNumber(totalRevenue) }}</p>
            </div>
            <div class="rounded-xl p-5" style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(159, 18, 57, 0.08) 100%); border: 1px solid rgba(236, 72, 153, 0.3);">
              <p class="text-xs font-medium mb-1 text-pink-300">Avg Value</p>
              <p class="text-2xl font-bold text-zinc-100">Rs. {{ formatNumber(avgValue) }}</p>
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
const isReady = ref(false)
const loading = ref(false)
const segments = ref<any[]>([])

// Computed summary stats
const totalClients = computed(() => segments.value.reduce((sum, s) => sum + s.client_count, 0))
const totalEvents = computed(() => segments.value.reduce((sum, s) => sum + s.total_events, 0))
const totalRevenue = computed(() => segments.value.reduce((sum, s) => sum + parseFloat(s.total_spent), 0))
const avgValue = computed(() => totalEvents.value > 0 ? totalRevenue.value / totalEvents.value : 0)

// Fetch segments
const fetchSegments = async () => {
  loading.value = true
  
  try {
    const response = await $fetch<any>('/api/reports/client-segments', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    
    if (response.success) {
      segments.value = response.data
    }
  } catch (err: any) {
    console.error('Failed to fetch client segments:', err)
    if (err.statusCode === 401) {
      navigateTo('/auth/login')
    }
  } finally {
    loading.value = false
  }
}

// Format number
const formatNumber = (num: number) => {
  return num?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'
}

// Format date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// Get segment style
const getSegmentStyle = (segment: string) => {
  const styles: Record<string, string> = {
    'High Value': 'background: linear-gradient(135deg, rgba(196, 160, 122, 0.2) 0%, rgba(90, 63, 43, 0.1) 100%); border: 1px solid rgba(196, 160, 122, 0.4);',
    'Regular': 'background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(29, 78, 216, 0.1) 100%); border: 1px solid rgba(59, 130, 246, 0.4);',
    'New': 'background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(21, 128, 61, 0.1) 100%); border: 1px solid rgba(34, 197, 94, 0.4);'
  }
  return styles[segment] || 'background: rgba(39, 39, 42, 0.7); border: 1px solid rgba(196, 160, 122, 0.2);'
}

// Get segment icon style
const getSegmentIconStyle = (segment: string) => {
  const styles: Record<string, string> = {
    'High Value': 'background: rgba(196, 160, 122, 0.3);',
    'Regular': 'background: rgba(59, 130, 246, 0.3);',
    'New': 'background: rgba(34, 197, 94, 0.3);'
  }
  return styles[segment] || 'background: rgba(100, 100, 100, 0.3);'
}

// Get segment icon color
const getSegmentIconColor = (segment: string) => {
  const colors: Record<string, string> = {
    'High Value': 'color: #c4a07a;',
    'Regular': 'color: #3b82f6;',
    'New': 'color: #22c55e;'
  }
  return colors[segment] || 'color: #71717a;'
}

// Get segment value color
const getSegmentValueColor = (segment: string) => {
  const colors: Record<string, string> = {
    'High Value': 'color: #c4a07a;',
    'Regular': 'color: #3b82f6;',
    'New': 'color: #22c55e;'
  }
  return colors[segment] || 'color: #e4e4e7;'
}

// Get segment bar class
const getSegmentBarClass = (segment: string) => {
  const classes: Record<string, string> = {
    'High Value': 'bg-gradient-to-r from-amber-600 to-amber-500',
    'Regular': 'bg-gradient-to-r from-blue-600 to-blue-500',
    'New': 'bg-gradient-to-r from-green-600 to-green-500'
  }
  return classes[segment] || 'bg-zinc-500'
}

// Get segment dot class for table
const getSegmentDotClass = (segment: string) => {
  const classes: Record<string, string> = {
    'High Value': 'bg-amber-500',
    'Regular': 'bg-blue-500',
    'New': 'bg-green-500'
  }
  return classes[segment] || 'bg-zinc-500'
}

// Get segment badge class for table
const getSegmentBadgeClass = (segment: string) => {
  const classes: Record<string, string> = {
    'High Value': 'bg-amber-500/20 text-amber-400',
    'Regular': 'bg-blue-500/20 text-blue-400',
    'New': 'bg-green-500/20 text-green-400'
  }
  return classes[segment] || 'bg-zinc-500/20 text-zinc-400'
}

onMounted(async () => {
  await new Promise(resolve => setTimeout(resolve, 100))
  
  if (!authStore.user) {
    navigateTo('/auth/login')
  } else {
    isReady.value = true
    await fetchSegments()
  }
})
</script>
