import { MantineProvider, createTheme } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { Authentication } from "./pages/Authentication";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/tiptap/styles.css";
import { useUserStore } from "./stores/userStore";

const theme = createTheme({
  /** Your theme override here */
});

function Application() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  return isAuthenticated ? <App /> : <Authentication />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Notifications />
      <BrowserRouter>
        <ModalsProvider>
          <Application />
        </ModalsProvider>
      </BrowserRouter>
    </MantineProvider>
  </React.StrictMode>
);
