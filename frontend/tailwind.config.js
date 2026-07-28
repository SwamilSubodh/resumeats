/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Sora", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"]
      },
      colors: {
        ink: "#081124",
        slateBlue: "#133667",
        sea: "#0f766e",
        coral: "#f97316",
        mist: "#edf6ff"
      },
      boxShadow: {
        float: "0 18px 60px rgba(8, 17, 36, 0.22)"
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        rise: "rise 500ms ease-out both"
      }
    }
  },
  plugins: []
};
