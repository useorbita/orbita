import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { Authentication } from "./pages/Authentication";

const userAuthenticated = true;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider
      theme={{ colorScheme: "dark" }}
      withGlobalStyles
      withNormalizeCSS
    >
      <Notifications />
      <BrowserRouter>
        {userAuthenticated ? <App /> : <Authentication />}
      </BrowserRouter>
    </MantineProvider>
  </React.StrictMode>
);
