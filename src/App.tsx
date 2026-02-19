import { AppShell } from "@mantine/core";
import { useState } from "react";
import { Route, Routes } from "react-router-dom";

import { Navbar } from "./components/App/Navbar";
import { Board } from "./pages/Board";
import { BoardSettings } from "./pages/BoardSettings";
import { Calendar } from "./pages/Calendar";
import { DocView } from "./pages/DocView";
import { Home } from "./pages/Home";
import { OrgOverview } from "./pages/OrgOverview";
import { OrgSettings } from "./pages/OrgSettings";
import { ProjectOverview } from "./pages/ProjectOverview";
import { ProjectSettings } from "./pages/ProjectSettings";
import { Search } from "./pages/Search";
import { Settings } from "./pages/Settings";

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
          <Route path="/search" element={<Search />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/boards/:boardId" element={<Board />} />
          <Route path="/boards/:boardId/settings" element={<BoardSettings />} />
          <Route path="/boards/:boardId/cards/:cardId" element={<Board />} />
          <Route path="/projects/:projectId" element={<ProjectOverview />} />
          <Route path="/projects/:projectId/settings" element={<ProjectSettings />} />
          <Route path="/orgs/:orgId" element={<OrgOverview />} />
          <Route path="/orgs/:orgId/settings" element={<OrgSettings />} />
          <Route path="/docs/:docId" element={<DocView />} />
          <Route path="*" element={<p>Seite nicht gefunden</p>} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}
