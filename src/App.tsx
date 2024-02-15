import { AppShell, LoadingOverlay } from "@mantine/core";
import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { Header } from "./components/App/Header";
import { Board } from "./pages/Board";
import { BoardSettings } from "./pages/BoardSettings";
import { Home } from "./pages/Home";
import { Settings } from "./pages/Settings";
import { useBoardStore } from "./stores/boardStore";

export function App() {
  const allBoards = useBoardStore((state) => state.allBoards);
  const getAllBoards = useBoardStore((state) => state.getAllBoards);
  const isLoading = useBoardStore((state) => state.isLoading);

  useEffect(() => {
    getAllBoards();
  }, []);

  return (
    <AppShell padding={"md"} header={{ height: 40 }}>
      <AppShell.Header p={"xs"} pl={"md"} withBorder={false}>
        <Header boards={allBoards} />
      </AppShell.Header>

      <AppShell.Main>
        <LoadingOverlay visible={isLoading} />
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
