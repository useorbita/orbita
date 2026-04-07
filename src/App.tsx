import { lazy, Suspense, useState } from "react";

import { Route, Routes } from "react-router-dom";

import { AppShell, Center, Loader } from "@mantine/core";

import { Navbar } from "./components/App/Navbar";

const Home = lazy(() =>
  import("./pages/Home").then((m) => ({ default: m.Home })),
);
const Search = lazy(() =>
  import("./pages/Search").then((m) => ({ default: m.Search })),
);
const Settings = lazy(() =>
  import("./pages/Settings").then((m) => ({ default: m.Settings })),
);
const Calendar = lazy(() =>
  import("./pages/Calendar").then((m) => ({ default: m.Calendar })),
);
const OrgOverview = lazy(() =>
  import("./pages/OrgOverview").then((m) => ({ default: m.OrgOverview })),
);
const OrgSettings = lazy(() =>
  import("./pages/OrgSettings").then((m) => ({ default: m.OrgSettings })),
);
const ProjectOverview = lazy(() =>
  import("./pages/ProjectOverview").then((m) => ({
    default: m.ProjectOverview,
  })),
);
const ProjectSettings = lazy(() =>
  import("./pages/ProjectSettings").then((m) => ({
    default: m.ProjectSettings,
  })),
);
const Board = lazy(() =>
  import("./pages/Board").then((m) => ({ default: m.Board })),
);
const BoardSettings = lazy(() =>
  import("./pages/BoardSettings").then((m) => ({ default: m.BoardSettings })),
);
const DocumentView = lazy(() =>
  import("./pages/DocumentView").then((m) => ({ default: m.DocumentView })),
);

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
        <Suspense
          fallback={
            <Center h="100vh">
              <Loader color="gray" />
            </Center>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/orgs/:orgId" element={<OrgOverview />} />
            <Route path="/orgs/:orgId/settings" element={<OrgSettings />} />
            <Route path="/projects/:projectId" element={<ProjectOverview />} />
            <Route
              path="/projects/:projectId/settings"
              element={<ProjectSettings />}
            />
            <Route path="/boards/:boardId" element={<Board />} />
            <Route
              path="/boards/:boardId/settings"
              element={<BoardSettings />}
            />
            <Route path="/boards/:boardId/cards/:cardId" element={<Board />} />
            <Route path="/documents/:documentId" element={<DocumentView />} />
            <Route path="*" element={<p>Seite nicht gefunden</p>} />
          </Routes>
        </Suspense>
      </AppShell.Main>
    </AppShell>
  );
}
