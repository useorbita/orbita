import { AppShell } from "@mantine/core";
import { Route, Routes } from "react-router-dom";

import { Header } from "./components/App/Header";
import { Navbar } from "./components/App/Navbar";
import { Board } from "./pages/Board";
import { BoardSettings } from "./pages/BoardSettings";
import { Home } from "./pages/Home";
import { Settings } from "./pages/Settings";

export function App() {
  return (
    <AppShell
      layout="alt"
      header={{ height: 60 }}
      navbar={{ width: 250, breakpoint: "sm" }}
      padding="md"
    >
      <AppShell.Header p="sm" withBorder={false}>
        <Header />
      </AppShell.Header>

      <AppShell.Navbar withBorder={true}>
        <Navbar />
      </AppShell.Navbar>

      <AppShell.Main h="100vh">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:boardId" element={<Board />} />
          <Route path="/:boardId/settings" element={<BoardSettings />} />
          <Route path="/:boardId/:cardId" element={<Board />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<p>Seite nicht gefunden</p>} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}
