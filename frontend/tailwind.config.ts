 import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        line: "#d8dee9",
        panel: "#f8fafc"
      }
    }
  },
  plugins: []
};

export default config;
