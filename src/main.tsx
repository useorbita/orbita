import React from "react";
import { useEffect } from "react";

import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router-dom";

import { createTheme, MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/schedule/styles.css";
import "@mantine/tiptap/styles.css";

import { useAuth } from "./api/auth";

import { App } from "./App";
import Authentication from "./pages/Authentication";

// show react-scan performance widget
// if (typeof window !== "undefined" && import.meta.env.DEV) {
//   scan({
//     enabled: true,
//     log: true,
//   });
// }

const theme = createTheme({
  /** Your theme override here */
});

function Application() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // fade in app and remove splash screen
    document.getElementById("root")!.style.opacity = "1";
    const splash = document.getElementById("splash")!;
    splash.style.animation = "none";
    splash.style.opacity = "0";
    splash.addEventListener("transitionend", () => splash.remove(), { once: true });
  }, []);

  return isAuthenticated ? <App /> : <Authentication />;
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <Notifications />
        <BrowserRouter>
          <ModalsProvider>
            <Application />
          </ModalsProvider>
        </BrowserRouter>
      </MantineProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
