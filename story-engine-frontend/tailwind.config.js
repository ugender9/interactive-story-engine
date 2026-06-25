/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        story: {
          bg:     "#0f0f0f",
          card:   "#1a1a1a",
          border: "#2a2a2a",
          accent: "#f59e0b",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "serif"],
        sans:  ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
