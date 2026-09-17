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
        // "Ink": the near-black of the redesign, tinted toward the brand hue so
        // dark sections sit next to brand blue without going muddy. 600 is the
        // lightest step that still clears 4.5:1 as body text on `paper`.
        ink: {
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
        },
        // "Paper": the warm off-white page. Pure white is kept for raised cards.
        paper: {
          DEFAULT: '#F6F5F1',
          2: '#ECEAE3',
        },
        // The single loud accent. A marker, never a text colour on light
        // surfaces (fails contrast) — always carries ink text on top.
        lime: {
          soft: '#E9FAB0',
          DEFAULT: '#C8F135',
          deep: '#A9D414',
        },
        // shadcn/ui semantic tokens (see globals.css) — what 21st.dev
        // components expect to find.
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        // All three are loaded via next/font (see app/layout.tsx) with the
        // `cyrillic` subset — the whole site is in Russian.
        sans: ['var(--font-manrope)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-unbounded)', 'var(--font-manrope)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jbmono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        // Fluid display sizes. Unbounded is a wide face and Russian words run
        // long, so the floor is set by «digital-бренд» fitting a 320px column,
        // not by taste.
        'display-xl': ['clamp(2.15rem, 7.4vw, 8.25rem)', { lineHeight: '0.98', letterSpacing: '-0.04em' }],
        'display-lg': ['clamp(1.9rem, 5.2vw, 5.25rem)', { lineHeight: '1.02', letterSpacing: '-0.035em' }],
        'display-md': ['clamp(1.5rem, 3.1vw, 2.85rem)', { lineHeight: '1.08', letterSpacing: '-0.025em' }],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 4px)',
        sm: 'calc(var(--radius) - 8px)',
      },
      transitionTimingFunction: {
        expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'float-delay': 'float 7s ease-in-out infinite 2s',
        gradient: 'gradient 6s ease infinite',
        marquee: 'marquee 40s linear infinite',
        'marquee-reverse': 'marquee-reverse 40s linear infinite',
        'spin-slow': 'spin 14s linear infinite',
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
