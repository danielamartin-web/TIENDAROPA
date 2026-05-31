/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // MARDA Custom Colors
        'marda-black': '#1A1A1A',
        'marda-white': '#FFFFFF',
        'marda-gray': '#6B6B6B',
        'marda-burgundy': '#6F1219',
        'marda-burgundy-hover': '#5A0E14',
        'marda-gold': '#D4A574',
        'marda-success': '#22C55E',
        'marda-error': '#EF4444',
        'marda-admin-bg': '#0F0F0F',
        'marda-admin-surface': '#1A1A1A',
        'marda-admin-border': '#2A2A2A',
        'whatsapp': '#25D366',
      },
      fontFamily: {
        'display': ['"Playfair Display"', 'Georgia', 'serif'],
        'body': ['"DM Sans"', 'system-ui', 'sans-serif'],
        'mono': ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'display-xl': ['clamp(3.5rem, 10vw, 8.75rem)', { lineHeight: '0.88', letterSpacing: '-3px' }],
        'h1': ['clamp(2.75rem, 6vw, 6rem)', { lineHeight: '0.9', letterSpacing: '-2px' }],
        'h2': ['clamp(2.25rem, 4vw, 4rem)', { lineHeight: '0.95', letterSpacing: '-1.5px' }],
        'h3': ['clamp(1.75rem, 3vw, 3rem)', { lineHeight: '1', letterSpacing: '-1px' }],
        'h4': ['clamp(1.5rem, 2vw, 2rem)', { lineHeight: '1.15', letterSpacing: '-0.5px' }],
        'h5': ['clamp(1.25rem, 1.5vw, 1.5rem)', { lineHeight: '1.2' }],
        'h6': ['clamp(1.125rem, 1.25vw, 1.25rem)', { lineHeight: '1.3' }],
        'price': ['clamp(1.375rem, 2vw, 1.75rem)', { lineHeight: '1', letterSpacing: '-0.5px' }],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        'card': '0 8px 32px rgba(0,0,0,0.12)',
        'burgundy': '0 4px 16px rgba(111,18,25,0.3)',
        'whatsapp': '0 4px 16px rgba(37,211,102,0.4)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(40px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-left": {
          from: { opacity: "0", transform: "translateX(-40px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-right": {
          from: { opacity: "0", transform: "translateX(40px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "fade-up": "fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fade-in 0.6s ease forwards",
        "slide-left": "slide-left 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-right": "slide-right 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scale-in 0.6s ease forwards",
        "shimmer": "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
