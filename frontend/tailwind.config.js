/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pastel-purple': '#8B7DC1',
        'pastel-teal': '#A8D8D8',
        'pastel-pink': '#F7B8C8',
        'pastel-neutral': '#F5F3FF',
        'child': {
          1: '#FFB6D9',
          2: '#B4D7FF',
          3: '#C1FFD7',
          4: '#FFE4B5',
          5: '#E6D7FF',
          6: '#FFD9B3',
          7: '#D4F1F4',
          8: '#FFE6CC',
        }
      },
      backdropBlur: {
        'glass': '10px',
      }
    },
  },
  plugins: [],
}
