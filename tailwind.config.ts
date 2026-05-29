import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        // ── Design system tokens (DESIGN.md) ──────────────────────────────
        // Warm-neutral foundation + one indigo accent + three semantic colors.
        ink: '#16181d',
        'ink-soft': '#3b3f47',
        paper: '#fbfaf8',
        surface: '#ffffff',
        'surface-sunk': '#f4f2ee',
        line: '#e6e3dc',
        positive: '#1f8a55',
        caution: '#b26a00',
        alert: '#c0362c',
        // Dark-mode mirror (used via dark: prefix)
        'ink-dark': '#0e1014',
        'paper-dark': '#e8e8ea',
        'surface-dark': '#171a21',
        'surface-dark-raised': '#1f232c',
        'line-dark': '#2c313b',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
          },
        },
      },
    },
  },
  plugins: [],
}

export default config
