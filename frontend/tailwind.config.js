/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif:   ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans:    ['"Jost"', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
      },
      colors: {
        ivory:     '#FAF7F2',
        blush:     '#E8C4B8',
        rose:      '#C17B6F',
        mink:      '#8B6F68',
        charcoal:  '#2C2C2C',
        champagne: '#F0E2C8',
        gold:      '#B8924A',
      },
      animation: {
        'fade-up':  'fadeUp 0.6s ease-out forwards',
        'fade-in':  'fadeIn 0.5s ease-out forwards',
        'slide-in': 'slideIn 0.4s ease-out forwards',
      },
      keyframes: {
        fadeUp:  { '0%': { opacity: 0, transform: 'translateY(24px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:  { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideIn: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
};