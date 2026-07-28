import type { Config } from "tailwindcss";
// Force rebuild tailwind

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-calistoga)", "Calistoga", "Georgia", "serif"],
        serif: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        // ── Admin / Vercel-inspired monochrome (WITH DUAL MODE VARIABLES) ───
        ink: "var(--color-ink)",
        body: "var(--color-body)",
        muted: "var(--color-muted)",
        hairline: "var(--color-hairline)",
        "hairline-strong": "var(--color-hairline-strong)",
        canvas: "var(--color-canvas)",
        "canvas-soft": "var(--color-canvas-soft)",
        "canvas-soft-2": "var(--color-canvas-soft-2)",
        link: "#0070f3",
        "link-deep": "#0761d1",
        success: "#0070f3",
        error: "#ee0000",
        "error-soft": "#f7d4d6",
        warning: "#f5a623",
        "warning-soft": "#ffefcf",
        violet: "#7928ca",
        cyan: "#50e3c2",

        // ── Public / Blue Batik theme (EXTENDED) ────────────────────────────
        warm: {
          50:  "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
        batik: {
          primary: "#1e3a5f",   // navy blue
          secondary: "#3b82f6", // bright blue accent
          accent: "#1e40af",    // deep blue
          bg: "#f8fafc",        // slate-50
          text: "#0f172a",      // slate-900
          muted: "#64748b",     // slate-500
          border: "#e2e8f0",    // slate-200
          "card-bg": "#ffffff", // white
          gold: "#60a5fa",      // blue-400
        },

        // ── Public Hero Dark theme ──────────────────────────────────────
        hero: {
          dark: "#020617",      // slate-950
          "dark-2": "#0f172a",  // slate-900
          "dark-3": "#1e293b",  // slate-800
        },
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "28px",
        pill: "100px",
        "pill-sm": "64px",
      },
      boxShadow: {
        // Vercel-style stacked shadows (UNCHANGED)
        "level-1": "inset 0 0 0 1px rgba(0,0,0,0.08)",
        "level-2": "0px 1px 1px rgba(0,0,0,0.02), 0px 2px 2px rgba(0,0,0,0.04), inset 0 0 0 1px rgba(0,0,0,0.08)",
        "level-3": "0px 2px 2px rgba(0,0,0,0.04), 0px 8px 8px -8px rgba(0,0,0,0.04), inset 0 0 0 1px rgba(0,0,0,0.08)",
        "level-4": "0px 2px 2px rgba(0,0,0,0.04), 0px 8px 16px -4px rgba(0,0,0,0.04), inset 0 0 0 1px rgba(0,0,0,0.08)",
        "level-5": "0px 1px 1px rgba(0,0,0,0.02), 0px 8px 16px -4px rgba(0,0,0,0.04), 0px 24px 32px -8px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(0,0,0,0.08)",
        // Warm batik shadows -> Blue shadows
        "warm-sm": "0 1px 3px rgba(30, 58, 95, 0.12), 0 1px 2px rgba(30, 58, 95, 0.08)",
        "warm-md": "0 4px 12px rgba(30, 58, 95, 0.15), 0 2px 4px rgba(30, 58, 95, 0.08)",
        "warm-lg": "0 8px 24px rgba(30, 58, 95, 0.18), 0 4px 8px rgba(30, 58, 95, 0.10)",
        // Premium public shadows
        "hero-glow": "0 0 80px rgba(59, 130, 246, 0.3), 0 0 160px rgba(59, 130, 246, 0.15)",
        "card-hover": "0 20px 60px rgba(30, 58, 95, 0.10), 0 8px 24px rgba(30, 58, 95, 0.12)",
        "card-base": "0 4px 20px rgba(0,0,0,0.2), 0 1px 4px rgba(0,0,0,0.1)",
        "glow-amber": "0 0 40px rgba(59, 130, 246, 0.25)",
        "glow-terra": "0 0 40px rgba(30, 58, 95, 0.25)",
        "glow-gold": "0 0 30px rgba(96, 165, 250, 0.2)",
      },
      animation: {
        // Existing (UNCHANGED)
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-warm": "pulseWarm 2s ease-in-out infinite",
        // New public animations
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-up-delay-1": "fadeUp 0.6s ease-out 0.1s forwards",
        "fade-up-delay-2": "fadeUp 0.6s ease-out 0.2s forwards",
        "fade-up-delay-3": "fadeUp 0.6s ease-out 0.3s forwards",
        "fade-up-delay-4": "fadeUp 0.6s ease-out 0.4s forwards",
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "spin-slow": "spin 12s linear infinite",
        "bounce-slow": "bounce 3s ease-in-out infinite",
        "scale-in": "scaleIn 0.4s ease-out",
        "nav-slide-down": "navSlideDown 0.3s ease-out",
        "nav-fade-in": "navFadeIn 0.2s ease-out",
        "timeline-grow": "timelineGrow 1s ease-out forwards",
        "count-up": "countUp 0.5s ease-out",
        "wave": "wave 2s ease-in-out infinite",
      },
      keyframes: {
        // Existing (UNCHANGED)
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        pulseWarm: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.7" } },
        // New public keyframes
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-14px) rotate(1deg)" },
          "66%": { transform: "translateY(-6px) rotate(-1deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        navSlideDown: {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        navFadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        timelineGrow: {
          "0%": { height: "0", opacity: "0" },
          "100%": { height: "100%", opacity: "1" },
        },
        countUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        wave: {
          "0%, 100%": { transform: "scaleY(0.5)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "12px",
        lg: "20px",
        xl: "40px",
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
        "sharp": "cubic-bezier(0.4, 0, 0.6, 1)",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
        "34": "8.5rem",
        "38": "9.5rem",
        "42": "10.5rem",
        "46": "11.5rem",
        "50": "12.5rem",
        "54": "13.5rem",
        "58": "14.5rem",
        "62": "15.5rem",
        "66": "16.5rem",
        "70": "17.5rem",
        "74": "18.5rem",
        "78": "19.5rem",
        "82": "20.5rem",
        "86": "21.5rem",
        "90": "22.5rem",
        "94": "23.5rem",
        "98": "24.5rem",
        "102": "25.5rem",
        "106": "26.5rem",
        "110": "27.5rem",
        "114": "28.5rem",
        "118": "29.5rem",
        "122": "30.5rem",
        "126": "31.5rem",
        "130": "32.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
