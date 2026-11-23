import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        heading: ["Manrope", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        body: ["DM Sans", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      colors: {
        luma: {
          bg: "var(--luma-bg)",
          surface: "var(--luma-surface)",
          "surface-2": "var(--luma-surface-2)",
          text: "var(--luma-text)",
          muted: "var(--luma-muted)",
          line: "var(--luma-line)",
          accent: "var(--luma-accent)",
          soft: "var(--luma-soft)",
          green: "var(--luma-green)",
          "green-bg": "var(--luma-green-bg)",
          amber: "var(--luma-amber)",
          "amber-bg": "var(--luma-amber-bg)",
        },
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "9px",
        md: "11px",
        lg: "14px",
        xl: "20px",
        pill: "30px",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px", letterSpacing: "0.15em" }],
        xs: ["11px", { lineHeight: "16px" }],
        sm: ["12px", { lineHeight: "18px" }],
        base: ["13px", { lineHeight: "20px" }],
        md: ["14px", { lineHeight: "22px" }],
        lg: ["15px", { lineHeight: "24px" }],
        xl: ["17px", { lineHeight: "26px" }],
        "2xl": ["19px", { lineHeight: "28px" }],
        "3xl": ["24px", { lineHeight: "30px", letterSpacing: "-0.04em" }],
        "4xl": ["27px", { lineHeight: "32px", letterSpacing: "-0.04em" }],
        "5xl": ["clamp(40px, 5vw, 64px)", { lineHeight: "1.06", letterSpacing: "-0.055em" }],
      },
      animation: {
        "slide-in": "slideIn 0.25s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
        "pulse-subtle": "pulseSubtle 2s ease-in-out infinite",
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateX(-105%)" },
          "100%": { transform: "translateX(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
