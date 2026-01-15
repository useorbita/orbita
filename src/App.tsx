import { AppShell, LoadingOverlay } from "@mantine/core";

import { Header } from "./components/App/Header";
import { Board } from "./pages/Board";
import { BoardSettings } from "./pages/BoardSettings";
import { Home } from "./pages/Home";
import { Settings } from "./pages/Settings";

import { Route, Routes } from "react-router-dom";
import { useIsFetching } from "@tanstack/react-query";

export function App() {
  const isFetching = useIsFetching();

  return (
    <AppShell padding={"md"} header={{ height: 40 }}>
      <AppShell.Header p={"xs"} pl={"md"} withBorder={false}>
        <Header />
      </AppShell.Header>

      <AppShell.Main h="100vh">
        <LoadingOverlay visible={isFetching > 0} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:boardId" element={<Board />} />
          <Route path="/:boardId/settings" element={<BoardSettings />} />
          <Route path="/:boardId/:cardId" element={<Board />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/me" element={<Settings />} />
          <Route path="*" element={<p>Seite nicht gefunden</p>} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}
