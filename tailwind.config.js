/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // MediZone Blue Theme
        primary: "#2563EB",       // Blue 600 (Buttons, Links, Active states)
        primaryHover: "#1D4ED8",  // Blue 700 (Hover)
        primaryDark: "#1E40AF",   // Blue 800 (Darker accents)
        primarySoft: "#DBEAFE",   // Blue 100 (soft background chips/cards)

        accent: "#38BDF8",        // Sky 400 (highlights)
        accentSoft: "#E0F2FE",    // Sky 100 (soft highlight bg)

        surface: "#F8FAFC",       // Slate 50 (app background)
        surface2: "#FFFFFF",      // cards

        textMain: "#0F172A",      // Slate 900
        textMuted: "#64748B",     // Slate 500
        borderSoft: "#E2E8F0",    // Slate 200

        // semantic (optional, but useful)
        success: "#16A34A",       // Green 600
        warning: "#F59E0B",       // Amber 500
        danger: "#EF4444",        // Red 500
      },
      boxShadow: {
        soft: "0 10px 25px -15px rgba(2, 6, 23, 0.25)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
}
