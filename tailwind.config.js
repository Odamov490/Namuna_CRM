/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      animation: {
        'slide-in':   'slideIn 0.25s ease-out',
        'fade-in':    'fadeIn 0.2s ease-out',
        'scale-in':   'scaleIn 0.2s ease-out',
        'pulse-ring': 'pulseRing 1.8s ease-out infinite',
        'scan':       'scan 2s ease-in-out infinite alternate',
        'shimmer':    'shimmer 1.5s infinite',
      },
      keyframes: {
        slideIn:   { from: { opacity: 0, transform: 'translateY(-6px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        scaleIn:   { from: { opacity: 0, transform: 'scale(0.95)' }, to: { opacity: 1, transform: 'scale(1)' } },
        pulseRing: { '0%': { transform: 'scale(1)', opacity: 0.8 }, '100%': { transform: 'scale(1.5)', opacity: 0 } },
        scan:      { '0%': { top: '8%' }, '100%': { top: '88%' } },
        shimmer:   { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
      },
      boxShadow: {
        'card':  '0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)',
        'card-hover': '0 4px 16px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.04)',
        'modal': '0 20px 60px rgba(0,0,0,.18)',
        'nav':   '0 1px 0 rgba(0,0,0,.06)',
        'toast': '0 8px 24px rgba(0,0,0,.12)',
      },
    },
  },
  plugins: [],
};
