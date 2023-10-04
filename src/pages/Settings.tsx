import {
  Avatar,
  Box,
  Center,
  Container,
  Group,
  SegmentedControl,
  Select,
  Space,
  Stack,
  Tabs,
  Text,
  Title,
  rem,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconBrush,
  IconMoon,
  IconSettings,
  IconSun,
  IconUser,
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { pb } from "../api/pocketbase";

export function Settings() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Container>
      <Title order={4}>Einstellungen</Title>

      <Space h="xl" />

      <Tabs
        variant="outline"
        value={location.pathname === "/settings" ? "app" : "me"}
      >
        <Tabs.List mb={"xl"}>
          <Tabs.Tab
            value="app"
            leftSection={
              <IconSettings style={{ width: rem(14), height: rem(14) }} />
            }
            onClick={() => navigate("/settings")}
          >
            Anwendung
          </Tabs.Tab>
          <Tabs.Tab
            value="me"
            leftSection={
              <IconUser style={{ width: rem(14), height: rem(14) }} />
            }
            onClick={() => navigate("/settings/me")}
          >
            Dein Profil
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="app">
          <Stack w={"20em"}>
            <Text size="sm">Farbschema</Text>
            <SegmentedControl
              data={[
                {
                  value: "light",
                  label: (
                    <Center>
                      <IconSun size="1em" />
                      <Box ml={10}>Hell</Box>
                    </Center>
                  ),
                },
                {
                  value: "dark",
                  label: (
                    <Center>
                      <IconMoon size="1em" />
                      <Box ml={10}>Dunkel</Box>
                    </Center>
                  ),
                },
                {
                  value: "auto",
                  label: (
                    <Center>
                      <IconBrush size="1em" />
                      <Box ml={10}>System</Box>
                    </Center>
                  ),
                },
              ]}
              onChange={setColorScheme}
              value={colorScheme}
            />

            <Select
              label="Sprache"
              value={"de"}
              placeholder="Sprache auswählen"
              data={[
                { value: "de", label: "Deutsch" },
                { value: "en", label: "English" },
                { value: "fr", label: "Francais" },
              ]}
            />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="me">
          <Group>
            <Avatar radius="xl">
              {pb.authStore.model?.name.substring(0, 2)}
            </Avatar>
            <div>
              <Text size="sm">{pb.authStore.model?.name}</Text>
              <Text size="xs" c="dimmed">
                {pb.authStore.model?.email}
              </Text>
            </div>
          </Group>

          <ul>
            <li>Name</li>
            <li>Avatar</li>
            <li>Passwort ändern</li>
            <li>Konto löschen</li>
          </ul>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
