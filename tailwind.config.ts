import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#6355D8',
          'purple-hover': '#5446C9',
          'purple-dark': '#4A36B8',
          'purple-deep': '#372498',
          'purple-light': '#7C5CFC',
          'purple-soft': '#F5F3FF',
          'purple-subtle': '#EDE9FE',
          'purple-border': '#DDD6FE',
        },
        bca: {
          gold: '#B8860B',
          'gold-hover': '#996F08',
          'gold-subtle': '#FEF9C3',
          'gold-border': '#FDE047',
          navy: '#0F172A',
          slate: '#334155',
        },
      },
      boxShadow: {
        'duo': '0 4px 0 0 #4A36B8',
        'duo-slate': '0 4px 0 0 #CBD5E1',
        'duo-sm': '0 3px 0 0 #4A36B8',
        'duo-active': '0 1px 0 0 #4A36B8',
      },
    },
  },
  plugins: [],
};

export default config;
