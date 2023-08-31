import { AppShell, Container } from "@mantine/core";
import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { Navigation } from "./components/App/Navigation";
import { Board } from "./pages/Board";
import { Home } from "./pages/Home";
import { AppSettings } from "./pages/Settings/AppSettings";
import { BoardSettings } from "./pages/Settings/BoardSettings";
import { UserSettings } from "./pages/Settings/UserSettings";
import { useBoardStore } from "./stores/boardStore";

export function App() {
  const boards = useBoardStore((state) => state.boards);
  const getAllBoards = useBoardStore((state) => state.getAllBoards);
  const isLoading = useBoardStore((state) => state.isLoading);

  useEffect(() => {
    getAllBoards();
  }, []);

  return (
    <AppShell padding="md" navbar={{ width: 300, breakpoint: "sm" }}>
      <AppShell.Navbar p="md">
        <Navigation loading={isLoading} boards={boards} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Container pt="xl">
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/:boardId" element={<Board />} />
            <Route path="/:boardId/:cardId" element={<Board />} />
            <Route path="/settings" element={<AppSettings />} />
            <Route path="/settings/me" element={<UserSettings />} />
            <Route path="/settings/:boardId" element={<BoardSettings />} />
            <Route path="*" element={<p>Seite nicht gefunden</p>} />
          </Routes>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
