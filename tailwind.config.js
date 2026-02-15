/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./js/**/*.js"],
  theme: {
    extend: {
      colors: {
        gp: {
          bg1: "#070b1a",
          bg2: "#111c45",
          gold: "#d6b25e",
          goldSoft: "#f0ddb1"
        }
      },
      boxShadow: {
        glow: "0 0 25px rgba(214, 178, 94, 0.35)",
        card: "0 20px 50px rgba(0, 0, 0, 0.35)"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 rgba(214,178,94,0.25)" },
          "50%": { boxShadow: "0 0 22px rgba(214,178,94,0.35)" }
        }
      },
      animation: {
        fadeIn: "fadeIn 450ms ease-out",
        pulseGlow: "pulseGlow 2.8s ease-in-out infinite"
      }
    }
  },
  plugins: []
};
