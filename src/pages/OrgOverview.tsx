import { useEffect, useRef, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  ActionIcon,
  Box,
  Button,
  Card,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Space,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconActivity,
  IconCheck,
  IconCircleDotted,
  IconPlus,
  IconSettings,
  IconUsers,
  IconX,
} from "@tabler/icons-react";

import { useOrganization } from "../api/organizations";
import { useCreateProject, useProjects } from "../api/projects";

export default function OrgOverview() {
  const { orgId } = useParams();
  const navigate = useNavigate();

  const org = useOrganization(orgId);
  const allProjects = useProjects();
  const createProject = useCreateProject();

  const [creatingProject, setCreatingProject] = useState(false);
  const [projectName, setProjectName] = useState("");

  const projectInputRef = useRef<HTMLInputElement>(null);

  const projects = allProjects.data?.filter((p) => p.organization === orgId);

  const isLoading = org.isLoading || allProjects.isLoading;

  useEffect(() => {
    if (creatingProject) projectInputRef.current?.focus();
  }, [creatingProject]);

  const handleCreateProject = () => {
    if (!projectName.trim() || !orgId) return;
    createProject.mutate(
      { name: projectName.trim(), organization: orgId },
      {
        onSuccess: () => {
          setCreatingProject(false);
          setProjectName("");
        },
      },
    );
  };

  if (isLoading) return <Loader color="gray" />;

  return (
    <Box key={orgId} p="xl">
      <Group justify="space-between" mb="xl">
        <Title style={{ fontFamily: "Outfit", fontWeight: 400 }}>
          {org.data?.is_personal ? "Dein Bereich" : org.data?.name}
        </Title>
        {!org.data?.is_personal &&
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconSettings size="1.2em" stroke={1.5} />}
            onClick={() => navigate(`/orgs/${orgId}/settings`)}
          >
            Einstellungen
          </Button>}
      </Group>

      <Stack gap="xl">
        <Box>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
            Projekte
          </Text>

          {projects?.length === 0 && (
            <Text size="sm" c="dimmed">
              Keine Projekte vorhanden
            </Text>
          )}

          <Space h="md" />

          <SimpleGrid cols={3} spacing="sm">
            {projects?.map((project) => (
              <Card
                key={project.id}
                withBorder
                shadow="sm"
                padding="md"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <Group gap="xs">
                  <IconCircleDotted size="1em" stroke={1.5} />
                  <Text size="sm">{project.name}</Text>
                </Group>
              </Card>
            ))}
          </SimpleGrid>

          <Space h="sm" />

          {creatingProject ? (
            <Group gap="xs" maw={400}>
              <TextInput
                ref={projectInputRef}
                size="sm"
                placeholder="Projekt Name"
                value={projectName}
                onChange={(e) => setProjectName(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateProject();
                  if (e.key === "Escape") {
                    setCreatingProject(false);
                    setProjectName("");
                  }
                }}
                style={{ flex: 1 }}
              />
              <ActionIcon
                variant="subtle"
                color="green"
                size="sm"
                onClick={handleCreateProject}
                disabled={!projectName.trim()}
              >
                <IconCheck size="0.9em" stroke={1.5} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                onClick={() => {
                  setCreatingProject(false);
                  setProjectName("");
                }}
              >
                <IconX size="0.9em" stroke={1.5} />
              </ActionIcon>
            </Group>
          ) : (
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconPlus size="0.9em" stroke={1.5} />}
              onClick={() => {
                setProjectName("");
                setCreatingProject(true);
              }}
            >
              Neues Projekt
            </Button>
          )}
        </Box>

        <SimpleGrid cols={2} spacing="sm">
          <Paper withBorder p="md" radius="sm" style={{ borderStyle: "dashed", opacity: 0.6 }}>
            <Group gap="xs" mb="xs">
              <IconActivity size="1.2em" stroke={1.5} />
              <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                Aktivitaet (Activity Feed)
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              Recent card/document changes within this org's projects.
              Filter from the global card_events/document_events by org projects.
              Show timestamp, user, action, entity name.
            </Text>
          </Paper>

          <Paper withBorder p="md" radius="sm" style={{ borderStyle: "dashed", opacity: 0.6 }}>
            <Group gap="xs" mb="xs">
              <IconUsers size="1.2em" stroke={1.5} />
              <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                Mitglieder (Members)
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              List of org members with avatars (from organization_members).
              Show role (owner/member), maybe link to their activity.
              Hide for personal org.
            </Text>
          </Paper>
        </SimpleGrid>
      </Stack>
    </Box>
  );
}
