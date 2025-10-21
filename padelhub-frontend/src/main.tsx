import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import { router } from "./router.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { registerSW } from "virtual:pwa-register";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Register service worker with auto-update
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("New content available. Reload?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("App ready to work offline");
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
