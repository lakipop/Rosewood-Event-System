<template>
  <div class="min-h-screen bg-zinc-950">
    <AppHeader />
    
    <div class="flex pt-16">
      <AppSidebar />
      
      <main class="flex-1 ml-64 p-8">
        <div class="max-w-7xl mx-auto">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-12">
            <div class="text-4xl mb-4">⏳</div>
            <p class="text-zinc-400">Loading event details...</p>
          </div>

          <!-- Event Details -->
          <div v-else-if="event">
            <!-- Header -->
            <div class="flex justify-between items-start mb-8">
              <div>
                <button 
                  @click="navigateTo('/events')"
                  class="text-zinc-400 hover:text-zinc-300 mb-4 flex items-center gap-2"
                >
                  <span>←</span> Back to Events
                </button>
                <h1 class="text-3xl font-bold text-zinc-100 mb-2">{{ event.event_name }}</h1>
                <div class="flex items-center gap-3">
                  <span 
                    :class="getStatusColor(event.status)"
                    class="px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {{ formatStatus(event.status) }}
                  </span>
                  
                  <!-- Status Update Dropdown -->
                  <select
                    v-model="selectedStatus"
                    @change="updateStatus"
                    class="px-3 py-1 rounded-lg text-xs font-medium bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-secondary-500 transition"
                  >
                    <option value="">Change Status</option>
                    <option value="inquiry">Inquiry</option>
                    <option value="confirmed">Confirmed</option>
                    <!-- <option value="in_progress">In Progress</option> -->
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <button 
                @click="fetchEvent"
                class="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition"
                title="Refresh data"
              >
                🔄 Reload
              </button>
            </div>

            <!-- Event Info Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <!-- Event Details Card -->
              <div class="lg:col-span-2 bg-zinc-900 rounded-lg border border-zinc-800 p-6">
                <h2 class="text-xl font-bold text-zinc-100 mb-6">Event Details</h2>
                
                <div class="grid grid-cols-2 gap-6">
                  <div>
                    <p class="text-sm text-zinc-400 mb-1">Date</p>
                    <p class="text-zinc-100 font-medium">{{ formatDate(event.event_date) }}</p>
                  </div>

                  <div>
                    <p class="text-sm text-zinc-400 mb-1">Time</p>
                    <p class="text-zinc-100 font-medium">{{ event.event_time || 'Not specified' }}</p>
                  </div>

                  <div>
                    <p class="text-sm text-zinc-400 mb-1">Venue</p>
                    <p class="text-zinc-100 font-medium">{{ event.venue }}</p>
                  </div>

                  <div>
                    <p class="text-sm text-zinc-400 mb-1">Guest Count</p>
                    <p class="text-zinc-100 font-medium">{{ event.guest_count || 0 }} guests</p>
                  </div>

                  <div>
                    <p class="text-sm text-zinc-400 mb-1">Event Type</p>
                    <p class="text-zinc-100 font-medium">{{ event.event_type || event.type_name || 'N/A' }}</p>
                  </div>

                  <div>
                    <p class="text-sm text-zinc-400 mb-1">Client</p>
                    <p class="text-zinc-100 font-medium">{{ event.client_name }}</p>
                  </div>
                </div>

                <div v-if="event.special_requirements" class="mt-6 pt-6 border-t border-zinc-800">
                  <p class="text-sm text-zinc-400 mb-2">Special Requirements</p>
                  <p class="text-zinc-300">{{ event.special_requirements }}</p>
                </div>
              </div>

              <!-- Financial Summary Card -->
              <div class="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
                <h2 class="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
                  💰 Financial Summary
                </h2>
                
                <div class="space-y-4">
                  <!-- Total Cost -->
                  <div>
                    <p class="text-sm text-zinc-400 mb-1">Total Cost</p>
                    <p class="text-2xl font-bold text-zinc-100">Rs:{{ formatCurrency(financials?.total_cost || 0) }}</p>
                  </div>

                  <!-- Total Paid -->
                  <div>
                    <p class="text-sm text-zinc-400 mb-1">Total Paid</p>
                    <p class="text-2xl font-bold text-green-400">Rs:{{ formatCurrency(financials?.total_paid || 0) }}</p>
                  </div>

                  <!-- Balance -->
                  <div class="pt-4 border-t border-zinc-800">
                    <p class="text-sm text-zinc-400 mb-1">Balance</p>
                    <p :class="(financials?.balance || 0) > 0 ? 'text-rose-400' : 'text-green-400'" class="text-2xl font-bold">
                      Rs:{{ formatCurrency(financials?.balance || 0) }}
                    </p>
                  </div>

                  <!-- Payment Status Badge -->
                  <div v-if="financials?.payment_status" class="pt-4 border-t border-zinc-800">
                    <p class="text-sm text-zinc-400 mb-2">Payment Status</p>
                    <span 
                      :class="{
                        'bg-green-900/30 text-green-400': financials.is_paid,
                        'bg-yellow-900/30 text-yellow-400': !financials.is_paid && financials.total_paid > 0,
                        'bg-red-900/30 text-red-400': financials.total_paid === 0
                      }"
                      class="px-3 py-1.5 rounded-full text-sm font-medium inline-block"
                    >
                      {{ financials.payment_status }}
                    </span>
                  </div>

                  <!-- Days Until Event -->
                  <div v-if="financials?.days_until !== null && event.status !== 'completed' && event.status !== 'cancelled'" class="pt-4 border-t border-zinc-800">
                    <p class="text-sm text-zinc-400 mb-2">Days Until Event</p>
                    <p :class="financials.days_until < 7 ? 'text-red-400' : 'text-zinc-200'" class="text-3xl font-bold">
                      {{ financials.days_until }}
                      <span class="text-base font-normal text-zinc-400">days</span>
                    </p>
                  </div>

                  <button 
                      @click="openPaymentModal"
                      class="w-full px-4 py-3 bg-linear-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-lg font-medium transition mt-4 shadow-lg"
                  >
                    💳 Record Payment
                  </button>
                </div>
              </div>
            </div>

            <!-- Services Section -->
            <div class="bg-zinc-900 rounded-lg border border-zinc-800 p-6 mb-8">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-zinc-100 flex items-center gap-2">
                  🛎️ Event Services
                </h2>
                <span class="text-sm text-zinc-400">{{ services.length }} service{{ services.length !== 1 ? 's' : '' }}</span>
              </div>

              <div v-if="services.length === 0" class="text-center py-8">
                <p class="text-zinc-400">No services added to this event</p>
              </div>

              <div v-else class="space-y-4">
                <div 
                  v-for="service in services" 
                  :key="service.event_service_id"
                  class="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50"
                >
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-2">
                        <h3 class="text-lg font-semibold text-zinc-100">{{ service.service_name }}</h3>
                        <span 
                          :class="{
                            'bg-blue-900/30 text-blue-400': service.category === 'catering',
                            'bg-purple-900/30 text-purple-400': service.category === 'decoration',
                            'bg-green-900/30 text-green-400': service.category === 'entertainment',
                            'bg-yellow-900/30 text-yellow-400': service.category === 'photography',
                            'bg-pink-900/30 text-pink-400': service.category === 'venue',
                            'bg-zinc-700 text-zinc-300': !['catering', 'decoration', 'entertainment', 'photography', 'venue'].includes(service.category)
                          }"
                          class="px-2 py-1 rounded-full text-xs font-medium capitalize"
                        >
                          {{ service.category }}
                        </span>
                      </div>
                      
                      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p class="text-zinc-400 mb-1">Quantity</p>
                          <p class="text-zinc-200 font-medium">{{ service.quantity }} {{ service.unit_type || 'units' }}</p>
                        </div>
                        
                        <div>
                          <p class="text-zinc-400 mb-1">Unit Price</p>
                          <p class="text-zinc-200 font-medium">Rs:{{ formatCurrency(service.agreed_price) }}</p>
                        </div>
                        
                        <div>
                          <p class="text-zinc-400 mb-1">Subtotal</p>
                          <p class="text-green-400 font-bold">Rs:{{ formatCurrency(service.subtotal || (service.quantity * service.agreed_price)) }}</p>
                        </div>
                        
                        <div>
                          <p class="text-zinc-400 mb-1">Added</p>
                          <p class="text-zinc-200">{{ formatDate(service.added_at) }}</p>
                        </div>
                      </div>

                      <div v-if="service.special_instructions" class="mt-3 pt-3 border-t border-zinc-700">
                        <p class="text-zinc-400 text-sm mb-1">Special Instructions</p>
                        <p class="text-zinc-300 text-sm">{{ service.special_instructions }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Services Total -->
                <div class="border-t border-zinc-700 pt-4 mt-6">
                  <div class="flex justify-between items-center">
                    <span class="text-lg font-semibold text-zinc-300">Total Services Cost</span>
                    <span class="text-2xl font-bold text-green-400">
                      Rs:{{ formatCurrency(calculateServicesTotal()) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Payments Section -->
            <div class="bg-zinc-900 rounded-lg border border-zinc-800 p-6 mb-8">
              <h2 class="text-xl font-bold text-zinc-100 mb-6">Payment History</h2>

              <div v-if="loadingPayments" class="text-center py-8">
                <p class="text-zinc-400">Loading payments...</p>
              </div>

              <div v-else-if="payments.length === 0" class="text-center py-8">
                <p class="text-zinc-400">No payments recorded yet</p>
              </div>

              <div v-else class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="border-b border-zinc-800">
                      <th class="text-left py-3 px-4 text-sm font-medium text-zinc-400">Date</th>
                      <th class="text-left py-3 px-4 text-sm font-medium text-zinc-400">Amount</th>
                      <th class="text-left py-3 px-4 text-sm font-medium text-zinc-400">Method</th>
                      <th class="text-left py-3 px-4 text-sm font-medium text-zinc-400">Notes</th>
                      <th class="text-right py-3 px-4 text-sm font-medium text-zinc-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="payment in payments" 
                      :key="payment.payment_id"
                      class="border-b border-zinc-800/50 hover:bg-zinc-800/30"
                    >
                      <td class="py-3 px-4 text-zinc-300">{{ formatDate(payment.payment_date) }}</td>
                      <td class="py-3 px-4 text-green-400 font-medium">Rs. {{ payment.amount.toLocaleString() }}</td>
                      <td class="py-3 px-4 text-zinc-300 capitalize">{{ payment.payment_method }}</td>
                      <td class="py-3 px-4 text-zinc-400 text-sm">{{ payment.notes || '-' }}</td>
                      <td class="py-3 px-4 text-right">
                        <button 
                          v-if="authStore.user?.role !== 'client'"
                          @click="deletePayment(payment.payment_id)"
                          class="text-red-400 hover:text-red-300 text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Error State -->
          <div v-else class="text-center py-12">
            <div class="text-4xl mb-4">❌</div>
            <p class="text-zinc-400">Event not found</p>
          </div>
        </div>
      </main>
    </div>

    <!-- Payment Modal -->
    <div v-if="showPaymentModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div class="bg-zinc-900 rounded-lg border border-zinc-800 max-w-md w-full">
        <div class="p-6 border-b border-zinc-800">
          <h2 class="text-2xl font-bold text-zinc-100">Record Payment</h2>
        </div>

        <form @submit.prevent="savePayment" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">Amount *</label>
            <input 
              v-model.number="paymentForm.amount"
              type="number"
              step="0.01"
              required
              class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              placeholder="0.00"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">Payment Method *</label>
            <select 
              v-model="paymentForm.payment_method"
              required
              class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              <option value="">Select Method</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="online">Online</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">Payment Date *</label>
            <input 
              v-model="paymentForm.payment_date"
              type="date"
              required
              class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">Notes</label>
            <textarea 
              v-model="paymentForm.notes"
              rows="3"
              class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              placeholder="Additional notes..."
            ></textarea>
          </div>

          <div class="flex gap-4 pt-4">
            <button 
              type="button"
              @click="closePaymentModal"
              class="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              :disabled="savingPayment"
              class="flex-1 px-6 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-zinc-700 text-white rounded-lg font-medium transition"
            >
              {{ savingPayment ? 'Saving...' : 'Save Payment' }}
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

const route = useRoute();
const authStore = useAuthStore();
const eventId = route.params.id;

const event = ref<any>(null);
const payments = ref<any[]>([]);
const services = ref<any[]>([]);
const activities = ref<any[]>([]);
const loading = ref(true);
const loadingPayments = ref(true);
const showPaymentModal = ref(false);
const savingPayment = ref(false);
const selectedStatus = ref('');

// Create a computed property for financials
const financials = computed(() => {
  return event.value?.financials || {};
});

const paymentForm = ref({
  amount: null as number | null,
  payment_method: '',
  payment_type: '',
  reference_number: '',
  payment_date: new Date().toISOString().split('T')[0],
  notes: ''
});

const fetchEvent = async () => {
  try {
    loading.value = true;
    
    const response = await $fetch<any>(`/api/events/${eventId}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    
    console.log('API Response:', response); // Debug log
    console.log('Event financials:', response.event?.financials); // Debug log
    
    event.value = response.event || response.data;
    payments.value = response.payments || [];
    services.value = response.services || [];
    activities.value = response.activities || [];
  } catch (error: any) {
    console.error('Failed to fetch event:', error);
    if (error.statusCode === 401) {
      authStore.logout();
      navigateTo('/auth/login');
    }
  } finally {
    loading.value = false;
    loadingPayments.value = false;
  }
};

const openPaymentModal = () => {
  paymentForm.value = {
    amount: financials.value?.balance || null,
    payment_method: '',
    payment_type: '',
    reference_number: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: ''
  };
  showPaymentModal.value = true;
};

const closePaymentModal = () => {
  showPaymentModal.value = false;
};

const savePayment = async () => {
  try {
    savingPayment.value = true;

    const response = await $fetch<any>('/api/payments', {
      method: 'POST',
      body: {
        event_id: eventId,
        amount: paymentForm.value.amount,
        payment_method: paymentForm.value.payment_method,
        payment_type: paymentForm.value.payment_type,
        reference_number: paymentForm.value.reference_number || null
      },
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });

    closePaymentModal();
    
    // Show auto-confirm message if event was auto-confirmed
    if (response.eventConfirmed) {
      alert('✅ Payment recorded successfully! Event has been automatically confirmed as fully paid.');
    }
    
    await fetchEvent(); // Re-fetch all data to get updated financials
  } catch (error: any) {
    console.error('Failed to save payment:', error);
    alert(error.data?.message || 'Failed to save payment');
  } finally {
    savingPayment.value = false;
  }
};

const deletePayment = async (paymentId: number) => {
  if (!confirm('Are you sure you want to delete this payment?')) return;

  try {
    await $fetch(`/api/payments/${paymentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });

    await fetchEvent(); // Re-fetch to get updated financials
  } catch (error: any) {
    console.error('Failed to delete payment:', error);
    alert(error.data?.message || 'Failed to delete payment');
  }
};

const updateStatus = async () => {
  if (!selectedStatus.value) return;
  
  if (!confirm(`Are you sure you want to change status to "${selectedStatus.value}"?`)) {
    selectedStatus.value = '';
    return;
  }

  try {
    const response = await $fetch(`/api/events/${eventId}/status`, {
      method: 'PUT',
      body: {
        status: selectedStatus.value,        // <--- add this
        user_id: authStore.user?.userId
      },
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });

    if (response.success) {
      alert('✅ Event status updated successfully!');
      await fetchEvent(); // Refresh event data
    }
  } catch (error: any) {
    console.error('Failed to update status:', error);
    alert(error.data?.message || 'Failed to update status');
  } finally {
    selectedStatus.value = '';
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
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

const calculateServicesTotal = () => {
  return services.value.reduce((total, service) => {
    // Coerce values to numbers and default to 0 to avoid NaN
    const qty = Number(service.quantity) || 0;
    const price = Number(service.agreed_price) || 0;
    const rawSubtotal = service.subtotal !== undefined && service.subtotal !== null
      ? Number(service.subtotal)
      : NaN;

    const subtotal = Number.isFinite(rawSubtotal) ? rawSubtotal : qty * price;
    return total + (Number.isFinite(subtotal) ? subtotal : 0);
  }, 0);
};

onMounted(() => {
  if (!authStore.user) {
    navigateTo('/auth/login');
  } else {
    fetchEvent();
  }
});
</script>
