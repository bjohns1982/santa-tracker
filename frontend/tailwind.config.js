/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'holiday-red': '#DC2626',
        'holiday-green': '#16A34A',
        'holiday-gold': '#F59E0B',
        'holiday-snow': '#F8FAFC',
      },
      fontFamily: {
        'whimsical': ['Comic Sans MS', 'cursive'],
      },
      animation: {
        'snow': 'snow 20s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        snow: {
          '0%': { transform: 'translateY(-100vh) rotate(0deg)' },
          '100%': { transform: 'translateY(100vh) rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}

