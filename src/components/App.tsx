import { AppShell, Button, Header, Navbar, Stack, Text } from "@mantine/core";
import { useState, useEffect } from "react";
import { pb } from "../api/pocketbase";
import { ProjectsResponse } from "../api/types";
import { Project } from "./Project";
import { IconPlus } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

export function App() {
  const [projects, setProjects] = useState<ProjectsResponse[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectsResponse>();

  useEffect(() => {
    (async () => {
      const result = await pb
        .collection("projects")
        .getFullList<ProjectsResponse>();

      console.log(result);
      setProjects(result);
      setSelectedProject(result[0]);
    })();
  }, []);

  return (
    <AppShell
      padding="md"
      header={
        <Header height={60} p="xs">
          <Text>Mello</Text>
        </Header>
      }
      navbar={
        <Navbar width={{ base: 300 }} p="xs">
          <Stack>
            {projects &&
              projects.map((project) => (
                <Button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  variant="subtle"
                >
                  <strong>{project.name}</strong>
                </Button>
              ))}
          </Stack>

          <Button
            leftIcon={<IconPlus size={18} />}
            variant="default"
            mt="xl"
            size="xs"
            onClick={() =>
              notifications.show({
                title: "Noch nicht implementiert",
                message:
                  "Das ist leider noch nicht implementiert. Aber es wird super!",
                withBorder: true,
                color: "gray",
              })
            }
          >
            Projekt hinzufügen
          </Button>
        </Navbar>
      }
      styles={(theme) => ({
        main: {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      })}
    >
      {selectedProject ? (
        <Project project={selectedProject} />
      ) : (
        <Text>Lade Projekt...</Text>
      )}
    </AppShell>
  );
}
