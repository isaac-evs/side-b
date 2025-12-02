/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'mea-culpa': ['"Mea Culpa"', 'cursive'],
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        'mood-joy': '#FFD93D',
        'mood-calm': '#6BCB77',
        'mood-sad': '#4D96FF',
        'mood-stress': '#FF6B6B',
      }
    },
  },
  plugins: [],
};
