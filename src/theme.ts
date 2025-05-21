import { createTheme, PaletteMode, Direction } from "@mui/material/styles";

// Define the colors for both light and dark modes
const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          // Light mode colors
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
          background: {
            default: "#ffffff",
            paper: "#fff",
          },
          text: {
            primary: "#1d1d1d",
            secondary: "#666666",
          },
        }
      : {
          // Dark mode colors
          primary: {
            main: "#ffffff",
            light: "#cccccc",
            dark: "#999999",
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
          background: {
            default: "#121212",
            paper: "#1e1e1e",
          },
          text: {
            primary: "#ffffff",
            secondary: "#b3b3b3",
          },
        }),
  },
  typography: {
    fontFamily: [
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
    ].join(","),
    h1: {
      fontFamily: "IRANSans",
    },
    h2: {
      fontFamily: "IRANSans",
    },
    h3: {
      fontFamily: "IRANSans",
    },
    h4: {
      fontFamily: "IRANSans",
    },
    h5: {
      fontFamily: "IRANSans",
    },
    h6: {
      fontFamily: "IRANSans",
    },
    body1: {
      fontFamily: "IRANSans",
    },
    body2: {
      fontFamily: "IRANSans",
    },
  },
  direction: "rtl" as Direction,
});

// Create a theme instance.
const getTheme = (mode: PaletteMode) => createTheme(getDesignTokens(mode));

export default getTheme;
