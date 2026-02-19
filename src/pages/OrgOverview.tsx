import {
  ActionIcon,
  Box,
  Button,
  Group,
  Loader,
  Modal,
  SimpleGrid,
  Space,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconCircleDotted, IconPlus, IconSettings } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useOrganization } from "../api/organizations";
import { useCreateProject, useProjects } from "../api/projects";

export function OrgOverview() {
  const { orgId } = useParams();
  const navigate = useNavigate();

  const org = useOrganization(orgId);
  const allProjects = useProjects();
  const createProject = useCreateProject();

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");

  const projects = allProjects.data?.filter((p) => p.organization === orgId);

  const isLoading = org.isLoading || allProjects.isLoading;

  const handleCreateProject = () => {
    if (!projectName.trim() || !orgId) return;
    createProject.mutate(
      { name: projectName.trim(), organization: orgId },
      {
        onSuccess: () => {
          setProjectModalOpen(false);
          setProjectName("");
        },
      },
    );
  };

  if (isLoading) return <Loader color="gray" />;

  return (
    <Box p="xl">
      <Group justify="space-between" mb="xl">
        <Title style={{ fontFamily: "IBM Plex Serif", fontWeight: 400 }}>
          {org.data?.is_personal ? "Dein Bereich" : org.data?.name}
        </Title>
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={() => navigate(`/orgs/${orgId}/settings`)}
        >
          <IconSettings size="1.2em" stroke={1.5} />
        </ActionIcon>
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
          
          <Space h="md"/>

          <SimpleGrid cols={3} spacing="sm">
            {projects?.map((project) => (
              <Box
                key={project.id}
                p="md"
                style={(theme) => ({
                  border: `1px solid ${theme.colors.gray[3]}`,
                  borderRadius: theme.radius.md,
                  cursor: "pointer",
                })}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <Group gap="xs">
                  <IconCircleDotted size="1em" stroke={1.5} />
                  <Text size="sm">{project.name}</Text>
                </Group>
              </Box>
            ))}

            <Button
              variant="default"
              color="gray"
              leftSection={<IconPlus size="0.9em" stroke={1.5} />}
              onClick={() => {
                setProjectName("");
                setProjectModalOpen(true);
              }}
            >
              Neues Projekt
            </Button>
          </SimpleGrid>
        </Box>
      </Stack>

      <Modal
        opened={projectModalOpen}
        onClose={() => {
          setProjectModalOpen(false);
          setProjectName("");
        }}
        title="Neues Projekt"
        size="sm"
        centered
      >
        <TextInput
          label="Name"
          placeholder="Projekt Name"
          value={projectName}
          onChange={(e) => setProjectName(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreateProject();
          }}
        />
        <Space h="md" />
        <Button
          onClick={handleCreateProject}
          loading={createProject.isPending}
          disabled={!projectName.trim()}
        >
          Erstellen
        </Button>
      </Modal>
    </Box>
  );
}
