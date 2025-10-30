<template>
  <div class="min-h-screen bg-zinc-800">
    <AppHeader />
    
    <div class="flex pt-16">
      <AppSidebar />
      
      <main class="flex-1 ml-64 p-8">
        <div class="max-w-7xl mx-auto">
          <!-- Header -->
          <div class="flex justify-between items-center mb-8">
            <div>
              <h1 class="text-3xl font-bold text-white mb-2">💳 Payments</h1>
              <p class="text-zinc-400">Track and manage event payments</p>
            </div>
            
            <div class="flex gap-3">
              <button 
                @click="fetchPayments"
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
                ➕ Record Payment
              </button>
            </div>
          </div>

          <!-- Filter -->
          <div class="mb-6 flex gap-4">
            <select 
              v-model="selectedStatus"
              class="px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            <select 
              v-model="selectedType"
              class="px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg"
            >
              <option value="">All Payment Types</option>
              <option value="advance">Advance</option>
              <option value="partial">Partial</option>
              <option value="final">Final</option>
            </select>

            <select 
              v-model="selectedMethod"
              class="px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg"
            >
              <option value="">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="online">Online</option>
            </select>
          </div>

          <!-- Payments Table -->
          <div v-if="loading" class="text-center py-12">
            <div class="text-zinc-400">Loading payments...</div>
          </div>

          <div v-else-if="error" class="bg-red-900/20 border border-red-900 text-red-400 p-4 rounded-lg">
            {{ error }}
          </div>

          <div v-else class="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <table class="w-full">
              <thead class="bg-zinc-800 border-b border-zinc-700">
                <tr>
                  <th class="text-left px-6 py-4 text-sm font-medium text-zinc-300">ID</th>
                  <th class="text-left px-6 py-4 text-sm font-medium text-zinc-300">Event</th>
                  <th class="text-left px-6 py-4 text-sm font-medium text-zinc-300">Amount</th>
                  <th class="text-left px-6 py-4 text-sm font-medium text-zinc-300">Method</th>
                  <th class="text-left px-6 py-4 text-sm font-medium text-zinc-300">Type</th>
                  <th class="text-left px-6 py-4 text-sm font-medium text-zinc-300">Status</th>
                  <th class="text-left px-6 py-4 text-sm font-medium text-zinc-300">Date</th>
                  <th class="text-left px-6 py-4 text-sm font-medium text-zinc-300">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-800">
                <tr 
                  v-for="payment in filteredPayments" 
                  :key="payment.payment_id"
                  class="hover:bg-zinc-800/50 transition"
                >
                  <td class="px-6 py-4 text-zinc-300">#{{ payment.payment_id }}</td>
                  <td class="px-6 py-4">
                    <div class="text-white font-medium">Event #{{ payment.event_id }}</div>
                    <div class="text-sm text-zinc-500">{{ payment.description || 'No description' }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-xl font-bold text-primary-500 text-amber-100">
                      Rs. {{ formatNumber(payment.amount) }}
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded-full capitalize">
                      {{ formatPaymentType(payment.payment_method) }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-1 bg-purple-900/30 text-purple-300 text-xs rounded-full capitalize">
                      {{ payment.payment_type }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span 
                      :class="getStatusClass(payment.status)"
                      class="px-2 py-1 text-xs rounded-full capitalize text-zinc-100"
                    >
                      {{ payment.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-zinc-400 text-sm">
                    {{ formatDate(payment.payment_date) }}
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex gap-2">
                      <button 
                        v-if="authStore.user?.role !== 'client'"
                        @click="editPayment(payment)"
                        class="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded text-sm"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        v-if="authStore.user?.role === 'admin'"
                        @click="deletePayment(payment.payment_id)"
                        class="px-3 py-1 bg-red-900 hover:bg-red-800 text-white rounded text-sm"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Empty State -->
            <div v-if="filteredPayments.length === 0" class="text-center py-12">
              <div class="text-6xl mb-4">💳</div>
              <h3 class="text-xl font-semibold text-white mb-2">No payments found</h3>
              <p class="text-zinc-400">Try adjusting your filters or record a new payment</p>
            </div>
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
          {{ editingPayment ? '✏️ Edit Payment' : '➕ Record New Payment' }}
        </h2>

        <!-- Error Message -->
        <div v-if="error" class="mb-4 p-4 bg-red-900/20 border border-red-800 text-red-400 rounded-lg">
          {{ error }}
        </div>

        <form @submit.prevent="savePayment" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">Event ID *</label>
            <input 
              v-model.number="formData.event_id"
              type="number"
              required
              class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              placeholder="Enter event ID"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">Amount *</label>
            <input 
              v-model.number="formData.amount"
              type="number"
              step="0.01"
              required
              class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              placeholder="e.g., 50000.00"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">Payment Method *</label>
            <select 
              v-model="formData.payment_method"
              required
              class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            >
              <option value="">Select method</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="online">Online</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">Payment Type <span class="text-zinc-500">(Optional - auto-calculated)</span></label>
            <select 
              v-model="formData.payment_type"
              class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            >
              <option value="">Auto-calculate based on amount</option>
              <option value="advance">Advance (Booking deposit)</option>
              <option value="partial">Partial (Mid-payment)</option>
              <option value="final">Final (Complete payment)</option>
            </select>
            <p class="text-xs text-zinc-500 mt-2">
              Leave blank to auto-calculate: Advance if first payment, Partial if partial, Final if remaining balance is covered
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">Status *</label>
            <select 
              v-model="formData.status"
              required
              class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">Payment Date *</label>
            <input 
              v-model="formData.payment_date"
              type="date"
              required
              class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">Description</label>
            <textarea 
              v-model="formData.description"
              rows="3"
              class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              placeholder="Optional payment notes..."
            ></textarea>
          </div>

          <div class="flex gap-4 pt-4">
            <button
              type="submit"
              :disabled="submitting"
              class="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg font-medium transition"
            >
              {{ submitting ? 'Saving...' : (editingPayment ? 'Update Payment' : 'Record Payment') }}
            </button>
            <button
              type="button"
              @click="closeModal"
              class="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition"
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

// State
const payments = ref<any[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const showAddModal = ref(false);
const editingPayment = ref<any>(null);
const submitting = ref(false);

// Filters
const selectedStatus = ref('');
const selectedType = ref('');
const selectedMethod = ref('');

// Form data
const formData = ref({
  event_id: 0,
  amount: 0,
  payment_method: '',
  payment_type: '',
  status: 'pending',
  payment_date: new Date().toISOString().split('T')[0],
  description: ''
});

// Computed
const filteredPayments = computed(() => {
  let filtered = payments.value;

  if (selectedStatus.value) {
    filtered = filtered.filter(p => p.status === selectedStatus.value);
  }

  if (selectedType.value) {
    filtered = filtered.filter(p => p.payment_type === selectedType.value);
  }

  if (selectedMethod.value) {
    filtered = filtered.filter(p => p.payment_method === selectedMethod.value);
  }

  return filtered;
});

// Methods
const fetchPayments = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await $fetch<any>('/api/payments', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });

    payments.value = response.data || [];
  } catch (err: any) {
    console.error('Failed to fetch payments:', err);
    error.value = err.data?.message || 'Failed to load payments';

    if (err.statusCode === 401) {
      authStore.logout();
      navigateTo('/auth/login');
    }
  } finally {
    loading.value = false;
  }
};

const savePayment = async () => {
  try {
    submitting.value = true;
    error.value = null;

    // Validate required fields (payment_type is now optional - it will be calculated)
    if (!formData.value.event_id || !formData.value.amount || !formData.value.payment_method) {
      error.value = 'Please fill in all required fields (Event ID, Amount, and Payment Method)';
      return;
    }

    console.log('Sending payment data:', formData.value);

    if (editingPayment.value) {
      // Update existing payment
      const response = await $fetch(`/api/payments/${editingPayment.value.payment_id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authStore.token}`
        },
        body: formData.value
      });
      console.log('Payment updated:', response);
    } else {
      // Create new payment
      console.log('Creating NEW payment with form data:', {
        event_id: formData.value.event_id,
        amount: formData.value.amount,
        payment_method: formData.value.payment_method,
        payment_type: formData.value.payment_type,
        payment_type_isEmpty: !formData.value.payment_type,
        payment_type_length: formData.value.payment_type?.length
      });
      const response = await $fetch('/api/payments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authStore.token}`
        },
        body: formData.value
      });
      console.log('Payment created:', response);
    }

    closeModal();
    await fetchPayments();
  } catch (err: any) {
    console.error('Failed to save payment:', err);
    error.value = err.data?.message || 'Failed to save payment';
  } finally {
    submitting.value = false;
  }
};

