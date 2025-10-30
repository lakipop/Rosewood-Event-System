/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme with zinc base (already included by default)
        // Rose primary colors
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899', // Rose
          600: '#db2777',
          700: '#be185d',
          800: '#9f1239',
          900: '#881337',
          950: '#500724',
        },
        // Wooden natural secondary colors
        secondary: {
          50: '#faf5f0',
          100: '#f5ebe0',
          200: '#e8d5c4',
          300: '#d6b99f',
          400: '#c4a07a', // Wooden natural
          500: '#a67c52',
          600: '#8b6342',
          700: '#704f35',
          800: '#5a3f2b',
          900: '#4a3324',
          950: '#2d1f16',
        }
      }
    },
  },
  plugins: [],
  darkMode: 'class'
}
