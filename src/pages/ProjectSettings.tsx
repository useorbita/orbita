import {
  ActionIcon,
  Grid,
  Group,
  Loader,
  ScrollArea,
  Space,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";
import { useProject, useProjectMembers } from "../api/projects";

export function ProjectSettings() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const project = useProject(projectId);
  const members = useProjectMembers(projectId);

  const descriptionSpan = 4;
  const inputSpan = 6;
  const offset = 1;

  if (project.isLoading) return <Loader color="gray" />;

  return (
    <ScrollArea p="xl">
      <Group gap="xs" mb="xl">
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={() => navigate(`/projects/${projectId}`)}
        >
          <IconArrowLeft size="1em" />
        </ActionIcon>
        <Text>Zurück zum Projekt</Text>
      </Group>

      <Title style={{ fontFamily: "Outfit", fontWeight: 400 }}>
        Einstellungen des Projekts
      </Title>

      <Space h="xl" />

      <Grid align="flex-start">
        <Grid.Col span={descriptionSpan}>
          <Stack gap="xs">
            <Text>Name des Projekts</Text>
            <Text size="sm" c="dimmed">
              Dies ist der Name des Projekts, der jedem angezeigt wird
            </Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={inputSpan} offset={offset}>
          <TextInput
            placeholder="Name des Projekts"
            defaultValue={project.data?.name}
          />
        </Grid.Col>
      </Grid>

      <Space h="xl" />

      <Grid align="flex-start">
        <Grid.Col span={descriptionSpan}>
          <Stack gap="xs">
            <Text>Mitglieder</Text>
            <Text size="sm" c="dimmed">
              Folgende Mitglieder haben Zugriff auf das Projekt
            </Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={inputSpan} offset={offset}>
          {members.isLoading ? (
            <Loader size="sm" color="gray" />
          ) : (
            <Stack gap="xs">
              {members.data?.map((member) => (
                <Group key={member.id} justify="space-between">
                  <Text size="sm">
                    {(member.expand as any)?.user?.name ?? member.user}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {member.role}
                  </Text>
                </Group>
              ))}
              {members.data?.length === 0 && (
                <Text size="sm" c="dimmed">
                  Keine Mitglieder
                </Text>
              )}
            </Stack>
          )}
        </Grid.Col>
      </Grid>
    </ScrollArea>
  );
}