const editPayment = (payment: any) => {
  editingPayment.value = payment;
  formData.value = {
    event_id: payment.event_id,
    amount: payment.amount,
    payment_method: payment.payment_method,
    payment_type: payment.payment_type,
    status: payment.status,
    payment_date: payment.payment_date?.split('T')[0] || new Date().toISOString().split('T')[0],
    description: payment.description || ''
  };
  showAddModal.value = true;
};

const deletePayment = async (paymentId: number) => {
  if (!confirm('Are you sure you want to delete this payment?')) {
    return;
  }

  try {
    await useFetch(`/api/payments/${paymentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });

    await fetchPayments();
  } catch (err: any) {
    console.error('Failed to delete payment:', err);
    error.value = err.data?.message || 'Failed to delete payment';
  }
};

const closeModal = () => {
  showAddModal.value = false;
  editingPayment.value = null;
  formData.value = {
    event_id: 0,
    amount: 0,
    payment_method: '',
    payment_type: '',
    status: 'pending',
    payment_date: new Date().toISOString().split('T')[0],
    description: ''
  };
};

// Formatters
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatPaymentType = (type: string) => {
  return type.replace('_', ' ');
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    'pending': 'bg-yellow-900/30 text-yellow-400',
    'completed': 'bg-green-900/30 text-green-400',
    'failed': 'bg-red-900/30 text-red-400'
  };
  return classes[status] || 'bg-zinc-700 text-zinc-400';
};

// Lifecycle
onMounted(() => {
  if (!authStore.user || !authStore.token) {
    navigateTo('/auth/login');
  } else {
    fetchPayments();
  }
});
</script>
