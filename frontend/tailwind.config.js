/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        'primary-orange': '#ff4500',
        'accent-green': '#39ff14',
        'dark-bg': '#121212',
        'card-bg': '#1a1a1a',
        'text-light': '#e0e0e0',
        'text-dark': '#a0a0a0',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        orbitron: ['Orbitron', 'monospace'],
      },
    },
  },
  plugins: [],
}
