/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        databricks: {
          red: "#FF3621",
          dark: "#1B3139",
          navy: "#00A972",
          bg: "#F5F7FA",
          sidebar: "#1E2A3A",
        },
      },
    },
  },
  plugins: [],
};
