import { lazy, Suspense, useState } from "react";

import { Route, Routes } from "react-router-dom";

import { AppShell, Loader } from "@mantine/core";

import { Navbar } from "./components/App/Navbar";

import { useAuth } from "./api/auth";

import Authentication from "./pages/Authentication";

const Home = lazy(() => import("./pages/Home"));
const Search = lazy(() => import("./pages/Search"));
const Settings = lazy(() => import("./pages/Settings"));
const Calendar = lazy(() => import("./pages/Calendar"));
const OrgOverview = lazy(() => import("./pages/OrgOverview"));
const OrgSettings = lazy(() => import("./pages/OrgSettings"));
const ProjectOverview = lazy(() => import("./pages/ProjectOverview"));
const ProjectSettings = lazy(() => import("./pages/ProjectSettings"));
const Board = lazy(() => import("./pages/Board"));
const BoardSettings = lazy(() => import("./pages/BoardSettings"));
const DocumentView = lazy(() => import("./pages/DocumentView"));

const FallbackLoader = () => <Loader color="gray" />;

const NAVBAR_WIDTH = 250;
const NAVBAR_COLLAPSED_WIDTH = 46;

export function App() {
  const [navCollapsed, setNavCollapsed] = useState(false);
  const { isAuthenticated } = useAuth();

  return !isAuthenticated ? (
    <Authentication />
  ) : (
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
        <Suspense fallback={<FallbackLoader />}>
          {/* prettier-ignore */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/orgs/:orgId" element={<OrgOverview />} />
            <Route path="/orgs/:orgId/settings" element={<OrgSettings />} />
            <Route path="/projects/:projectId" element={<ProjectOverview />} />
            <Route path="/projects/:projectId/settings" element={<ProjectSettings />} />
            <Route path="/boards/:boardId" element={<Board />} />
            <Route path="/boards/:boardId/settings" element={<BoardSettings />} />
            <Route path="/boards/:boardId/cards/:cardId" element={<Board />} />
            <Route path="/documents/:documentId" element={<DocumentView />} />
            <Route path="*" element={<p>Seite nicht gefunden</p>} />
          </Routes>
        </Suspense>
      </AppShell.Main>
    </AppShell>
  );
}
