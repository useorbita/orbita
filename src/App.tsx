import {
  Anchor,
  AppShell,
  Divider,
  Group,
  Loader,
  LoadingOverlay,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";

import { Header } from "./components/App/Header";
import { Board } from "./pages/Board";
import { BoardSettings } from "./pages/BoardSettings";
import { Home } from "./pages/Home";
import { Settings } from "./pages/Settings";

import { IconChevronRight } from "@tabler/icons-react";
import { useIsFetching } from "@tanstack/react-query";
import { useMemo } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useBoards } from "./api/boards";
import { useDocs } from "./api/docs";
import { useOrganizations } from "./api/organizations";
import { pb } from "./api/pocketbase";
import { useProjects } from "./api/projects";
import { UserAvatar } from "./components/UI/UserAvatar";

export function App() {
  const isFetching = useIsFetching();

  const navigate = useNavigate();

  const organizations = useOrganizations();
  const projects = useProjects();
  const boards = useBoards();
  const docs = useDocs();

  // Combine organizations with their projects, boards, and docs
  const organizationsWithProjects = useMemo(() => {
    if (!organizations.data || !projects.data || !boards.data || !docs.data)
      return [];

    return organizations.data
      .map((org) => ({
        ...org,
        projects: projects.data
          .filter((project) => project.organization === org.id)
          .map((project) => ({
            ...project,
            boards: boards.data.filter((board) => board.project === project.id),
            docs: docs.data.filter((doc) => doc.project === project.id),
          })),
      }))
      .sort((a, b) => {
        // Personal organizations first
        if (a.is_personal && !b.is_personal) return -1;
        if (!a.is_personal && b.is_personal) return 1;
        return 0;
      });
  }, [organizations.data, projects.data, boards.data, docs.data]);

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
        <AppShell.Section grow p="sm">
          <Stack gap="xl">
            <Stack gap="md">
              {organizations.isLoading ||
              projects.isLoading ||
              boards.isLoading ||
              docs.isLoading ? (
                <Loader size="sm" />
              ) : organizationsWithProjects.length === 0 ? (
                <Text c="dimmed">Keine Organisationen vorhanden</Text>
              ) : (
                organizationsWithProjects.map((org) => (
                  <Stack key={org.id} gap="xs">
                    <Title order={5}>
                      {org.is_personal ? "Deine Projekte" : org.name}
                    </Title>

                    {org.projects.length > 0 ? (
                      org.projects.map((project) => (
                        <Stack key={project.id} gap="xs" pl="md">
                          <Text fw={500}>{project.name}</Text>

                          {project.boards.length > 0 && (
                            <Stack gap="xs" pl="md">
                              <Text size="sm" c="dimmed">
                                Boards:
                              </Text>
                              {project.boards.map((board) => (
                                <Anchor
                                  key={board.id}
                                  size="sm"
                                  pl="md"
                                  href={`/${board.id}`}
                                >
                                  {board.title}
                                </Anchor>
                              ))}
                            </Stack>
                          )}

                          {project.docs.length > 0 && (
                            <Stack gap="xs" pl="md">
                              <Text size="sm" c="dimmed">
                                Docs:
                              </Text>
                              {project.docs.map((doc) => (
                                <Text key={doc.id} size="sm" pl="md">
                                  {doc.title || "Untitled"}
                                </Text>
                              ))}
                            </Stack>
                          )}
                        </Stack>
                      ))
                    ) : (
                      <Text c="dimmed" pl="md" size="sm">
                        Keine Projekte
                      </Text>
                    )}
                  </Stack>
                ))
              )}
            </Stack>
          </Stack>
        </AppShell.Section>

        <Divider />

        <AppShell.Section p="sm">
          <UnstyledButton
            style={{ width: "100%" }}
            onClick={() => navigate("/settings")}
          >
            <Group>
              <UserAvatar name={pb.authStore.record?.name} radius="xl" />
              <div style={{ flex: 1 }}>
                <Text size="sm" fw={500}>
                  {pb.authStore.record?.name}
                </Text>
                <Text c="dimmed" size="xs">
                  {pb.authStore.record?.email}
                </Text>
              </div>
              <IconChevronRight size={14} stroke={1.5} />
            </Group>
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
