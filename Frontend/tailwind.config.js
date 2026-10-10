/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0F1B3D",
          blue: {
            light: "#38BDF8",
            DEFAULT: "#2F6FED",
            dark: "#1D4ED8",
          },
          purple: {
            light: "#C026D3",
            DEFAULT: "#9333EA",
            dark: "#7C1FA0",
          },
          gold: "#F0B429",
          green: "#0F7A3E",
          mint: "#E7F4EC",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.6" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        shimmer: "shimmer 1.6s infinite",
        "pulse-ring": "pulse-ring 2s ease-out infinite",
        "gradient-pan": "gradient-pan 12s ease infinite",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(90deg, #2F6FED 0%, #9333EA 100%)",
        "brand-gradient-vertical": "linear-gradient(180deg, #0F1B3D 0%, #2F6FED 55%, #9333EA 100%)",
        "mentor-gradient-vertical": "linear-gradient(180deg, #0F1B3D 0%, #0D9488 55%, #10B981 100%)",
      },
    },
  },
  plugins: [],
};