/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        space: {
          950: '#040910',
          900: '#07111F', // primary background
          850: '#0B1728',
          800: '#0D1B2A', // secondary surface
          700: '#152942',
          600: '#1E3A5F',
        },
        cyan: {
          glow: '#00D9FF',
          dark: '#0099b8',
        },
        emergency: {
          red: '#FF3B4F',
          darkRed: '#D62235',
          glow: '#FF5E6F',
        },
        rescue: {
          green: '#32E875',
          darkGreen: '#23B558',
        },
        amber: {
          warning: '#FFB800',
        },
        cool: {
          grey: '#9FB3C8',
          light: '#E2EDF8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 2s linear infinite',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
