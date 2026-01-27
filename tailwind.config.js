/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4CAF50',
        'primary-hover': '#45a049',
        'primary-light': '#a5d6a7',
        secondary: '#3498db',
        danger: '#ff5252',
        'danger-hover': '#ff1744',
      }
    },
  },
  plugins: [],
}
