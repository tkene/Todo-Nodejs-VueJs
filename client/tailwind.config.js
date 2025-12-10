/** @type {import('tailwindcss').Config} */

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary) !important',
        secondary: 'var(--secondary) !important', 
        accent: 'var(--accent) !important',
        dark: 'var(--dark) !important',
        darkLight: 'var(--dark-light) !important',
        positive: 'var(--positive) !important',
        negative: 'var(--negative) !important',
        info: 'var(--info) !important',
        warning: 'var(--warning) !important'
      },
      fontSize: {
        'lg': '1.0625rem',   // 17px
        'xl': '1.25rem',     // 20px
      },
      height: {
        '15': '30px',
        '18': '44px',
        '20': '50px',
        '24': '64px',
        '30': '75px',
        '32': '94px',
      },
      width: {
        '15': '30px',
        '18': '44px',
        '20': '50px',
        '24': '64px',
        '30': '75px',
        '32': '94px',
      },
    },
  },
  plugins: [
  ],
  safelist: [
    'bg-primary',
    'bg-secondary',
    'bg-accent',
    'bg-dark',
    'bg-darkLight',
    'bg-positive',
    'bg-negative',
    'bg-info',
    'bg-warning',
    'border-primary',
    'border-secondary',
    'border-accent',
    'border-dark',
    'border-darkLight',
    'border-positive',
    'border-negative',
    'border-info',
    'border-warning',
  ],
}
