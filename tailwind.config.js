/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: "#0B2A4A",
          50: "#EAF1F8",
          100: "#C9DAEC",
          200: "#9DB9DA",
          300: "#6E97C6",
          400: "#3D6EA0",
          500: "#1F4C79",
          600: "#123761",
          700: "#0B2A4A",
          800: "#071D34",
          900: "#041220",
        },
        orange: {
          DEFAULT: "#F2600A",
          50: "#FFF3EA",
          100: "#FFE0C7",
          200: "#FFC08C",
          300: "#FFA050",
          400: "#FF7F1F",
          500: "#F2600A",
          600: "#D94E00",
          700: "#B33F00",
          800: "#8C3100",
          900: "#662300",
        },
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 4px 24px rgba(11, 42, 74, 0.10)",
        glow: "0 0 0 4px rgba(242, 96, 10, 0.22)",
      },
    },
  },
  plugins: [],
};
