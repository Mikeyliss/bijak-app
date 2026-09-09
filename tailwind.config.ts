import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        paper: '#ECE1C8',
        'paper-light': '#F8F2E2',
        'paper-dark': '#DCCEA9',
        ink: '#262220',
        'ink-soft': '#6b6255',
        highlight: '#FFCE3D',
        'red-pen': '#D9432B',
        'green-check': '#3F8E52',
        rule: '#3A5AA0'
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        hand: ['var(--font-hand)', 'cursive']
      }
    }
  },
  plugins: []
};

export default config;
