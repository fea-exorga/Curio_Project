/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Curio Brand Palette
        forest: {
          50:  '#f0f6f4',
          100: '#d8ece7',
          200: '#b2d9cf',
          300: '#82c0b2',
          400: '#4fa290',
          500: '#2e8674',
          600: '#216c5d',
          700: '#1d574b',
          800: '#1a453d',
          900: '#173B35',
          950: '#0d2420',
        },
        ink: '#171A19',
        offwhite: '#F7F5F0',
        sage: '#DDE5DB',
        muted: '#737A75',
        brand: '#173B35',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-gentle': 'pulseGentle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        skeleton: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(23,26,25,0.06), 0 4px 16px rgba(23,26,25,0.06)',
        'card-hover': '0 2px 8px rgba(23,26,25,0.08), 0 8px 32px rgba(23,26,25,0.10)',
        'modal': '0 8px 40px rgba(23,26,25,0.20), 0 2px 8px rgba(23,26,25,0.10)',
        'float': '0 4px 20px rgba(23,59,53,0.18)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #173B35 0%, #2e8674 100%)',
        'page-bg': 'radial-gradient(ellipse at top, #f0f6f4 0%, #F7F5F0 60%)',
      },
    },
  },
  plugins: [],
}
