import { MantineProvider, createTheme } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { pb } from "./api/pocketbase";
import { Authentication } from "./pages/Authentication";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/tiptap/styles.css";

const theme = createTheme({
  /** Your theme override here */
});

// TODO: this only works with refresh
const userAuthenticated = pb.authStore.isValid;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications />
      <BrowserRouter>
        <ModalsProvider>
          {userAuthenticated ? <App /> : <Authentication />}
        </ModalsProvider>
      </BrowserRouter>
    </MantineProvider>
  </React.StrictMode>
);
