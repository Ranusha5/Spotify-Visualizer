/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#121212",
        surface: "#181818",
        surfaceHover: "#282828",
        spotify: "#1DB954",
        spotifyHover: "#1ed760",
        text: "#FFFFFF",
        textSubtle: "#B3B3B3",
        card: "#181818",
      },
      fontFamily: {
        sans: ["Circular Std", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(29, 185, 84, 0.4)",
      },
    },
  },
  plugins: [],
}
