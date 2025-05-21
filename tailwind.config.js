/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          main: "#1d1d1d",
          light: "#808080",
          dark: "#666666",
        },
        secondary: {
          main: "#aa8c78",
          dark: "#98877b",
        },
        error: {
          main: "#ff5b5b",
        },
        warning: {
          main: "#f2a102",
        },
        info: {
          main: "#007bff",
        },
        success: {
          main: "#42a68c",
        },
      },
      fontFamily: {
        sans: [
          "IRANSans",
          "ARYA",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
        ],
        iransans: ["IRANSans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
