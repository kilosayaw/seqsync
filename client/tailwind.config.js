// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Crucial line
  ],
  theme: {
    extend: {
      gridTemplateColumns: { // If you use grid-cols-16
        '16': 'repeat(16, minmax(0, 1fr))',
      },
      // Add custom fonts if needed
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', "Liberation Mono", "Courier New", 'monospace'],
        // Add Orbitron or other specific fonts here if you've imported them
      },
    },
  },
  plugins: [],
}