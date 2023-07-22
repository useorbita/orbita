import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./components/App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider
      theme={{ colorScheme: "dark" }}
      withGlobalStyles
      withNormalizeCSS
    >
      <Notifications />
      <App />
    </MantineProvider>
  </React.StrictMode>
);
