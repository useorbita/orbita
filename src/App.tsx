import {
  AppShell,
  Divider,
  LoadingOverlay,
  UnstyledButton,
} from "@mantine/core";
import { useIsFetching } from "@tanstack/react-query";
import { Route, Routes, useNavigate } from "react-router-dom";

import { Header } from "./components/App/Header";
import { Navbar } from "./components/App/Navbar";
import { UserAvatar } from "./components/UI/UserAvatar";
import { Board } from "./pages/Board";
import { BoardSettings } from "./pages/BoardSettings";
import { Home } from "./pages/Home";
import { Settings } from "./pages/Settings";

export function App() {
  const isFetching = useIsFetching();
  const navigate = useNavigate();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 250, breakpoint: "sm" }}
      padding="md"
    >
      <AppShell.Header p="sm">
        <Header />
      </AppShell.Header>

      <AppShell.Navbar>
        <Navbar />
        <Divider />
        <AppShell.Section p="sm">
          <UnstyledButton
            style={{ width: "100%" }}
            onClick={() => navigate("/settings")}
          >
            <UserAvatar />
          </UnstyledButton>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main h="100vh">
        <LoadingOverlay visible={isFetching > 0} />
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
