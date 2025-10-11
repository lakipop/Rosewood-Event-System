<template>
  <NuxtLayout name="default">
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
              <p class="text-3xl font-bold text-zinc-100 mt-2">{{ eventsStore.events.length }}</p>
            </div>
            <span class="text-4xl">📅</span>
          </div>
        </div>

        <div class="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-zinc-400 text-sm">Upcoming Events</p>
              <p class="text-3xl font-bold text-zinc-100 mt-2">{{ eventsStore.upcomingEvents.length }}</p>
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
          <NuxtLink
            to="/events/create"
            class="flex items-center gap-3 p-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition"
          >
            <span class="text-2xl">➕</span>
            <span class="text-zinc-100">Create New Event</span>
          </NuxtLink>

          <NuxtLink
            to="/events"
            class="flex items-center gap-3 p-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition"
          >
            <span class="text-2xl">📋</span>
            <span class="text-zinc-100">View All Events</span>
          </NuxtLink>

          <NuxtLink
            to="/services"
            class="flex items-center gap-3 p-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition"
          >
            <span class="text-2xl">🛎️</span>
            <span class="text-zinc-100">Browse Services</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const eventsStore = useEventsStore()

// Redirect if not authenticated
if (!authStore.isAuthenticated) {
  navigateTo('/auth/login')
}

// Fetch events on mount
onMounted(async () => {
  await eventsStore.fetchEvents()
})
</script>
