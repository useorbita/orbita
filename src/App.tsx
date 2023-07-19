import { AppShell, Burger, Button, Group, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconPlus } from "@tabler/icons-react";
import { Project } from "./Project";

function App() {
  const [opened, { toggle }] = useDisclosure();
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
            <Text>
              <strong>Projekt A</strong>
            </Text>

            <Text>
              <strong>Projekt B</strong>
            </Text>

            <Text>
              <strong>Projekt C</strong>
            </Text>
          </Stack>

          <Button
            justify="center"
            fullWidth
            leftSection={<IconPlus size={18} />}
            variant="default"
            mt="md"
            size="xs"
            onClick={() =>
              notifications.show({
                title: "Noch nicht implementiert",
                message: "Das ist leider noch nicht implementiert. Aber es wird super!",
                withBorder: true,
                color: 'gray',
              })
            }
          >
            Projekt hinzufügen
          </Button>
        </AppShell.Navbar>

        <AppShell.Main>
          <Project />
        </AppShell.Main>
      </AppShell>
    </>
  );
}

export default App;
