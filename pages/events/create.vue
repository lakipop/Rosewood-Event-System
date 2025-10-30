<template>
  <div class="min-h-screen bg-zinc-800">
    <AppHeader />
    
    <div class="flex">
      <AppSidebar />
      
      <main class="flex-1 ml-64 p-8">
        <div class="max-w-3xl mx-auto">
          <!-- Header -->
          <div class="mb-6">
            <button 
              @click="goBack"
              class="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 mb-4 transition"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Events
            </button>
            <h1 class="text-3xl font-bold text-zinc-100">Create New Event</h1>
            <p class="text-zinc-400 mt-2">Fill in the details to create a new event</p>
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="mb-6 p-4 bg-green-900/20 border border-green-800/30 rounded-lg">
            <div class="flex items-center gap-2 text-green-400">
              <span class="text-2xl">✅</span>
              <div>
                <div class="font-medium">Event Created Successfully!</div>
                <div class="text-sm text-green-400/80">{{ successMessage }}</div>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="mb-6 p-4 bg-red-900/20 border border-red-800/30 rounded-lg">
            <div class="flex items-center gap-2 text-red-400">
              <span class="text-2xl">❌</span>
              <div class="font-medium">{{ errorMessage }}</div>
            </div>
          </div>

          <!-- Form -->
          <form @submit.prevent="createEvent" class="bg-zinc-900 rounded-lg border border-zinc-800 p-6 space-y-6">
            <!-- Event Name -->
            <div>
              <label class="block text-sm font-medium text-zinc-300 mb-2">
                Event Name *
              </label>
              <input 
                v-model="formData.event_name"
                type="text"
                required
                class="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                placeholder="e.g., Wedding Reception, Birthday Party, Corporate Event"
              />
            </div>

            <!-- Event Type -->
            <div>
              <label class="block text-sm font-medium text-zinc-300 mb-2">
                Event Type *
              </label>
              <select 
                v-model.number="formData.event_type"
                required
                class="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                <option value="">Select Event Type</option>
                <option :value="1">Wedding</option>
                <option :value="2">Birthday</option>
                <option :value="3">Corporate</option>
                <option :value="4">Anniversary</option>
                <option :value="5">Party</option>
                <option :value="6">Other</option>
              </select>
            </div>

            <!-- Date and Time -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-2">
                  Event Date *
                </label>
                <input 
                  v-model="formData.event_date"
                  type="date"
                  required
                  :min="today"
                  class="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-2">
                  Event Time
                </label>
                <input 
                  v-model="formData.event_time"
                  type="time"
                  class="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <!-- Venue -->
            <div>
              <label class="block text-sm font-medium text-zinc-300 mb-2">
                Venue *
              </label>
              <input 
                v-model="formData.venue"
                type="text"
                required
                class="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                placeholder="e.g., Grand Ballroom, Garden Hall, etc."
              />
            </div>

            <!-- Guest Count and Budget -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-2">
                  Expected Guest Count
                </label>
                <input 
                  v-model.number="formData.guest_count"
                  type="number"
                  min="1"
                  class="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  placeholder="e.g., 100"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-2">
                  Budget (₱)
                </label>
                <input 
                  v-model.number="formData.budget"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  placeholder="e.g., 50000.00"
                />
              </div>
            </div>

            <!-- Special Requirements -->
            <div>
              <label class="block text-sm font-medium text-zinc-300 mb-2">
                Notes / Special Requirements
              </label>
              <textarea 
                v-model="formData.notes"
                rows="4"
                class="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
                placeholder="Any special requirements, dietary restrictions, themes, etc."
              ></textarea>
            </div>

            <!-- Client Selection removed - will be implemented later -->
            <!-- TODO: Add client selection when user management API is ready -->

            <!-- Add Services Section -->
            <div class="mt-6">
              <h2 class="text-lg font-bold text-zinc-100 mb-4">Add Services</h2>

              <div v-if="addedServices.length > 0" class="space-y-4">
                <div 
                  v-for="(service, index) in addedServices" 
                  :key="index"
                  class="flex justify-between items-center bg-zinc-900 border border-zinc-800 rounded-lg p-4"
                >
                  <div>
                    <h3 class="text-zinc-100 font-medium">{{ service.service_name }}</h3>
                    <p class="text-zinc-400 text-sm">Quantity: {{ service.quantity }} | Price: {{ service.agreed_price }}</p>
                  </div>
                  <button 
                    @click="removeService(index)"
                    class="text-red-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <button 
                type="button" 
                @click="openAddToEventModal()"
                class="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
              >
                ➕ Add Service
              </button>
            </div>

            <!-- Submit Buttons -->
            <div class="flex gap-4 pt-4">
              <button 
                type="button"
                @click="goBack"
                class="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium transition"
              >
                Cancel
              </button>
              <button 
                type="submit"
                :disabled="saving"
                class="flex-1 px-6 py-3 bg-linear-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 disabled:from-zinc-700 disabled:to-zinc-700 text-white rounded-lg font-medium transition shadow-lg"
              >
                {{ saving ? 'Creating...' : 'Create Event' }}
              </button>
            </div>
          </form>

          <!-- Add Service to Event Modal -->
          <div v-if="showAddToEventModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div class="bg-zinc-900 rounded-lg border border-zinc-800 max-w-md w-full p-6">
              <div class="mb-4">
                <h3 class="text-xl font-bold text-zinc-100">Add Service to Event</h3>
              </div>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-zinc-300 mb-2">Service Name *</label>
                  <input 
                    v-model="newService.service_name"
                    type="text"
                    required
                    class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    placeholder="Catering, Photography, etc."
                  />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-zinc-300 mb-2">Quantity *</label>
                    <input 
                      v-model.number="newService.quantity"
                      type="number"
                      min="1"
                      required
                      class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      placeholder="Number of items or hours"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-zinc-300 mb-2">Agreed Price *</label>
                    <input 
                      v-model.number="newService.agreed_price"
                      type="number"
                      min="0"
                      required
                      class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      placeholder="Total price for the service"
                    />
                  </div>
                </div>

                <div class="flex gap-4 pt-4">
                  <button 
                    type="button"
                    @click="closeAddToEventModal"
                    class="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                  <button 
                    @click="addServiceToEvent(newService)"
                    class="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition"
                  >
                    Add Service
                  </button>
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
import { useAuthStore } from '~/stores/auth';
import AppHeader from '~/components/common/AppHeader.vue';
import AppSidebar from '~/components/common/AppSidebar.vue';

