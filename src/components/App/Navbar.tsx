import {
  ActionIcon,
  AppShell,
  Button,
  Divider,
  Group,
  Loader,
  NavLink,
  Space,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import {
  IconCircle,
  IconHome,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useBoards } from "../../api/boards";
import { useDocs } from "../../api/docs";
import { useOrganizations } from "../../api/organizations";
import { useProjects } from "../../api/projects";
import { UserAvatar } from "../UI/UserAvatar";

export function Navbar() {
  const organizations = useOrganizations();
  const projects = useProjects();
  const boards = useBoards();
  const docs = useDocs();

  const navigate = useNavigate();

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
    <>
      <AppShell.Section>
        <Group p="md">
          <IconCircle />

          <Text size="xl" style={{ fontFamily: "Outfit", fontWeight: 400 }}>
            Orbita
          </Text>
        </Group>

        <Divider />
        <NavLink
          label="Übersicht"
          leftSection={<IconHome size={"1.2em"} stroke={1.5} />}
          onClick={() => navigate("/")}
        />
        <NavLink
          label="Suchen"
          leftSection={<IconSearch size={"1.2em"} stroke={1.5} />}
          onClick={() => navigate("/")}
        />
        <NavLink
          label="Einstellungen"
          leftSection={<IconSettings size={"1.2em"} stroke={1.5} />}
          onClick={() => navigate("/settings")}
        />
      </AppShell.Section>

      <Space h="md" />

      <AppShell.Section grow p="sm">
        <Stack gap="xl">
          {organizations.isLoading ||
          projects.isLoading ||
          boards.isLoading ||
          docs.isLoading ? (
            <Loader color="gray" />
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
                            <Group>
                              <Button
                                variant="subtle"
                                color="gray"
                                size="sm"
                                onClick={() => {
                                  navigate(`/${board.id}`);
                                }}
                              >
                                {board.title}
                              </Button>

                              <ActionIcon
                                variant="transparent"
                                color="gray"
                                aria-label="Settings"
                                onClick={() => {
                                  navigate(`${board.id}/settings/`);
                                }}
                              >
                                <IconSettings size="1.2em" />
                              </ActionIcon>
                            </Group>
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
      </AppShell.Section>

      <AppShell.Section>
        <Divider />

        <UnstyledButton
          p="md"
          style={{ width: "100%" }}
          onClick={() => navigate("/settings")}
        >
          <UserAvatar />
        </UnstyledButton>
      </AppShell.Section>
    </>
  );
}
