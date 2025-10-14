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
              <h1 class="text-2xl font-bold text-zinc-100 mb-1">Revenue Trends</h1>
              <p class="text-zinc-400 text-sm">Monthly revenue analysis and growth rates</p>
            </div>
            <button
              @click="fetchTrends"
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

          <!-- Filter -->
          <div class="max-w-xs">
            <label class="block text-sm font-medium text-zinc-300 mb-2">Time Period</label>
            <select
              v-model="months"
              @change="fetchTrends"
              class="w-full px-4 py-2 rounded-lg border bg-zinc-900 text-zinc-100"
              style="border-color: rgba(196, 160, 122, 0.3);"
            >
              <option :value="6">Last 6 Months</option>
              <option :value="12">Last 12 Months</option>
              <option :value="24">Last 24 Months</option>
            </select>
          </div>

          <!-- Summary Cards -->
          <div v-if="summary" class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="rounded-xl p-5" style="background: linear-gradient(135deg, rgba(196, 160, 122, 0.15) 0%, rgba(90, 63, 43, 0.08) 100%); border: 1px solid rgba(196, 160, 122, 0.3);">
              <p class="text-xs font-medium mb-1" style="color: #d6b99f;">Total Revenue</p>
              <p class="text-2xl font-bold text-zinc-100">Rs. {{ formatNumber(summary.totalRevenue) }}</p>
            </div>
            <div class="rounded-xl p-5" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(21, 128, 61, 0.08) 100%); border: 1px solid rgba(34, 197, 94, 0.3);">
              <p class="text-xs font-medium mb-1 text-green-300">Total Events</p>
              <p class="text-2xl font-bold text-zinc-100">{{ summary.totalEvents }}</p>
            </div>
            <div class="rounded-xl p-5" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(29, 78, 216, 0.08) 100%); border: 1px solid rgba(59, 130, 246, 0.3);">
              <p class="text-xs font-medium mb-1 text-blue-300">Avg per Event</p>
              <p class="text-2xl font-bold text-zinc-100">Rs. {{ formatNumber(summary.avgEventRevenue) }}</p>
            </div>
            <div class="rounded-xl p-5" style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(159, 18, 57, 0.08) 100%); border: 1px solid rgba(236, 72, 153, 0.3);">
              <p class="text-xs font-medium mb-1 text-pink-300">Avg Growth Rate</p>
              <p class="text-2xl font-bold text-zinc-100">{{ summary.avgGrowth }}%</p>
            </div>
          </div>

          <!-- Trends Table -->
          <div class="rounded-xl overflow-hidden" style="background: rgba(39, 39, 42, 0.7); border: 1px solid rgba(196, 160, 122, 0.2);">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead style="background: rgba(196, 160, 122, 0.1);">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Period</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-zinc-300 uppercase tracking-wider">Revenue</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-zinc-300 uppercase tracking-wider">Events</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-zinc-300 uppercase tracking-wider">Avg/Event</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-zinc-300 uppercase tracking-wider">Growth</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-700">
                  <tr v-for="trend in trends" :key="`${trend.year}-${trend.month}`" class="hover:bg-zinc-700/50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-zinc-100">{{ trend.month_name }} {{ trend.year }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">
                      <div class="text-sm font-semibold text-zinc-100">Rs. {{ formatNumber(trend.total_revenue) }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">
                      <div class="text-sm text-zinc-300">{{ trend.total_events }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">
                      <div class="text-sm text-zinc-300">Rs. {{ formatNumber(trend.avg_event_revenue) }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">
                      <span v-if="trend.growth_rate !== 0" :class="getGrowthClass(trend.growth_rate)" class="px-2 py-1 text-xs rounded-full font-medium inline-flex items-center gap-1">
                        <svg v-if="trend.growth_rate > 0" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                        </svg>
                        <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                        {{ Math.abs(trend.growth_rate) }}%
                      </span>
                      <span v-else class="text-zinc-500 text-sm">-</span>
                    </td>
                  </tr>
                  <tr v-if="loading">
                    <td colspan="5" class="px-6 py-8 text-center text-zinc-400">
                      <div class="flex justify-center">
                        <div class="w-6 h-6 border-4 rounded-full animate-spin" style="border-color: #c4a07a; border-top-color: transparent;"></div>
                      </div>
                    </td>
                  </tr>
                  <tr v-else-if="trends.length === 0">
                    <td colspan="5" class="px-6 py-8 text-center text-zinc-400">
                      No revenue data available
                    </td>
                  </tr>
                </tbody>
              </table>
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
const trends = ref<any[]>([])
const months = ref(12)
const summary = ref<any>(null)

// Fetch trends
const fetchTrends = async () => {
  loading.value = true
  
  try {
    const response = await $fetch<any>(`/api/reports/revenue-trends?months=${months.value}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    
    if (response.success) {
      // Transform data: month is "YYYY-MM" format
      trends.value = response.data.map((item: any) => {
        const [year, month] = item.month.split('-')
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        return {
          month: parseInt(month),
          year: parseInt(year),
          month_name: monthNames[parseInt(month) - 1],
          total_revenue: parseFloat(item.total_revenue),
          total_events: item.total_events,
          avg_event_revenue: parseFloat(item.avg_event_revenue),
          growth_rate: parseFloat(item.growth_rate) || 0
        }
      })
      calculateSummary()
    }
  } catch (err: any) {
    console.error('Failed to fetch revenue trends:', err)
    if (err.statusCode === 401) {
      navigateTo('/auth/login')
    }
  } finally {
    loading.value = false
  }
}

// Calculate summary stats
const calculateSummary = () => {
  if (trends.value.length === 0) {
    summary.value = null
    return
  }

  const totalRevenue = trends.value.reduce((sum, t) => sum + parseFloat(t.total_revenue), 0)
  const totalEvents = trends.value.reduce((sum, t) => sum + t.total_events, 0)
  const avgEventRevenue = totalEvents > 0 ? totalRevenue / totalEvents : 0
  
  // Calculate average growth rate (excluding first month which has 0 growth)
  const growthRates = trends.value.filter(t => t.growth_rate !== 0).map(t => t.growth_rate)
  const avgGrowth = growthRates.length > 0
    ? (growthRates.reduce((sum, g) => sum + g, 0) / growthRates.length).toFixed(1)
    : '0.0'

  summary.value = {
    totalRevenue,
    totalEvents,
    avgEventRevenue,
    avgGrowth
  }
}

// Format number
const formatNumber = (num: number) => {
  return num?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'
}

// Get growth class
const getGrowthClass = (growth: number) => {
  return growth > 0 
    ? 'bg-green-500/20 text-green-300'
    : 'bg-red-500/20 text-red-300'
}

onMounted(async () => {
  await new Promise(resolve => setTimeout(resolve, 100))
  
  if (!authStore.user) {
    navigateTo('/auth/login')
  } else {
    isReady.value = true
    await fetchTrends()
  }
})
</script>
