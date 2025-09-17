import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // PrimaryReading Brand Colors - Design System Aligned
        "education-blue": "var(--education-blue)",
        "education-purple": "var(--education-purple)",
        "education-pink": "var(--education-pink)",
        "education-indigo": "var(--education-indigo)",
        "warm-orange": "var(--warm-orange)",
        "soft-yellow": "var(--soft-yellow)",
        "sage-green": "var(--sage-green)",
        "coral-pink": "var(--coral-pink)",

        // Enhanced Neutrals - WCAG AA Compliant
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        "card-hover": "var(--card-hover)",

        // Text Contrast Colors - Educational Focus
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "placeholder": "var(--placeholder)",

        // Semantic Colors - Brand Aligned
        primary: "var(--primary)",
        "primary-hover": "var(--primary-hover)",
        secondary: "var(--secondary)",
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",

        // shadcn/ui compatibility
        destructive: {
          DEFAULT: "var(--error)",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "var(--education-purple)",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "var(--card)",
          foreground: "var(--foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--foreground)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        reading: ["var(--font-reading)"],
        heading: ["var(--font-heading)"],
      },
      animation: {
        "float": "float 4s ease-in-out infinite",
        "float-delayed": "float-delayed 5s ease-in-out infinite",
        "bounce-slow": "bounce-slow 3s ease-in-out infinite",
        "gentle-rotate": "gentleRotate 6s ease-in-out infinite",
        "hero-content-slide": "heroContentSlide 0.8s ease-out 0.3s both",
      },
      keyframes: {
        float: {
          "0%, 100%": {
            transform: "translateY(0px) rotate(0deg)",
          },
          "50%": {
            transform: "translateY(-10px) rotate(2deg)",
          },
        },
        "float-delayed": {
          "0%, 100%": {
            transform: "translateY(0px) rotate(0deg)",
          },
          "50%": {
            transform: "translateY(-12px) rotate(3deg)",
          },
        },
        "bounce-slow": {
          "0%, 100%": {
            transform: "translateY(0px) scale(1)",
          },
          "25%": {
            transform: "translateY(-8px) scale(1.05)",
          },
          "50%": {
            transform: "translateY(0px) scale(1)",
          },
          "75%": {
            transform: "translateY(-4px) scale(1.02)",
          },
        },
        gentleRotate: {
          "0%": {
            transform: "rotate(0deg) scale(1)",
          },
          "25%": {
            transform: "rotate(2deg) scale(1.05)",
          },
          "50%": {
            transform: "rotate(0deg) scale(1)",
          },
          "75%": {
            transform: "rotate(-2deg) scale(1.05)",
          },
          "100%": {
            transform: "rotate(0deg) scale(1)",
          },
        },
        heroContentSlide: {
          from: {
            opacity: "0",
            transform: "translateY(40px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("tailwindcss-animate")
  ],
} satisfies Config;

export default config;