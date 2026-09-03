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
        },
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