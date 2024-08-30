import { AppShell, LoadingOverlay } from "@mantine/core";

import { Header } from "./components/App/Header";
import { Board } from "./pages/Board";
import { BoardSettings } from "./pages/BoardSettings";
import { Home } from "./pages/Home";
import { Settings } from "./pages/Settings";

import { Route, Routes } from "react-router-dom";
import { useBoards } from "./api/pocketbase";

export function App() {
  const boards = useBoards();

  return (
    <AppShell padding={"md"} header={{ height: 40 }}>
      <AppShell.Header p={"xs"} pl={"md"} withBorder={false}>
        <Header />
      </AppShell.Header>

      <AppShell.Main>
        <LoadingOverlay visible={boards.isLoading} />
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
