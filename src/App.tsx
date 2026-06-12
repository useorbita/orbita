import { lazy, Suspense, useEffect, useState } from "react";

import { Route, Routes } from "react-router-dom";

import { AppShell, Center, Loader } from "@mantine/core";

import { useAuth } from "./api/auth";

const Navbar = lazy(() => import("./components/App/Navbar"));

const Authentication = lazy(() => import("./pages/Authentication"));
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
const NotFound = lazy(() => import("./pages/NotFound"));

const FallbackLoader = () => (
  <Center h="100%">
    <Loader color="gray" />
  </Center>
);

function FadeIn() {
  useEffect(() => {
    document.getElementById("root")!.style.opacity = "1";
  }, []);
  return null;
}

const NAVBAR_WIDTH = 250;
const NAVBAR_COLLAPSED_WIDTH = 46;

export function App() {
  const [navCollapsed, setNavCollapsed] = useState(false);
  const { isAuthenticated } = useAuth();

  return !isAuthenticated ? (
    <Suspense fallback={<FallbackLoader />}>
      <FadeIn />
      <Authentication />
    </Suspense>
  ) : (
    <Suspense fallback={<FallbackLoader />}>
      <FadeIn />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppShell.Main>
      </AppShell>
    </Suspense>
  );
}
