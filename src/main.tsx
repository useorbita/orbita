import React from "react";

import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router-dom";

import { createTheme, MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import dayjs from "dayjs";
import "dayjs/locale/de";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("de");

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/schedule/styles.css";
import "@mantine/tiptap/styles.css";

import { App } from "./App";

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

const queryClient = new QueryClient();

const root = document.getElementById("root")!;
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <Notifications />
        <BrowserRouter>
          <ModalsProvider>
            <App />
          </ModalsProvider>
        </BrowserRouter>
      </MantineProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);

// fade in the app, the opacity is set to 0 initially in index.html
root.style.opacity = "1";
