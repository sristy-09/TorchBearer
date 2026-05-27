import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { store } from "./store/store.ts";
import { initializeGlobalErrorHandlers } from "./utils/globalErrorHandler.ts";
import { ThemeProvider } from "./feature/core/context/themeProvider.tsx";

// Initialize global error handlers to prevent app crashes
initializeGlobalErrorHandlers();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Provider store={store}>
        <App />
      </Provider>
    </ThemeProvider>
  </StrictMode>,
);
