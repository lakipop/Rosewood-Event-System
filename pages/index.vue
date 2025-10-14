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
      
      <main class="flex-1 p-4 sm:p-6 transition-all duration-300" :class="{ 'lg:ml-64': true }">
        <div class="w-full max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-zinc-100 mb-1">Dashboard</h1>
      <p class="text-zinc-400 text-sm">Welcome to Rosewood Event Management</p>
    </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- Total Events Card -->
            <div class="rounded-xl p-5 transition-all" style="background: linear-gradient(135deg, rgba(196, 160, 122, 0.15) 0%, rgba(90, 63, 43, 0.08) 100%); border: 1px solid rgba(196, 160, 122, 0.3);">
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-xs font-medium mb-2" style="color: #d6b99f;">Total Events</p>
                  <p class="text-3xl font-bold text-zinc-100">{{ totalEvents }}</p>
                </div>
                <div class="p-3 rounded-lg" style="background: rgba(196, 160, 122, 0.2);">
                  <svg class="w-6 h-6" style="color: #c4a07a;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Upcoming Events Card -->
            <div class="rounded-xl p-5 transition-all" style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(159, 18, 57, 0.08) 100%); border: 1px solid rgba(236, 72, 153, 0.3);">
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-xs font-medium mb-2" style="color: #f9a8d4;">Upcoming Events</p>
                  <p class="text-3xl font-bold text-zinc-100">{{ upcomingEvents }}</p>
                </div>
                <div class="p-3 rounded-lg" style="background: rgba(236, 72, 153, 0.2);">
                  <svg class="w-6 h-6" style="color: #f472b6;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- User Role Card -->
            <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all">
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-zinc-400 text-xs font-medium mb-2">Your Role</p>
                  <p class="text-xl font-semibold text-zinc-100 capitalize">{{ authStore.user?.role }}</p>
                </div>
                <div class="bg-zinc-800 p-3 rounded-lg">
                  <svg class="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 class="text-lg font-semibold text-zinc-100 mb-4">Quick Actions</h2>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                @click="createEvent"
                class="flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg font-medium transition-all shadow-lg"
                style="background: linear-gradient(90deg, #ec4899 0%, #db2777 100%); box-shadow: 0 10px 25px -5px rgba(236, 72, 153, 0.3);"
                @mouseenter="handleButtonHover($event, true)"
                @mouseleave="handleButtonHover($event, false)"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Create Event
              </button>

              <button
                @click="viewAllEvents"
                class="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg font-medium transition-all"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                View All Events
              </button>

              <button
                @click="browseServices"
                class="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg font-medium transition-all"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Browse Services
              </button>
            </div>
          </div>

          <!-- Upcoming Events Alert -->
          <div v-if="upcomingEventsList.length > 0" class="bg-gradient-to-r from-orange-900/20 to-amber-900/20 border border-orange-700/50 rounded-xl p-5">
            <div class="flex items-start gap-3 mb-4">
              <div class="p-2 rounded-lg bg-orange-500/20">
                <svg class="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="flex-1">
                <h2 class="text-lg font-semibold text-orange-100 mb-1">Upcoming Events (Next 7 Days)</h2>
                <p class="text-orange-300/70 text-sm">Events requiring attention and preparation</p>
              </div>
            </div>
            
            <div class="space-y-2">
              <div 
                v-for="event in upcomingEventsList" 
                :key="event.event_id"
                class="flex items-center justify-between p-4 bg-zinc-900/50 hover:bg-zinc-900/80 rounded-lg transition cursor-pointer border border-zinc-800/50"
                @click="navigateTo(`/events/${event.event_id}`)"
              >
                <div class="flex-1">
                  <h3 class="text-sm font-semibold text-white">{{ event.event_name }}</h3>
                  <div class="flex items-center gap-4 mt-1.5 text-xs">
                    <span class="flex items-center gap-1.5 text-zinc-400">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {{ formatDate(event.event_date) }}
                    </span>
                    <span 
                      :class="event.days_until <= 3 ? 'text-orange-400 font-semibold' : 'text-yellow-400'"
                      class="flex items-center gap-1.5"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ event.days_until === 0 ? 'Today!' : event.days_until === 1 ? 'Tomorrow' : `In ${event.days_until} days` }}
                    </span>
                    <span v-if="event.payment_status !== 'paid'" class="flex items-center gap-1.5 text-red-400">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Payment Pending
                    </span>
                  </div>
                </div>
                <span 
                  :class="getStatusBadgeClass(event.status)"
                  :style="getStatusStyle(event.status)"
                  class="px-3 py-1.5 text-xs font-medium rounded-full capitalize whitespace-nowrap"
                >
                  {{ event.status.replace('_', ' ') }}
                </span>
              </div>
            </div>
          </div>

          <!-- Recent Events -->
          <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 class="text-lg font-semibold text-zinc-100 mb-4">Recent Events</h2>
            
            <div v-if="loading" class="text-center py-12">
              <div class="w-8 h-8 border-4 rounded-full animate-spin mx-auto mb-3" style="border-color: #c4a07a; border-top-color: transparent;"></div>
              <p class="text-zinc-400 text-sm">Loading events...</p>
            </div>

            <div v-else-if="events.length === 0" class="text-center py-12">
              <svg class="w-16 h-16 text-zinc-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-zinc-400 text-sm mb-3">No events yet</p>
              <button 
                @click="createEvent"
                class="inline-flex items-center gap-2 px-4 py-2 text-white text-sm rounded-lg font-medium transition"
                style="background: linear-gradient(90deg, #ec4899 0%, #db2777 100%);"
                @mouseenter="handleButtonHover($event, true)"
                @mouseleave="handleButtonHover($event, false)"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Event
              </button>
            </div>

            <div v-else class="space-y-2">
              <div 
                v-for="event in events.slice(0, 5)" 
                :key="event.event_id"
                class="flex items-center justify-between p-4 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition cursor-pointer group"
                @click="navigateTo(`/events/${event.event_id}`)"
              >
                <div class="flex-1 min-w-0 mr-4">
                  <h3 class="text-sm font-semibold text-white truncate group-hover:text-primary-400 transition">{{ event.event_name }}</h3>
                  <div class="flex items-center gap-4 mt-1.5 text-xs text-zinc-400">
                    <span class="flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {{ formatDate(event.event_date) }}
                    </span>
                    <span class="flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {{ event.venue }}
                    </span>
                  </div>
                </div>
                <span 
                  :class="getStatusBadgeClass(event.status)"
                  :style="getStatusStyle(event.status)"
                  class="px-3 py-1.5 text-xs font-medium rounded-full capitalize whitespace-nowrap"
                >
                  {{ event.status.replace('_', ' ') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
});

