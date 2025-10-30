// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  
  devServer: {
    port: 3001
  },
  
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxt/icon'
  ],

  css: ['~/assets/css/tailwind.css'],

  ui: {
    theme: {
      colors: ['primary', 'secondary']
    }
  },

  colorMode: {
    preference: 'dark'
  },

  runtimeConfig: {
    // Private keys (server-only)
    dbHost: process.env.DB_HOST,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    dbPort: process.env.DB_PORT,
    jwtSecret: process.env.JWT_SECRET,

    // Public keys (exposed to client)
    public: {
      apiBase: '/api'
    }
  },

  app: {
    head: {
      title: 'Rosewood Event System',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Professional Event Management System' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌹</text></svg>' }
      ]
    }
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false
    }
  ],

  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
    },
  }
})
