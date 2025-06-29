// tailwind.config.js
/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Covers all your relevant files
  ],
  theme: {
    extend: {
      colors: {
        // --- Brand Colors (Direct HEX for Base & Utility Classes) ---
        // These can be used directly like `bg-brand-accent` or `text-brand-pos`
        // For opacity, Tailwind automatically handles it: `bg-brand-accent/80`
        // No need for the rgba(var(...), <alpha-value>) setup if you define them directly here,
        // unless you have a strong reason to keep CSS variables for other purposes (like JS access).
        // Using direct HEX here simplifies Tailwind usage for these specific brand colors.
        'brand-accent': '#00F2EA', // Teal/Cyan like
        'brand-pos':    '#FACC15', // Yellow/Gold
        'brand-seq':    '#3B82F6', // Blue
        'brand-sync':   '#A855F7', // Purple

        // You can still keep the CSS variable setup if you prefer, but direct definition is often cleaner
        // for Tailwind. If keeping CSS vars, ensure they are correctly defined in your global CSS.
        // 'brand-accent-css': 'rgba(var(--color-brand-accent-rgb), <alpha-value>)', // Example if keeping
        
        // --- Dark Theme Palette (Your existing is good) ---
        'dark-bg': '#111827',       // e.g., bg-gray-900 equivalent
        'light-bg': '#1F2937',      // e.g., bg-gray-800
        'element-bg': '#374151',    // e.g., bg-gray-700
        'element-hover': '#4B5563', // e.g., bg-gray-600
        'border-color': '#4B5563',  // e.g., border-gray-600
        'text-primary': '#F3F4F6',    // e.g., text-gray-100
        'text-secondary': '#D1D5DB',  // e.g., text-gray-300
        'text-muted': '#9CA3AF',      // e.g., text-gray-400

        // --- Specific UI Element Colors (as needed by Button variants or other components) ---
        // Example: if 'pos-yellow' is distinct from 'brand-pos'
        'pos-yellow': '#FDE047', // A slightly different yellow for POS active elements
        // If brand-seq is used for SEQ buttons, it's already defined above.
        // If brand-accent is used for Shift key, it's already defined.
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
        digital: ['"Share Tech Mono"', 'Orbitron', 'monospace'], // Quotes are good
        'digital-play': ['"Digital Play"', '"Share Tech Mono"', 'monospace'],
        'digital-play-hollow': ['"Digital Play Hollow"', '"Share Tech Mono"', 'monospace'],
      },
      boxShadow: {
        'top': '0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -2px rgba(0, 0, 0, 0.1)',
        'beat-pad': '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05), inset 0 -1px 1px rgba(0,0,0,0.2)',
        'transport': '0 3px 6px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.03)',
        // Custom shadow for focused/active elements, works well with focus rings
        'focus-accent': '0 0 0 3px rgba(var(--color-brand-accent-rgb), 0.4)', // Needs --color-brand-accent-rgb CSS var
        'focus-pos': '0 0 0 3px rgba(var(--color-brand-pos-rgb), 0.4)',      // Needs --color-brand-pos-rgb CSS var
      },
      animation: {
        'pulse-border-white': 'pulse-border-white 1.5s infinite ease-in-out',
        'pulse-bg-yellow': 'pulse-bg-yellow 1.5s infinite ease-in-out', // Example for beat steps
      },
      keyframes: {
        'pulse-border-white': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.7), 0 0 0 0 rgba(255, 255, 255, 0.7)' },
          '50%': { boxShadow: '0 0 0 4px rgba(255, 255, 255, 0), 0 0 0 2px rgba(255, 255, 255, 0.5)' },
        },
        'pulse-bg-yellow': { // Example for pulsing yellow background on current beat step
          '0%, 100%': { backgroundColor: 'rgba(var(--color-brand-pos-rgb), 0.7)' }, // Assuming --color-brand-pos-rgb
          '50%': { backgroundColor: 'rgba(var(--color-brand-pos-rgb), 1.0)' },
        }
      },
      fontSize: {
        'xxs': '0.65rem', // Approx 10.4px
        'xxxs': '0.55rem', // Approx 8.8px (for very tiny labels if needed)
      },
      // Add ring colors for focus states if you want them to match brand colors
      ringColor: theme => ({
        ...theme('colors'), // Default ring colors
        DEFAULT: theme('colors.blue.500', '#3B82F6'), // Default focus ring color
        'brand-accent': theme('colors.brand-accent', '#00F2EA'),
        'brand-pos': theme('colors.brand-pos', '#FACC15'),
        'brand-seq': theme('colors.brand-seq', '#3B82F6'),
        // ... other brand ring colors
      }),
      // Add border colors for brand consistency if needed often
      borderColor: theme => ({
          ...theme('colors'),
          DEFAULT: theme('colors.gray.300', 'currentColor'),
          'brand-accent': theme('colors.brand-accent', '#00F2EA'),
          'brand-pos': theme('colors.brand-pos', '#FACC15'),
          // ...
      })
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwind-scrollbar'), // Ensure this is installed: npm install -D tailwind-scrollbar
    // Consider adding: require('tailwindcss-interaction-variants'), // For group-focus, group-active, etc.
  ],
}