/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        game: ['Rajdhani', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        void: '#0a1125',
      }
    },
  },
  plugins: [],
}
