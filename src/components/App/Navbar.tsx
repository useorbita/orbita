import { Anchor, AppShell, Loader, Stack, Text, Title } from "@mantine/core";
import { useMemo } from "react";
import { useBoards } from "../../api/boards";
import { useDocs } from "../../api/docs";
import { useOrganizations } from "../../api/organizations";
import { useProjects } from "../../api/projects";

export function Navbar() {
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
  );
}
