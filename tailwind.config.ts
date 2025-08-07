import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}", "*.{js,ts,jsx,tsx,mdx}"],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Custom colors for Prosper
        prosper: {
          'bg-page': '#FAF9F6', // New page background color
          'navbar-bg': '#F4F3EC', // New navbar background color
          'bg-light': '#FBF8F3', // A soft, warm beige (kept for other elements if needed)
          'bg-medium': '#F0EBE3', // Slightly darker beige for contrast (kept for other elements if needed)
          'text-dark': '#333333', // Darker text for readability
          'concept1-green': '#8BC34A', // Muted green
          'concept1-green-dark': '#7CB342',
          'concept2-purple': '#9C27B0', // Muted purple
          'concept2-purple-dark': '#8E24AA',
          'concept3-blue': '#2196F3', // Muted blue
          'concept3-blue-dark': '#1976D2',
          'gray-light': '#E0E0E0', // For borders/dividers
          'gray-medium': '#BDBDBD',
          'gray-dark': '#424242', // For mobile screen border
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      fontFamily: {
        inconsolata: ['var(--font-inconsolata)'],
        'roboto-headline': ['var(--font-roboto-headline)'],
        'libertinus-sans': ['var(--font-libertinus-sans)'], // Added Libertinus Sans
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
