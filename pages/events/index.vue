<template>
  <div class="min-h-screen bg-zinc-950">
    <AppHeader />
    
    <div class="flex">
      <AppSidebar />
      
      <main class="flex-1 ml-64 p-8">
        <div class="max-w-7xl mx-auto">
          <!-- Header -->
          <div class="flex justify-between items-center mb-8">
            <div>
              <h1 class="text-3xl font-bold text-zinc-100 mb-2">Events</h1>
              <p class="text-zinc-400">Manage your events and bookings</p>
            </div>
            
            <button 
              v-if="authStore.user?.role !== 'client'"
              @click="openCreateModal"
              class="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition flex items-center gap-2"
            >
              <span class="text-xl">➕</span>
              Create Event
            </button>
          </div>

          <!-- Filters -->
          <div class="mb-6 flex gap-4">
            <select 
              v-model="filterStatus"
              class="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              <option value="">All Status</option>
              <option value="inquiry">Inquiry</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <input 
              v-model="searchQuery"
              type="text"
              placeholder="Search events..."
              class="flex-1 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="text-center py-12">
            <div class="text-4xl mb-4">⏳</div>
            <p class="text-zinc-400">Loading events...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredEvents.length === 0" class="text-center py-12 bg-zinc-900 rounded-lg border border-zinc-800">
            <div class="text-6xl mb-4">📅</div>
            <p class="text-xl text-zinc-400 mb-2">No events found</p>
            <p class="text-zinc-500">Create your first event to get started</p>
          </div>

          <!-- Events Grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="event in filteredEvents" 
              :key="event.event_id"
              class="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden hover:border-rose-500 transition cursor-pointer"
              @click="viewEvent(event.event_id)"
            >
              <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                  <h3 class="text-xl font-bold text-zinc-100">{{ event.event_name }}</h3>
                  <span 
                    :class="getStatusColor(event.status)"
                    class="px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {{ formatStatus(event.status) }}
                  </span>
                </div>

                <div class="space-y-2 mb-4">
                  <div class="flex items-center gap-2 text-zinc-400">
                    <span>📅</span>
                    <span class="text-sm">{{ formatDate(event.event_date) }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-zinc-400">
                    <span>📍</span>
                    <span class="text-sm">{{ event.venue }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-zinc-400">
                    <span>👥</span>
                    <span class="text-sm">{{ event.guest_count || 0 }} guests</span>
                  </div>
                  <div v-if="event.client_name" class="flex items-center gap-2 text-zinc-400">
                    <span>👤</span>
                    <span class="text-sm">{{ event.client_name }}</span>
                  </div>
                </div>

                <div class="flex gap-2">
                  <button 
                    @click.stop="viewEvent(event.event_id)"
                    class="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition"
                  >
                    View Details
                  </button>
                  <button 
                    v-if="authStore.user?.role !== 'client'"
                    @click.stop="openEditModal(event)"
                    class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm transition"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div class="bg-zinc-900 rounded-lg border border-zinc-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-zinc-800">
          <h2 class="text-2xl font-bold text-zinc-100">
            {{ isEditing ? 'Edit Event' : 'Create Event' }}
          </h2>
        </div>

        <form @submit.prevent="saveEvent" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">Event Name *</label>
            <input 
              v-model="formData.event_name"
              type="text"
              required
              class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              placeholder="Wedding, Birthday Party, etc."
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-zinc-300 mb-2">Event Date *</label>
              <input 
                v-model="formData.event_date"
                type="date"
                required
                class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-zinc-300 mb-2">Event Time</label>
              <input 
                v-model="formData.event_time"
                type="time"
                class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">Venue *</label>
            <input 
              v-model="formData.venue"
              type="text"
              required
              class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              placeholder="Hotel, Hall, Garden, etc."
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">Event Type *</label>
            <select 
              v-model="formData.event_type_id"
              required
              class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              <option value="">Select Type</option>
              <option value="1">Wedding</option>
              <option value="2">Birthday</option>
              <option value="3">Corporate</option>
              <option value="4">Anniversary</option>
              <option value="5">Party</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-zinc-300 mb-2">Guest Count</label>
              <input 
                v-model.number="formData.guest_count"
                type="number"
                min="0"
                class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                placeholder="Expected guests"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-zinc-300 mb-2">Status</label>
              <select 
                v-model="formData.status"
                class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                <option value="inquiry">Inquiry</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div v-if="authStore.user?.role !== 'client'">
            <label class="block text-sm font-medium text-zinc-300 mb-2">Client ID *</label>
            <input 
              v-model.number="formData.client_id"
              type="number"
              required
              class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              placeholder="Client user ID"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">Special Requirements</label>
            <textarea 
              v-model="formData.special_requirements"
              rows="3"
              class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              placeholder="Any special requests or requirements..."
            ></textarea>
          </div>

          <div class="flex gap-4 pt-4">
            <button 
              type="button"
              @click="closeModal"
              class="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              :disabled="saving"
              class="flex-1 px-6 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-zinc-700 text-white rounded-lg font-medium transition"
            >
              {{ saving ? 'Saving...' : (isEditing ? 'Update Event' : 'Create Event') }}
            </button>
          </div>
        </form>
      </div>
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
const showModal = ref(false);
const isEditing = ref(false);
const saving = ref(false);
const filterStatus = ref('');
const searchQuery = ref('');

const formData = ref({
  event_id: null as number | null,
  event_name: '',
  event_date: '',
  event_time: '',
  venue: '',
  event_type_id: '',
  client_id: authStore.user?.userId || null,
  guest_count: null as number | null,
  status: 'inquiry',
  special_requirements: ''
});

const filteredEvents = computed(() => {
  let result = events.value;

  if (filterStatus.value) {
    result = result.filter(e => e.status === filterStatus.value);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(e => 
      e.event_name.toLowerCase().includes(query) ||
      e.venue.toLowerCase().includes(query) ||
      e.client_name?.toLowerCase().includes(query)
    );
  }

  return result;
});

const fetchEvents = async () => {
  try {
    loading.value = true;
    
    const response = await $fetch<any>('/api/events', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    
    events.value = response.data || [];
  } catch (error: any) {
    console.error('Failed to fetch events:', error);
    if (error.statusCode === 401) {
      authStore.logout();
      navigateTo('/auth/login');
    }
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  isEditing.value = false;
  formData.value = {
    event_id: null,
    event_name: '',
    event_date: '',
    event_time: '',
    venue: '',
    event_type_id: '',
    client_id: authStore.user?.userId || null,
    guest_count: null,
    status: 'inquiry',
    special_requirements: ''
  };
  showModal.value = true;
};

const openEditModal = (event: any) => {
  isEditing.value = true;
  formData.value = {
    event_id: event.event_id,
    event_name: event.event_name,
    event_date: event.event_date?.split('T')[0] || '',
    event_time: event.event_time || '',
    venue: event.venue,
    event_type_id: event.event_type_id,
    client_id: event.client_id,
    guest_count: event.guest_count,
    status: event.status,
    special_requirements: event.special_requirements || ''
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveEvent = async () => {
  try {
    saving.value = true;

    const payload = {
      ...formData.value,
      client_id: authStore.user?.role === 'client' ? authStore.user.userId : formData.value.client_id
    };

    if (isEditing.value) {
      await $fetch(`/api/events/${formData.value.event_id}`, {
        method: 'PUT',
        body: payload,
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      });
    } else {
      await $fetch('/api/events', {
        method: 'POST',
        body: payload,
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      });
    }

    closeModal();
    await fetchEvents();
  } catch (error: any) {
    console.error('Failed to save event:', error);
    alert(error.data?.message || 'Failed to save event');
  } finally {
    saving.value = false;
  }
};

const viewEvent = (eventId: number) => {
  navigateTo(`/events/${eventId}`);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const formatStatus = (status: string) => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
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

onMounted(() => {
  if (!authStore.user) {
    navigateTo('/auth/login');
  } else {
    fetchEvents();
  }
});
</script>
