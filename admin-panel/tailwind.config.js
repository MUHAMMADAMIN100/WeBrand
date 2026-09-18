const INK = {
  50: '#F6F7F9',
  100: '#ECEEF1',
  200: '#DCDFE5',
  300: '#BEC2CC',
  400: '#9197A5',
  500: '#6B7180',
  600: '#565C6B',
  700: '#2A2F3C',
  800: '#1A1E28',
  900: '#11141B',
  950: '#0B0D12',
}

/** @type {import('tailwindcss').Config} */
export default {
  // hover only where a pointer can hover — on a phone a tapped row would
  // otherwise keep its hover tint until the next tap.
  future: { hoverOnlyWhenSupported: true },
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Same brand scale as the public site — anchored to logo blue #2B5ED3 = brand-600.
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
        // The site's near-black, tinted toward the brand hue. Bound to `neutral`
        // on purpose: every existing `neutral-*` class in the app picks up the
        // new tone at once, and new code may say `ink-*` where it means it.
        ink: INK,
        neutral: INK,
        // Cool near-white page (light theme); pure white stays for raised cards.
        paper: { DEFAULT: '#F4F6FA', 2: '#E8ECF3' },
        // The one loud accent — a marker, never body text on a light surface.
        lime: { soft: '#E9FAB0', DEFAULT: '#C8F135', deep: '#A9D414' },
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
        // Page titles and the dashboard's numbers only — a work tool, not a poster.
        display: ['Unbounded', 'Manrope', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.04), 0 12px 28px -18px rgba(16,24,40,0.18)',
        drawer: '-24px 0 60px -24px rgba(16,24,40,0.30)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-in': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'chip-in': { from: { opacity: '0', transform: 'scale(0.85)' }, to: { opacity: '1', transform: 'scale(1)' } },
        'chip-out': { from: { opacity: '1', transform: 'scale(1)' }, to: { opacity: '0', transform: 'scale(0.85)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in': 'slide-in 0.28s cubic-bezier(0.16,1,0.3,1)',
        'toast-in': 'toast-in 0.25s cubic-bezier(0.16,1,0.3,1)',
        'chip-in': 'chip-in 0.12s ease-out',
        'chip-out': 'chip-out 0.12s ease-in forwards',
      },
    },
  },
  plugins: [],
}