definePageMeta({
  layout: false
});

const authStore = useAuthStore();
const router = useRouter();

const saving = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const showAddToEventModal = ref(false); // Defined the missing variable

const today = computed(() => {
  return new Date().toISOString().split('T')[0];
});

const formData = ref({
  event_name: '',
  event_type: '',
  event_date: '',
  event_time: '',
  venue: '',
  guest_count: null as number | null,
  budget: null as number | null,
  notes: '',
  client_id: authStore.user?.role === 'client' ? authStore.user.userId : null
});

const addedServices = ref<any[]>([]);
const newService = ref({
  service_name: '',
  quantity: 1,
  agreed_price: 0
});

const createEvent = async () => {
  try {
    saving.value = true;
    errorMessage.value = '';
    successMessage.value = '';

    const payload = {
      eventName: formData.value.event_name,
      eventTypeId: formData.value.event_type,
      eventDate: formData.value.event_date,
      eventTime: formData.value.event_time || null,
      venue: formData.value.venue,
      guestCount: formData.value.guest_count || null,
      budget: formData.value.budget || null,
      specialNotes: formData.value.notes || null,
      clientId: formData.value.client_id || null,
      services: addedServices.value // Include added services in the payload
    };

    const response = await $fetch<any>('/api/events', {
      method: 'POST',
      body: payload,
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });

    successMessage.value = response.message || 'Event created successfully!';
    
    // Navigate to event details after 2 seconds
    setTimeout(() => {
      if (response.data?.event_id) {
        router.push(`/events/${response.data.event_id}`);
      } else {
        router.push('/events');
      }
    }, 2000);

  } catch (error: any) {
    console.error('Failed to create event:', error);
    errorMessage.value = error.data?.message || 'Failed to create event. Please try again.';
  } finally {
    saving.value = false;
  }
};

const goBack = () => {
  router.push('/events');
};

const openAddToEventModal = () => {
  showAddToEventModal.value = true;
};

const closeAddToEventModal = () => {
  showAddToEventModal.value = false;
  // reset the temporary new service form
  newService.value = { service_name: '', quantity: 1, agreed_price: 0 };
};

const addServiceToEvent = (service: any) => {
  // ensure we push a plain object (not a ref)
  const svc = {
    service_name: service.service_name,
    quantity: service.quantity,
    agreed_price: service.agreed_price
  };
  addedServices.value.push(svc);
  closeAddToEventModal();
};

const removeService = (index: number) => {
  addedServices.value.splice(index, 1);
};

onMounted(() => {
  if (!authStore.user) {
    navigateTo('/auth/login');
  }
});
</script>

<style>
/* Fixed the gradient class issue */
.bg-gradient-to-r {
  background: linear-gradient(to right, var(--tw-gradient-stops));
}
</style>
