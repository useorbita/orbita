import {
  Box,
  Button,
  Center,
  Container,
  Group,
  ScrollArea,
  SegmentedControl,
  Select,
  Space,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { IconBrush, IconLogout, IconMoon, IconSun } from "@tabler/icons-react";
import { useLogout } from "../api/auth";
import { pb } from "../api/pocketbase";
import { UserAvatar } from "../components/UI/UserAvatar";

export function Settings() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const logout = useLogout();

  return (
    <ScrollArea>
      <Stack w="600">
        <Group>
          <Title order={4}>Dein Profil</Title>

          <Button
            leftSection={<IconLogout size={"1em"} />}
            color="red"
            variant="light"
            onClick={() => logout.mutate()}
          >
            Abmelden
          </Button>
        </Group>

        <Stack w={"20em"}>
          <TextInput
            label="Name"
            description="Dein Anzeigename"
            value={pb.authStore.record?.name ?? ""}
            readOnly
          />
          <TextInput
            label="E-Mail"
            description="Deine E-Mail-Adresse"
            value={pb.authStore.record?.email ?? ""}
            readOnly
          />
        </Stack>

        <Space h="lg" />

        <Title order={4}>Einstellungen</Title>

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
            //@ts-ignore somehow it is not possible to type the values of the SegmentedControl
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
      </Stack>
    </ScrollArea>
  );
}
