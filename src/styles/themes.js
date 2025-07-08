// src/styles/themes.js

export const themes = {
  'tr-808': {
    // Structural Colors - Corrected to be greys, not purples
    '--color-bg': '#282828',           // Dark charcoal background
    '--color-surface-1': '#434343',     // The main panel color (medium grey)
    '--color-surface-2': '#333333',     // Darker inset panels
    '--color-surface-3': '#555555',     // Lighter interactive elements
    '--color-border': 'rgba(230, 232, 191, 0.3)', // Faint border based on text color

    // Text & Accent Colors from the TR-808
    '--color-text-primary': '#E6E8BF',
    '--color-text-secondary': '#b0b2a1',
    '--color-accent-red': '#DD1D00',
    '--color-accent-orange': '#F27900',
    '--color-accent-yellow': '#DDDA00',
    '--color-accent-cream': '#E6E8BF',
    '--color-accent-green': '#3fb950',
    '--color-accent-blue': '#008fcc',
  },
  'mpc-60': {
    '--color-bg': '#D1D1D1',
    '--color-surface-1': '#E0E0E0',
    '--color-surface-2': '#C0C0C0',
    '--color-text-primary': '#1E1E1E',
    '--color-text-secondary': '#555555',
    '--color-border': '#999999',
    '--color-accent-primary': '#8CACBE', // Blue
    '--color-accent-secondary': '#F07B74', // Red
    '--color-accent-red': '#F07B74',
    '--color-accent-green': '#8CACBE',
  }
};