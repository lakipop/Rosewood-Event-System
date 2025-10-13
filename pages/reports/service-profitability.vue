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
              <h1 class="text-2xl font-bold text-zinc-100 mb-1">Service Profitability</h1>
              <p class="text-zinc-400 text-sm">Revenue, cost, and profit analysis by service</p>
            </div>
            <button
              @click="fetchProfitability"
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

          <!-- Summary Cards -->
          <div v-if="summary" class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="rounded-xl p-5" style="background: linear-gradient(135deg, rgba(196, 160, 122, 0.15) 0%, rgba(90, 63, 43, 0.08) 100%); border: 1px solid rgba(196, 160, 122, 0.3);">
              <p class="text-xs font-medium mb-1" style="color: #d6b99f;">Total Revenue</p>
              <p class="text-2xl font-bold text-zinc-100">Rs. {{ formatNumber(summary.totalRevenue) }}</p>
            </div>
            <div class="rounded-xl p-5" style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(153, 27, 27, 0.08) 100%); border: 1px solid rgba(239, 68, 68, 0.3);">
              <p class="text-xs font-medium mb-1 text-red-300">Total Cost</p>
              <p class="text-2xl font-bold text-zinc-100">Rs. {{ formatNumber(summary.totalCost) }}</p>
            </div>
            <div class="rounded-xl p-5" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(21, 128, 61, 0.08) 100%); border: 1px solid rgba(34, 197, 94, 0.3);">
              <p class="text-xs font-medium mb-1 text-green-300">Total Profit</p>
              <p class="text-2xl font-bold text-zinc-100">Rs. {{ formatNumber(summary.totalProfit) }}</p>
            </div>
            <div class="rounded-xl p-5" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(29, 78, 216, 0.08) 100%); border: 1px solid rgba(59, 130, 246, 0.3);">
              <p class="text-xs font-medium mb-1 text-blue-300">Avg Margin</p>
              <p class="text-2xl font-bold text-zinc-100">{{ summary.avgMargin }}%</p>
            </div>
          </div>

          <!-- Profitability Table -->
          <div class="rounded-xl overflow-hidden" style="background: rgba(39, 39, 42, 0.7); border: 1px solid rgba(196, 160, 122, 0.2);">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead style="background: rgba(196, 160, 122, 0.1);">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Service</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-zinc-300 uppercase tracking-wider">Bookings</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-zinc-300 uppercase tracking-wider">Revenue</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-zinc-300 uppercase tracking-wider">Est. Cost</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-zinc-300 uppercase tracking-wider">Est. Profit</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-zinc-300 uppercase tracking-wider">Margin %</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-700">
                  <tr v-for="service in services" :key="service.service_name" class="hover:bg-zinc-700/50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-zinc-100">{{ service.service_name }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">
                      <div class="text-sm text-zinc-300">{{ service.total_bookings }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">
                      <div class="text-sm font-semibold text-zinc-100">Rs. {{ formatNumber(service.total_revenue) }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">
                      <div class="text-sm text-red-300">Rs. {{ formatNumber(service.estimated_cost) }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">
                      <div class="text-sm text-green-300">Rs. {{ formatNumber(service.estimated_profit) }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">
                      <div class="flex items-center justify-end gap-2">
                        <span :class="getMarginClass(service.profit_margin_pct)" class="px-2 py-1 text-xs rounded-full font-medium">
                          {{ service.profit_margin_pct }}%
                        </span>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="loading">
                    <td colspan="6" class="px-6 py-8 text-center text-zinc-400">
                      <div class="flex justify-center">
                        <div class="w-6 h-6 border-4 rounded-full animate-spin" style="border-color: #c4a07a; border-top-color: transparent;"></div>
                      </div>
                    </td>
                  </tr>
                  <tr v-else-if="services.length === 0">
                    <td colspan="6" class="px-6 py-8 text-center text-zinc-400">
                      No service data available
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Profitability Chart -->
          <div class="rounded-xl p-6" style="background: rgba(39, 39, 42, 0.7); border: 1px solid rgba(196, 160, 122, 0.2);">
            <h2 class="text-lg font-bold text-zinc-100 mb-4">Profit Margin Comparison</h2>
            <div v-if="services.length > 0" class="space-y-4">
              <div v-for="service in services" :key="service.service_name">
                <div class="flex justify-between mb-1">
                  <span class="text-sm text-zinc-300">{{ service.service_name }}</span>
                  <span class="text-sm font-semibold text-zinc-100">{{ service.profit_margin_pct }}%</span>
                </div>
                <div class="bg-zinc-700 rounded-full h-3">
                  <div
                    :class="getMarginBarClass(service.profit_margin_pct)"
                    class="h-3 rounded-full transition-all"
                    :style="{ width: Math.min(service.profit_margin_pct, 100) + '%' }"
                  ></div>
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
const isReady = ref(false)
const loading = ref(false)
const services = ref<any[]>([])
const summary = ref<any>(null)

// Fetch profitability data
const fetchProfitability = async () => {
  loading.value = true
  
  try {
    const response = await $fetch<any>('/api/reports/service-profitability', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    
    if (response.success) {
      services.value = response.data
      calculateSummary()
    }
  } catch (err: any) {
    console.error('Failed to fetch service profitability:', err)
    if (err.statusCode === 401) {
      navigateTo('/auth/login')
    }
  } finally {
    loading.value = false
  }
}

// Calculate summary stats
const calculateSummary = () => {
  if (services.value.length === 0) {
    summary.value = null
    return
  }

  const totalRevenue = services.value.reduce((sum, s) => sum + parseFloat(s.total_revenue), 0)
  const totalCost = services.value.reduce((sum, s) => sum + parseFloat(s.estimated_cost), 0)
  const totalProfit = services.value.reduce((sum, s) => sum + parseFloat(s.estimated_profit), 0)
  const avgMargin = services.value.length > 0
    ? (services.value.reduce((sum, s) => sum + parseFloat(s.profit_margin_pct), 0) / services.value.length).toFixed(1)
    : '0.0'

  summary.value = {
    totalRevenue,
    totalCost,
    totalProfit,
    avgMargin
  }
}

// Format number
const formatNumber = (num: number) => {
  return num?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'
}

// Get margin class
const getMarginClass = (margin: number) => {
  if (margin >= 50) return 'bg-green-500/20 text-green-300'
  if (margin >= 30) return 'bg-blue-500/20 text-blue-300'
  if (margin >= 15) return 'bg-yellow-500/20 text-yellow-300'
  return 'bg-red-500/20 text-red-300'
}

// Get margin bar class
const getMarginBarClass = (margin: number) => {
  if (margin >= 50) return 'bg-green-500'
  if (margin >= 30) return 'bg-blue-500'
  if (margin >= 15) return 'bg-yellow-500'
  return 'bg-red-500'
}

onMounted(async () => {
  await new Promise(resolve => setTimeout(resolve, 100))
  
  if (!authStore.user) {
    navigateTo('/auth/login')
  } else {
    isReady.value = true
    await fetchProfitability()
  }
})
</script>
