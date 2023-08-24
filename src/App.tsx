import { AppShell, Container } from "@mantine/core";
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { pb } from "./api/pocketbase";
import { BoardsResponse, Collections } from "./api/types";
import { Navigation } from "./components/App/Navigation";
import { Board } from "./pages/Board";
import { Home } from "./pages/Home";
import { AppSettings } from "./pages/Settings/AppSettings";
import { BoardSettings } from "./pages/Settings/BoardSettings";
import { UserSettings } from "./pages/Settings/UserSettings";

export function App() {
  const [boards, setBoards] = useState<BoardsResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);

      const boards = await pb
        .collection(Collections.Boards)
        .getFullList<BoardsResponse>();

      setBoards(boards);
      setLoading(false);
    })();
  }, []);

  return (
    <AppShell
      padding="md"
      navbar={{ width: 300, breakpoint: "sm" }}
    >
      <AppShell.Navbar p="md">
        <Navigation loading={loading} boards={boards} />
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
