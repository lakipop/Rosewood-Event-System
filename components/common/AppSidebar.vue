<template>
  <aside class="w-64 bg-zinc-900 border-r border-zinc-800 min-h-screen">
    <nav class="p-4 space-y-2">
      <NuxtLink
        to="/"
        class="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition"
      >
        <span class="text-xl">📊</span>
        <span>Dashboard</span>
      </NuxtLink>

      <NuxtLink
        to="/events"
        class="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition"
      >
        <span class="text-xl">📅</span>
        <span>Events</span>
      </NuxtLink>

      <NuxtLink
        to="/services"
        class="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition"
      >
        <span class="text-xl">🛎️</span>
        <span>Services</span>
      </NuxtLink>

      <NuxtLink
        to="/payments"
        class="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition"
      >
        <span class="text-xl">💳</span>
        <span>Payments</span>
      </NuxtLink>
    </nav>
  </aside>
</template>