const authStore = useAuthStore();
const events = ref<any[]>([]);
const upcomingEventsList = ref<any[]>([]);
const loading = ref(true);
const isReady = ref(false);

const totalEvents = computed(() => events.value.length);
const upcomingEvents = computed(() => {
  const today = new Date();
  return events.value.filter(e => new Date(e.event_date) >= today).length;
});

const createEvent = () => {
  navigateTo('/events?new=true');
};

const viewAllEvents = () => {
  navigateTo('/events');
};

const browseServices = () => {
  navigateTo('/services');
};

const handleButtonHover = (event: MouseEvent, isHover: boolean) => {
  const target = event.target as HTMLElement;
  if (target) {
    target.style.background = isHover 
      ? 'linear-gradient(90deg, #f472b6 0%, #ec4899 100%)'
      : 'linear-gradient(90deg, #ec4899 0%, #db2777 100%)';
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric' 
  });
};

const getStatusBadgeClass = (status: string) => {
  const classes = {
    pending: 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/50',
    confirmed: 'border border-emerald-700/50',
    completed: 'bg-blue-900/30 text-blue-400 border border-blue-700/50',
    cancelled: 'bg-red-900/30 text-red-400 border border-red-700/50',
    inquiry: 'bg-blue-900/30 text-blue-400 border border-blue-700/50',
    in_progress: 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/50'
  };
  return classes[status as keyof typeof classes] || classes.pending;
};

const getStatusStyle = (status: string) => {
  if (status === 'confirmed') {
    return 'background: rgba(16, 185, 129, 0.2); color: #34d399;';
  }
  return '';
};

const fetchEvents = async () => {
  if (!authStore.token) {
    console.log('❌ No token available');
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    console.log('🔍 Fetching events...');
    
    const response = await $fetch<any>('/api/events', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    
    events.value = response.data || [];
    
    // Fetch upcoming events
    const upcomingResponse = await $fetch<any>('/api/upcoming-events?days=7', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    
    upcomingEventsList.value = upcomingResponse.data || [];
    console.log('✅ Events loaded');
  } catch (error: any) {
    console.error('❌ Failed to fetch events:', error);
    console.error('Error details:', {
      statusCode: error.statusCode,
      statusMessage: error.statusMessage,
      message: error.message,
      data: error.data
    });
    
    if (error.statusCode === 401) {
      console.log('🔐 Token expired or invalid, redirecting to login');
      authStore.logout();
      navigateTo('/auth/login');
    }
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  console.log('🚀 Dashboard mounted');
  
  // Wait a bit for auth to initialize from localStorage
  await new Promise(resolve => setTimeout(resolve, 100));
  
  console.log('🔐 Auth state:', {
    hasToken: !!authStore.token,
    hasUser: !!authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user
  });
  
  if (!authStore.user) {
    console.log('❌ No user found, redirecting to login');
    navigateTo('/auth/login');
  } else {
    console.log('✅ User authenticated:', authStore.user.email);
    isReady.value = true;
    await fetchEvents();
  }
});
</script>
