import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider
      clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
      >
        <App />
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);