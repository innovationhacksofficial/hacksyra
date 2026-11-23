/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // Full list so `xs` sorts before `sm` and `3xl` (TV) after `2xl`.
    screens: {
      xs: "400px",
      ...defaultTheme.screens,
      "3xl": "1920px",
    },
    extend: {
      opacity: {
        3: "0.03",
        7: "0.07",
        8: "0.08",
        12: "0.12",
        15: "0.15",
        25: "0.25",
        85: "0.85",
      },
      colors: {
        // Legacy aliases (kept so older pages keep rendering on the white theme)
        midnight: "#FFFFFF",
        "surface-1": "#FFFFFF",
        "surface-2": "#F8FAFC",
        "surface-3": "#F1F5F9",
        "text-primary": "#0F172A",
        "text-secondary": "#475569",
        brand: {
          DEFAULT: "#1565D8",
          50: "#EEF4FF",
          100: "#DCE9FF",
          200: "#B3D1FF",
          300: "#80B3FF",
          400: "#4D94FF",
          500: "#1565D8",
          600: "#0F52B0",
          700: "#0B3E86",
          800: "#082D62",
          900: "#051D40",
        },
        violet: {
          DEFAULT: "#1565D8",
          50: "#EEF4FF",
          100: "#DCE9FF",
          200: "#B3D1FF",
          300: "#80B3FF",
          400: "#1565D8",
          500: "#1565D8",
          600: "#0F52B0",
          700: "#0B3E86",
          800: "#082D62",
          900: "#051D40",
        },
        aqua: {
          DEFAULT: "#0284C7",
          50: "#F0F9FF",
          100: "#E0F2FE",
          200: "#BAE6FD",
          300: "#7DD3FC",
          400: "#0EA5E9",
          500: "#0284C7",
          600: "#0369A1",
          700: "#075985",
          800: "#0C4A6E",
          900: "#082F49",
        },
        "signal-blue": "#1565D8",
        amber: {
          DEFAULT: "#D97706",
          hackathon: "#D97706",
        },
        "light-bg": "#F8FAFC",
        "light-surf": "#FFFFFF",
        "light-text": "#0F172A",
        "light-border": "#E2E8F0",
      },
      fontFamily: {
        // next/font exposes these CSS variables on <html> (see src/app/layout.tsx)
        display: ["var(--font-space-grotesk)", "Space Grotesk", ...defaultTheme.fontFamily.sans],
        sans: ["var(--font-inter)", "Inter", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", ...defaultTheme.fontFamily.mono],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-gradient": "linear-gradient(180deg, #EEF4FF 0%, #FFFFFF 60%, #F8FAFC 100%)",
        "violet-gradient": "linear-gradient(135deg, #1565D8 0%, #0F52B0 100%)",
        "brand-gradient": "linear-gradient(135deg, #1565D8 0%, #0EA5E9 100%)",
        "aqua-gradient": "linear-gradient(135deg, #0284C7 0%, #1565D8 100%)",
        "card-gradient": "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "fade-up": "fadeUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.4s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        shimmer: "shimmer 1.6s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-soft": "pulseSoft 2.4s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        "border-spin": "borderSpin 4s linear infinite",
        countdown: "countdown 1s linear infinite",
        marquee: "marquee 30s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(0.97)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(21, 101, 216, 0.2)" },
          "100%": { boxShadow: "0 0 40px rgba(21, 101, 216, 0.4)" },
        },
        borderSpin: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        88: "22rem",
        100: "25rem",
        112: "28rem",
        128: "32rem",
      },
      maxWidth: {
        "8xl": "88rem",
        "9xl": "104rem",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(15, 23, 42, 0.05)",
        violet: "0 4px 20px rgba(21, 101, 216, 0.25)",
        brand: "0 8px 24px -6px rgba(21, 101, 216, 0.45)",
        aqua: "0 4px 20px rgba(2, 132, 199, 0.25)",
        "card-dark": "0 2px 12px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04)",
        "card-hover": "0 12px 30px rgba(21, 101, 216, 0.12), 0 4px 12px rgba(15, 23, 42, 0.06)",
        "bar-top": "0 -4px 24px rgba(15, 23, 42, 0.08)",
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      zIndex: {
        60: "60",
        70: "70",
        80: "80",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
