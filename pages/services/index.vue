<template>
  <div class="min-h-screen bg-zinc-800">
    <AppHeader />
    
    <div class="flex">
      <AppSidebar />
      
      <main class="flex-1 ml-64 p-8">
        <div class="max-w-7xl mx-auto">
          <!-- Header -->
          <div class="flex justify-between items-center mb-8">
            <div>
              <h1 class="text-3xl font-bold text-white mb-2">🛎️ Services</h1>
              <p class="text-zinc-400">Manage event services and offerings</p>
            </div>
            
            <div class="flex gap-3">
              <button 
                @click="fetchServices"
                class="px-4 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition"
                title="Refresh data"
              >
                🔄 Reload
              </button>
              <button 
                v-if="authStore.user?.role !== 'client'"
                @click="showAddModal = true"
                class="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition"
              >
                ➕ Add Service
              </button>
            </div>
          </div>

          <!-- Filter -->
          <div class="mb-6">
            <select 
              v-model="selectedCategory"
              class="px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg"
            >
              <option value="">All Categories</option>
              <option value="Decoration">Decoration</option>
              <option value="Catering">Catering</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Photography">Photography</option>
              <option value="Gifts">Gifts</option>
            </select>
          </div>

          <!-- Services Grid -->
          <div v-if="loading" class="text-center py-12">
            <div class="text-zinc-400">Loading services...</div>
          </div>

          <div v-else-if="error" class="bg-red-900/20 border border-red-900 text-red-400 p-4 rounded-lg">
            {{ error }}
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="service in filteredServices" 
              :key="service.service_id"
              class="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-primary-600 transition"
            >
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-xl font-semibold text-white mb-1">{{ service.service_name }}</h3>
                  <span class="text-sm text-secondary-400 text-amber-200">{{ service.category }}</span>
                </div>
                <span 
                  v-if="service.is_available"
                  class="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded-full"
                >
                  Available
                </span>
                <span 
                  v-else
                  class="px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded-full"
                >
                  Unavailable
                </span>
              </div>

              <p class="text-zinc-400 text-sm mb-4">{{ service.description }}</p>

              <div class="flex justify-between items-end">
                <div>
                  <div class="text-2xl font-bold text-primary-500 text-rose-400/80">
                    Rs. {{ formatNumber(service.unit_price) }}
                  </div>
                  <div class="text-xs text-zinc-500">{{ formatUnitType(service.unit_type) }}</div>
                </div>

                <div v-if="authStore.user?.role !== 'client'" class="flex gap-2">
                  <button 
                    @click="editService(service)"
                    class="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-sm"
                  >
                    ✏️ Edit
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!loading && !error && filteredServices.length === 0" class="text-center py-12">
            <div class="text-6xl mb-4">🛎️</div>
            <h3 class="text-xl font-semibold text-white mb-2">No services found</h3>
            <p class="text-zinc-400">Try adjusting your filters or add a new service</p>
          </div>
        </div>
      </main>
    </div>

    <!-- Add/Edit Modal -->
    <div 
      v-if="showAddModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="closeModal"
    >
      <div class="bg-zinc-900 rounded-lg p-8 max-w-2xl w-full mx-4 border border-zinc-800">
        <h2 class="text-2xl font-bold text-white mb-6">
          {{ editingService ? '✏️ Edit Service' : '➕ Add New Service' }}
        </h2>

        <form @submit.prevent="saveService" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">Service Name *</label>
            <input 
              v-model="formData.service_name"
              type="text"
              required
              class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              placeholder="e.g., Traditional Poruwa Decoration"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">Category *</label>
            <select 
              v-model="formData.category"
              required
              class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            >
              <option value="">Select category</option>
              <option value="Decoration">Decoration</option>
              <option value="Catering">Catering</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Photography">Photography</option>
              <option value="Gifts">Gifts</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">Description</label>
            <textarea 
              v-model="formData.description"
              rows="3"
              class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              placeholder="Describe the service..."
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-zinc-300 mb-2">Unit Price (Rs.) *</label>
              <input 
                v-model.number="formData.unit_price"
                type="number"
                step="0.01"
                required
                class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                placeholder="0.00"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-zinc-300 mb-2">Unit Type *</label>
              <select 
                v-model="formData.unit_type"
                required
                class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              >
                <option value="">Select type</option>
                <option value="fixed">Fixed</option>
                <option value="per_person">Per Person</option>
                <option value="per_hour">Per Hour</option>
              </select>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <input 
              v-model="formData.is_available"
              type="checkbox"
              id="available"
              class="w-4 h-4 text-primary-600 bg-zinc-800 border-zinc-700 rounded"
            />
            <label for="available" class="text-sm text-zinc-300">Available for booking</label>
          </div>

          <div class="flex gap-3 pt-4">
            <button 
              type="submit"
              :disabled="saving"
              class="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              {{ saving ? 'Saving...' : (editingService ? 'Update Service' : 'Add Service') }}
            </button>
            <button 
              type="button"
              @click="closeModal"
              class="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition"
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
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();

const services = ref<any[]>([]);
const loading = ref(true);
const error = ref('');
const selectedCategory = ref('');
const showAddModal = ref(false);
const editingService = ref<any>(null);
const saving = ref(false);

const formData = ref({
  service_name: '',
  category: '',
  description: '',
  unit_price: 0,
  unit_type: '',
  is_available: true
});

const filteredServices = computed(() => {
  if (!selectedCategory.value) return services.value;
  return services.value.filter(s => s.category === selectedCategory.value);
});

const formatNumber = (num: number) => {
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatUnitType = (type: string) => {
  return type.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const fetchServices = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const response = await $fetch<any>('/api/services', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    
    services.value = response.services || response.data || [];
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Failed to load services';
    console.error('Error fetching services:', err);
    
    if (err.statusCode === 401) {
      authStore.logout();
      navigateTo('/auth/login');
    }
  } finally {
    loading.value = false;
  }
};

const editService = (service: any) => {
  editingService.value = service;
  formData.value = {
    service_name: service.service_name,
    category: service.category,
    description: service.description,
    unit_price: service.unit_price,
    unit_type: service.unit_type,
    is_available: service.is_available
  };
  showAddModal.value = true;
};

const closeModal = () => {
  showAddModal.value = false;
  editingService.value = null;
  formData.value = {
    service_name: '',
    category: '',
    description: '',
    unit_price: 0,
    unit_type: '',
    is_available: true
  };
};

const saveService = async () => {
  try {
    saving.value = true;
    
    if (editingService.value) {
      // Update
      await useFetch(`/api/services/${editingService.value.service_id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authStore.token}`
        },
        body: formData.value
      });
    } else {
      // Create
      await useFetch('/api/services', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authStore.token}`
        },
        body: formData.value
      });
    }

    closeModal();
    await fetchServices();
  } catch (err: any) {
    alert(err.message || 'Failed to save service');
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  if (!authStore.user) {
    navigateTo('/auth/login');
  } else {
    fetchServices();
  }
});
</script>
