// tailwind.config.js
/** @type {import('tailwindcss').Config} */

// Removed the toRGB helper function as it's not directly used by Tailwind's config
// when CSS variables are defined in global CSS.

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This covers all your relevant files
  ],
  theme: {
    extend: {
      colors: {
        // Base brand colors using HEX codes (good for direct use or defining CSS vars)
        'brand-accent-base': '#00F2EA',
        'brand-pos-base': '#FACC15',
        'brand-seq-base': '#3B82F6',
        'brand-sync-base': '#A855F7',

        // Referencing CSS variables (defined in index.css) for Tailwind utility classes with opacity
        // Example: bg-brand-accent/80 will use var(--color-brand-accent-rgb) with 0.8 opacity
        'brand-accent': 'rgba(var(--color-brand-accent-rgb), <alpha-value>)',
        'brand-pos':    'rgba(var(--color-brand-pos-rgb), <alpha-value>)',
        'brand-seq':    'rgba(var(--color-brand-seq-rgb), <alpha-value>)',
        'brand-sync':   'rgba(var(--color-brand-sync-rgb), <alpha-value>)',
        
        // Your existing dark theme palette
        'dark-bg': '#111827',       // Main background (e.g., gray-900)
        'light-bg': '#1F2937',      // Slightly lighter background elements (e.g., gray-800)
        'element-bg': '#374151',    // For inputs, some buttons (e.g., gray-700)
        'element-hover': '#4B5563', // Hover states for elements (e.g., gray-600)
        'border-color': '#4B5563',  // Borders (e.g., gray-600)
        'text-primary': '#F3F4F6',    // Primary text (e.g., gray-100)
        'text-secondary': '#D1D5DB',  // Secondary text (e.g., gray-300)
        'text-muted': '#9CA3AF',      // Muted text (e.g., gray-400)
      },
      fontFamily: {
        // Keep your existing sans-serif default and Orbitron
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
        
        // Your existing digital font (Share Tech Mono based)
        digital: ['"Share Tech Mono"', 'Orbitron', 'monospace'], // Ensure quotes if font name has spaces

        // --- ADDED CUSTOM DIGITAL PLAY FONTS ---
        'digital-play': ['"Digital Play"', '"Share Tech Mono"', 'monospace'], // Added quotes for "Digital Play"
        'digital-play-hollow': ['"Digital Play Hollow"', '"Share Tech Mono"', 'monospace'], // Added quotes
        // --- END ADDED CUSTOM DIGITAL PLAY FONTS ---
      },
      boxShadow: {
        'top': '0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -2px rgba(0, 0, 0, 0.1)',
        'beat-pad': '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05), inset 0 -1px 1px rgba(0,0,0,0.2)',
        'transport': '0 3px 6px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.03)',
        // You can add more custom shadows here if needed
      },
      animation: {
        'pulse-border-white': 'pulse-border-white 1.5s infinite ease-in-out',
        // Add other custom animations
      },
      keyframes: {
        'pulse-border-white': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.7), 0 0 0 0 rgba(255, 255, 255, 0.7)' },
          '50%': { boxShadow: '0 0 0 4px rgba(255, 255, 255, 0), 0 0 0 2px rgba(255, 255, 255, 0.5)' },
        }
        // Add other keyframes
      },
      fontSize: {
        'xxs': '0.65rem', // 10.4px - Useful for very small text
        // You can add more custom font sizes
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Good for form styling resets
    require('tailwind-scrollbar'), // If you are using this plugin, ensure it's installed
    // Add other Tailwind plugins here if you use them
  ],
}