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
        bca: {
          gold: '#B8860B',
          'gold-hover': '#996F08',
          'gold-subtle': '#FEF9C3',
          'gold-border': '#FDE047',
          navy: '#0F172A',
          slate: '#334155',
        },
      },
    },
  },
  plugins: [],
};

export default config;
