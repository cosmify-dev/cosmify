/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false
  },
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,vue}"],
  theme: {
    extend: {}
  },
  plugins: [require("tailwindcss-primeui"), require("@tailwindcss/typography")]
};
