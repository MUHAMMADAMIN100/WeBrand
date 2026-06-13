import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Brand scale anchored to the Webrand logo blue (#2B5ED3 = brand-600).
        // Constant hue (~222deg), smoothly descending lightness. 600/700 pass WCAG AA on white.
        brand: {
          50: '#EFF3FE',
          100: '#DCE5FC',
          200: '#B9CCF8',
          300: '#89A8F0',
          400: '#5D86E5',
          500: '#406FDB',
          600: '#2B5ED3',
          700: '#224EB4',
          800: '#193D8F',
          900: '#122C68',
        },
      },
      fontFamily: {
        // Manrope is loaded via next/font (see app/layout.tsx) and exposed as the
        // --font-manrope CSS variable so `font-sans` resolves to it.
        sans: ['var(--font-manrope)', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'float-delay': 'float 7s ease-in-out infinite 2s',
        gradient: 'gradient 6s ease infinite',
        marquee: 'marquee 40s linear infinite',
        'marquee-reverse': 'marquee-reverse 40s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(2deg)' },
        },
        gradient: {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
