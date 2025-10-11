<template>
  <div v-if="!isReady" class="min-h-screen bg-zinc-950 flex items-center justify-center">
    <div class="text-center">
      <div class="text-4xl mb-4">🌲</div>
      <p class="text-zinc-400">Loading...</p>
    </div>
  </div>

  <div v-else class="min-h-screen bg-zinc-950">
    <AppHeader />
    
    <div class="flex">
      <AppSidebar />
      
      <main class="flex-1 ml-64 p-8">
        <div class="max-w-7xl mx-auto">
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-zinc-100 mb-2">Dashboard</h1>
            <p class="text-zinc-400">Welcome to Rosewood Event Management System</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-zinc-400 text-sm">Total Events</p>
                  <p class="text-3xl font-bold text-zinc-100 mt-2">{{ totalEvents }}</p>
                </div>
                <span class="text-4xl">📅</span>
              </div>
            </div>

            <div class="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-zinc-400 text-sm">Upcoming Events</p>
                  <p class="text-3xl font-bold text-zinc-100 mt-2">{{ upcomingEvents }}</p>
                </div>
                <span class="text-4xl">⏰</span>
              </div>
            </div>

            <div class="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-zinc-400 text-sm">User Role</p>
                  <p class="text-xl font-semibold text-zinc-100 mt-2 capitalize">{{ authStore.user?.role }}</p>
                </div>
                <span class="text-4xl">👤</span>
              </div>
            </div>
          </div>

          <div class="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <h2 class="text-xl font-bold text-zinc-100 mb-4">Quick Actions</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                @click="createEvent"
                class="flex items-center gap-3 p-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition text-left"
              >
                <span class="text-2xl">➕</span>
                <span class="text-zinc-100">Create New Event</span>
              </button>

              <button
                @click="viewAllEvents"
                class="flex items-center gap-3 p-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition text-left"
              >
                <span class="text-2xl">📋</span>
                <span class="text-zinc-100">View All Events</span>
              </button>

              <button
                @click="browseServices"
                class="flex items-center gap-3 p-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition text-left"
              >
                <span class="text-2xl">🛎️</span>
                <span class="text-zinc-100">Browse Services</span>
              </button>
            </div>
          </div>

          <!-- Recent Events -->
          <div class="mt-8 bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <h2 class="text-xl font-bold text-zinc-100 mb-4">Recent Events</h2>
            
            <div v-if="loading" class="text-center py-8">
              <p class="text-zinc-400">Loading events...</p>
            </div>

            <div v-else-if="events.length === 0" class="text-center py-8">
              <p class="text-zinc-400">No events found. Create your first event!</p>
            </div>

            <div v-else class="space-y-4">
              <div 
                v-for="event in events.slice(0, 5)" 
                :key="event.event_id"
                class="flex items-center justify-between p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition"
              >
                <div>
                  <h3 class="text-lg font-semibold text-white">{{ event.event_name }}</h3>
                  <p class="text-sm text-zinc-400">{{ formatDate(event.event_date) }} at {{ event.venue }}</p>
                </div>
                <span 
                  :class="getStatusColor(event.status)"
                  class="px-3 py-1 rounded-full text-xs font-medium"
                >
                  {{ event.status }}
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
import { useAuthStore } from '~/stores/auth';
import AppHeader from '~/components/common/AppHeader.vue';
import AppSidebar from '~/components/common/AppSidebar.vue';

definePageMeta({
  layout: false
});

const authStore = useAuthStore();
const events = ref<any[]>([]);
const loading = ref(true);
const isReady = ref(false);

const totalEvents = computed(() => events.value.length);
const upcomingEvents = computed(() => {
  const today = new Date();
  return events.value.filter(e => new Date(e.event_date) >= today).length;
});

const createEvent = () => {
  alert('Create Event feature coming soon! For now, use the API directly.');
};

const viewAllEvents = () => {
  alert('View All Events page coming soon! Check your events in the dashboard below.');
};

const browseServices = () => {
  navigateTo('/services');
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'inquiry': 'bg-blue-900/30 text-blue-400',
    'confirmed': 'bg-green-900/30 text-green-400',
    'in_progress': 'bg-yellow-900/30 text-yellow-400',
    'completed': 'bg-zinc-700 text-zinc-400',
    'cancelled': 'bg-red-900/30 text-red-400'
  };
  return colors[status] || 'bg-zinc-700 text-zinc-400';
};

const fetchEvents = async () => {
  if (!authStore.token) {
    console.log('No token available');
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    console.log('Fetching events with token:', authStore.token?.substring(0, 20) + '...');
    
    const response = await $fetch<any>('/api/events', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    
    console.log('Events fetched:', response);
    events.value = response.events || [];
  } catch (error: any) {
    console.error('Failed to fetch events:', error);
    if (error.statusCode === 401) {
      // Token expired or invalid, redirect to login
      authStore.logout();
      navigateTo('/auth/login');
    }
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  // Wait a bit for auth to initialize from localStorage
  await new Promise(resolve => setTimeout(resolve, 100));
  
  if (!authStore.user) {
    console.log('No user found, redirecting to login');
    navigateTo('/auth/login');
  } else {
    console.log('User found:', authStore.user);
    isReady.value = true;
    await fetchEvents();
  }
});
</script>
