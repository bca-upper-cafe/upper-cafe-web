import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bca: {
          gold: '#C5B358', // BCA Vegas Gold
          'gold-light': '#E5D68A',
          'gold-dark': '#9E8D38',
          'gold-shadow': '#7A6B25',
          dark: '#0B0E14',
          surface: '#151B23',
          'surface-elevated': '#1F2631',
          border: '#2C3442',
          text: '#F0F6FC',
          muted: '#8B949E',
        },
      },
      boxShadow: {
        'duo-gold': '0 4px 0 #7A6B25',
        'duo-active': '0 0px 0 #7A6B25',
        'duo-dark': '0 4px 0 #0E131A',
        'duo-green': '0 4px 0 #1E6B35',
      },
    },
  },
  plugins: [],
};

export default config;
