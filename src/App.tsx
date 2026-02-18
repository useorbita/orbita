import { AppShell } from "@mantine/core";
import { useState } from "react";
import { Route, Routes } from "react-router-dom";

import { Navbar } from "./components/App/Navbar";
import { Board } from "./pages/Board";
import { BoardSettings } from "./pages/BoardSettings";
import { Home } from "./pages/Home";
import { Settings } from "./pages/Settings";
import { Search } from "./pages/Search";

const NAVBAR_WIDTH = 250;
const NAVBAR_COLLAPSED_WIDTH = 46;

export function App() {
  const [navCollapsed, setNavCollapsed] = useState(false);

  return (
    <AppShell
      layout="alt"
      navbar={{
        width: navCollapsed ? NAVBAR_COLLAPSED_WIDTH : NAVBAR_WIDTH,
        breakpoint: 0,
      }}
      padding="md"
    >
      <AppShell.Navbar withBorder={true}>
        <Navbar
          collapsed={navCollapsed}
          onToggleCollapse={() => setNavCollapsed((c) => !c)}
        />
      </AppShell.Navbar>

      <AppShell.Main h="100vh">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:boardId" element={<Board />} />
          <Route path="/:boardId/settings" element={<BoardSettings />} />
          <Route path="/:boardId/:cardId" element={<Board />} />
          <Route path="/search" element={<Search />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<p>Seite nicht gefunden</p>} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}
