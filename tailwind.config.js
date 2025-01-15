/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "rgb(99, 102, 241)",
          hover: "rgb(79, 70, 229)",
          foreground: "white",
        },
        secondary: {
          DEFAULT: "rgb(161, 161, 170)",
          hover: "rgb(113, 113, 122)",
          foreground: "white",
        },
        destructive: {
          DEFAULT: "rgb(239, 68, 68)",
          hover: "rgb(220, 38, 38)",
          foreground: "white",
        },
        muted: {
          DEFAULT: "rgb(39, 39, 42)",
          foreground: "rgb(161, 161, 170)",
        },
        accent: {
          DEFAULT: "rgb(39, 39, 42)",
          foreground: "white",
        },
        card: {
          DEFAULT: "rgb(24, 24, 27)",
          foreground: "rgb(250, 250, 250)",
        },
        popover: {
          DEFAULT: "rgb(24, 24, 27)",
          foreground: "rgb(250, 250, 250)",
        },
        border: "rgb(39, 39, 42)",
        input: "rgb(39, 39, 42)",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
