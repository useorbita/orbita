import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { pb } from "./api/pocketbase";
import { Authentication } from "./pages/Authentication";

// TODO: this only works with refresh 
const userAuthenticated = pb.authStore.isValid;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider
      theme={{ colorScheme: "light" }}
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
