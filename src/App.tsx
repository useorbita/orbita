import { AppShell, Burger, Button, Group, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconPlus } from "@tabler/icons-react";
import { Project } from "./Project";
import { useEffect, useState } from "react";
import { pb } from "./main";

function App() {
  const [opened, { toggle }] = useDisclosure();
  const [projects, setProjects] = useState();
  const [selectedProject, setSelectedProject] = useState();

  useEffect(() => {
    (async () => {
      const result = await pb.collection("projects").getFullList();

      console.log(result);
      setProjects(result);
      setSelectedProject(result[0]);
    })();
  }, []);

  return (
    <>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: "xs",
          collapsed: { mobile: !opened },
        }}
        padding="md"
      >
        <AppShell.Header>
          <Group h="100%" px="md">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="xs"
              size="sm"
            />
            Mello
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md">
          <Stack>
            {projects &&
              projects.map((project) => (
                <Button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                >
                  <strong>{project.name}</strong>
                </Button>
              ))}
          </Stack>

          <Button
            leftSection={<IconPlus size={18} />}
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
        </AppShell.Navbar>

        <AppShell.Main>
          {selectedProject ? (
            <Project project={selectedProject} />
          ) : (
            <Text>Lade Projekt...</Text>
          )}
        </AppShell.Main>
      </AppShell>
    </>
  );
}

export default App;
