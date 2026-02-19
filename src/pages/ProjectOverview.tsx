import {
  ActionIcon,
  Box,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconFile, IconLayout, IconSettings } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";
import { useBoardsByProject } from "../api/boards";
import { useDocsByProject } from "../api/docs";
import { useProject } from "../api/projects";

export function ProjectOverview() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const project = useProject(projectId);
  const boards = useBoardsByProject(projectId);
  const docs = useDocsByProject(projectId);

  const isLoading = project.isLoading || boards.isLoading || docs.isLoading;

  if (isLoading) return <Loader color="gray" />;

  return (
    <Box p="xl">
      <Group justify="space-between" mb="xl">
        <Title style={{ fontFamily: "IBM Plex Serif", fontWeight: 400 }}>
          {project.data?.name}
        </Title>
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={() => navigate(`/projects/${projectId}/settings`)}
        >
          <IconSettings size="1.2em" stroke={1.5} />
        </ActionIcon>
      </Group>

      <Stack gap="xl">
        <Box>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="sm">
            Boards
          </Text>
          {boards.data?.length === 0 && (
            <Text size="sm" c="dimmed">
              Keine Boards vorhanden
            </Text>
          )}
          <SimpleGrid cols={3} spacing="sm">
            {boards.data?.map((board) => (
              <Box
                key={board.id}
                p="md"
                style={(theme) => ({
                  border: `1px solid ${theme.colors.gray[3]}`,
                  borderRadius: theme.radius.md,
                  cursor: "pointer",
                })}
                onClick={() => navigate(`/boards/${board.id}`)}
              >
                <Group gap="xs">
                  <IconLayout size="1em" stroke={1.5} />
                  <Text size="sm">{board.title}</Text>
                </Group>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        <Box>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="sm">
            Dokumente
          </Text>
          {docs.data?.length === 0 && (
            <Text size="sm" c="dimmed">
              Keine Dokumente vorhanden
            </Text>
          )}
          <SimpleGrid cols={3} spacing="sm">
            {docs.data?.map((doc) => (
              <Box
                key={doc.id}
                p="md"
                style={(theme) => ({
                  border: `1px solid ${theme.colors.gray[3]}`,
                  borderRadius: theme.radius.md,
                  cursor: "pointer",
                })}
                onClick={() => navigate(`/docs/${doc.id}`)}
              >
                <Group gap="xs">
                  <IconFile size="1em" stroke={1.5} />
                  <Text size="sm">{doc.title || "Untitled"}</Text>
                </Group>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Stack>
    </Box>
  );
}
