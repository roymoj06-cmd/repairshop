import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter as Router } from "react-router-dom";
import { ToastContainer, Zoom } from "react-toastify";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider } from "@emotion/react";
import "react-toastify/dist/ReactToastify.css";
import rtlPlugin from "stylis-plugin-rtl";
import createCache from "@emotion/cache";
import { prefixer } from "stylis";

import ViewSelector from "@/Router/ViewSelector";
import getTheme from "@/theme";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";

const queryClient = new QueryClient();
const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});
const durationToastTime = import.meta.env.VITE_APP_DURATION_TIME_TOAST
  ? parseInt(import.meta.env.VITE_APP_DURATION_TIME_TOAST)
  : 3000;

function ThemedApp() {
  const { mode } = useTheme();
  const theme = getTheme(mode);

  return (
    <MuiThemeProvider theme={theme}>
      <ToastContainer
        autoClose={durationToastTime}
        position="bottom-center"
        hideProgressBar={false}
        closeOnClick={false}
        pauseOnHover={true}
        transition={Zoom}
        draggable={true}
        theme={mode}
      />
      <CssBaseline />
      <Router>
        <ViewSelector />
      </Router>
    </MuiThemeProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CacheProvider value={cacheRtl}>
        <ThemeProvider>
          <ThemedApp />
        </ThemeProvider>
      </CacheProvider>
    </QueryClientProvider>
  );
}

export default App;
