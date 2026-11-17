/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        royal: '#5B21B6',
        gold: {
          200: '#FFEFB0',
          300: '#FFE45C',
          400: '#FFD700',
          500: '#EDC500',
          600: '#C9A227',
          700: '#A8861D',
          900: '#4A3B0A',
        },
      },
    },
  },
  plugins: [],
};
