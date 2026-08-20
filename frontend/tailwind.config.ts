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
        // Groupon brand green
        primary: {
          DEFAULT: '#53A318',
          dark: '#438F10',
          light: '#EFF7E6',
        },
        // Groupon uses green for everything; accent is for urgency only
        accent: {
          DEFAULT: '#E31837',
          hover: '#C01430',
        },
        groupon: {
          green: '#53A318',
          'green-dark': '#438F10',
          'green-light': '#EFF7E6',
          text: '#1A1A1A',
          muted: '#636366',
          border: '#E0E0E0',
          bg: '#F5F5F5',
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'Arial', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'Inter', 'Arial', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 4px rgba(0,0,0,0.10)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.14)',
        nav: '0 2px 8px rgba(0,0,0,0.10)',
        dropdown: '0 8px 24px rgba(0,0,0,0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-in-out',
        'slide-down': 'slideDown 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
