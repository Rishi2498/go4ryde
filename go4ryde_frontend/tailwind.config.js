export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        secondary: "#22d3ee",

        foreground: "#0f172a",
        background: "#ffffff",

        muted: "#f1f5f9",
        "muted-foreground": "#64748b",

        border: "#e2e8f0",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      }
    },
  },
  plugins: [],
}