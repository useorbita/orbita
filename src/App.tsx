import { AppShell, Navbar } from "@mantine/core";
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { pb } from "./api/pocketbase";
import { BoardsResponse, Collections } from "./api/types";
import { Navigation } from "./components/Navigation";
import { AppSettings } from "./pages/AppSettings";
import { Board } from "./pages/Board";
import { BoardSettings } from "./pages/BoardSettings";
import { Home } from "./pages/Home";
import { UserSettings } from "./pages/UserSettings";

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
      navbar={
        <Navbar width={{ base: 250 }} p="md">
          <Navigation loading={loading} boards={boards} />
        </Navbar>
      }
    >
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/:boardId" element={<Board />} />
        <Route path="/:boardId/:cardId" element={<Board />} />
        <Route path="/settings" element={<AppSettings />} />
        <Route path="/settings/me" element={<UserSettings />} />
        <Route path="/settings/:boardId" element={<BoardSettings />} />
        <Route path="*" element={<p>Seite nicht gefunden</p>} />
      </Routes>
    </AppShell>
  );
}
