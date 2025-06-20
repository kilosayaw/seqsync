const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
// REFINEMENT: Switched to module.exports for standard CommonJS compatibility.
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Digital Play St"', 'Inter', /* ... */],
        orbitron: ['Orbitron', ...fontFamily.sans],
        hollow: ['"Digital Play Hollow St"', ...fontFamily.sans], // <-- ADD THIS
        mono: ['"Share Tech Mono"', ...fontFamily.mono],
    },
      colors: {
        'brand-accent': '#00F2EA',
        'brand-pos':    '#FACC15',
        'brand-seq':    '#3B82F6',
        'brand-sync':   '#A855F7',
        'pos-yellow':   '#FDE047',
        
        'dark-bg':      '#111827', // Use as default body background
        'light-bg':     '#1F2937',
        'element-bg':   '#374151',
        'element-hover':'#4B5563',
        'border-color': '#4B5563',
        'text-primary': '#F3F4F6', // Use as default body text color
        'text-secondary':'#D1D5DB',
        'text-muted':   '#9CA3AF',
      },
      boxShadow: {
        'transport': '0 3px 6px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.03)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwind-scrollbar'),
  ],
};