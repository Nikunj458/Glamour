/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,css}',
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/context/**/*.{js,jsx}',
    './src/utils/**/*.{js,jsx}',
  ],
  safelist: [
    // Layout & spacing
    { pattern: /^(p|m|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr|gap|space)-./ },
    // Flex & grid
    { pattern: /^(flex|grid|inline|block|hidden|overflow)./ },
    // Colors — all custom colors
    { pattern: /^(bg|text|border|ring|fill|stroke)-(ivory|blush|rose|mink|charcoal|champagne|gold)/ },
    { pattern: /^(bg|text|border|ring|fill|stroke)-(ivory|blush|rose|mink|charcoal|champagne|gold)\/./ },
    // Sizing
    { pattern: /^(w|h|min-w|max-w|min-h|max-h)-./ },
    // Typography
    { pattern: /^(font|text|leading|tracking|italic|uppercase|lowercase|capitalize)./ },
    // Borders & rounded
    { pattern: /^(rounded|border)./ },
    // Transitions & animations
    { pattern: /^(transition|animate|duration|ease|delay)./ },
    // Position
    { pattern: /^(absolute|relative|fixed|sticky|inset|top|bottom|left|right|z)./ },
    // Display responsive
    { pattern: /^(md:|lg:|sm:|xl:)/ },
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
