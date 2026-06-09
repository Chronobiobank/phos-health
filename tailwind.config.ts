import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        eggplant: '#523b50',
        'eggplant-dark': '#3a2838',
        lilac: '#c8a2c8',
        silver: '#c0c0c0',
        'off-white': '#f8f6f4',
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        mono: ['var(--font-dm-mono)', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
