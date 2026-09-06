/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      },
      colors: {
        sage: {
          50: '#f3f8f2',
          100: '#e4efe3',
          200: '#c8ddc6',
          300: '#a7c4a5',
          400: '#7fa77d',
          500: '#5f885c',
          600: '#4b7149',
          700: '#395a3b',
          800: '#2b4630',
          900: '#1c3326',
          950: '#10231b',
        },
        cream: {
          50: '#fffefa',
          100: '#f8f7f1',
          200: '#efefe6',
          300: '#e3e5d8',
        },
        ink: {
          900: '#17221b',
          800: '#1e2c23',
          700: '#2a3b2e',
        },
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      boxShadow: {
        soft: '0 2px 12px rgba(45, 74, 49, 0.08)',
        card: '0 4px 24px rgba(45, 74, 49, 0.10)',
        float: '0 8px 32px rgba(45, 74, 49, 0.15)',
        neon: '0 0 8px rgba(157, 118, 212, 0.6), 0 0 24px rgba(124, 77, 196, 0.4)',
        'neon-strong': '0 0 12px rgba(157, 118, 212, 0.8), 0 0 36px rgba(124, 77, 196, 0.5), 0 0 60px rgba(124, 77, 196, 0.3)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'count-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'neon-pulse': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.85', filter: 'brightness(1.15)' },
        },
        'rainbow-shift': {
          '0%': { filter: 'hue-rotate(0deg)' },
          '100%': { filter: 'hue-rotate(360deg)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'scale-in': 'scale-in 0.25s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'count-up': 'count-up 0.6s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'neon-pulse': 'neon-pulse 3s ease-in-out infinite',
        'rainbow-shift': 'rainbow-shift 8s linear infinite',
      },
    },
  },
  plugins: [
    function ({ addVariant }) {
      addVariant('neon', '&:is(.neon *)');
    },
  ],
};
