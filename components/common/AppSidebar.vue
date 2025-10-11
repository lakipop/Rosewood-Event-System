<template>
  <aside class="fixed left-0 top-0 h-screen w-64 backdrop-blur-xl bg-zinc-900/80 border-r border-zinc-800/50 hidden lg:block z-40">
    <div class="h-full flex flex-col">
      <!-- Sidebar Header Spacer -->
      <div class="h-[60px]"></div>
      
      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <NuxtLink
          to="/"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-300 hover:text-white transition group"
          active-class="bg-gradient-to-r from-primary-600/20 to-primary-700/10 text-white border-l-2 border-primary-500"
        >
          <div class="w-8 h-8 rounded-lg flex items-center justify-center transition group-hover:scale-110" style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(219, 39, 119, 0.05) 100%);">
            <svg class="w-5 h-5" style="color: #f472b6;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span class="font-medium text-sm">Dashboard</span>
        </NuxtLink>

        <NuxtLink
          to="/events"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-300 hover:text-white transition group"
          active-class="bg-gradient-to-r from-primary-600/20 to-primary-700/10 text-white border-l-2 border-primary-500"
        >
          <div class="w-8 h-8 rounded-lg flex items-center justify-center transition group-hover:scale-110" style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(219, 39, 119, 0.05) 100%);">
            <svg class="w-5 h-5" style="color: #f472b6;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span class="font-medium text-sm">Events</span>
        </NuxtLink>

        <NuxtLink
          to="/services"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-300 hover:text-white transition group"
          active-class="bg-gradient-to-r from-secondary-600/20 to-secondary-700/10 text-white border-l-2 border-secondary-500"
        >
          <div class="w-8 h-8 rounded-lg flex items-center justify-center transition group-hover:scale-110" style="background: linear-gradient(135deg, rgba(196, 160, 122, 0.1) 0%, rgba(90, 63, 43, 0.05) 100%);">
            <svg class="w-5 h-5" style="color: #c4a07a;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span class="font-medium text-sm">Services</span>
        </NuxtLink>

        <NuxtLink
          to="/payments"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-300 hover:text-white transition group"
          active-class="bg-gradient-to-r from-secondary-600/20 to-secondary-700/10 text-white border-l-2 border-secondary-500"
        >
          <div class="w-8 h-8 rounded-lg flex items-center justify-center transition group-hover:scale-110" style="background: linear-gradient(135deg, rgba(196, 160, 122, 0.1) 0%, rgba(90, 63, 43, 0.05) 100%);">
            <svg class="w-5 h-5" style="color: #c4a07a;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <span class="font-medium text-sm">Payments</span>
        </NuxtLink>
      </nav>
    </div>
  </aside>
</template>
