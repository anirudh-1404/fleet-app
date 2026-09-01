/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontSize: {
        "2xs": ["11.5px", { lineHeight: "16px" }],
        xs: ["13.5px", { lineHeight: "19px" }],
        sm: ["15.5px", { lineHeight: "22px" }],
        base: ["17px", { lineHeight: "25px" }],
        lg: ["19.5px", { lineHeight: "27px" }],
        xl: ["22px", { lineHeight: "29px" }],
        "2xl": ["26px", { lineHeight: "33px" }],
        "3xl": ["32px", { lineHeight: "38px" }],
      },
    },
  },
  plugins: [],
}
