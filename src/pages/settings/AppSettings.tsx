import {
  Box,
  Button,
  Center,
  SegmentedControl,
  Select,
  Space,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconAdjustments,
  IconMoon,
  IconSun,
  IconToggleRight,
  IconUser,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

export function AppSettings() {
  const navigate = useNavigate();

  return (
    <>
      <Button.Group>
        <Button
          variant="outline"
          color="dark"
          leftIcon={<IconAdjustments />}
          onClick={() => navigate("/settings")}
        >
          Anwendung
        </Button>
        <Button
          variant="subtle"
          color="dark"
          leftIcon={<IconUser />}
          onClick={() => navigate("/settings/me")}
        >
          Profil
        </Button>
      </Button.Group>

      <Space h="xl" />
      <Space h="md" />

      <Stack w={"20em"}>
        <Text size="sm">Farbschema</Text>
        <SegmentedControl
          data={[
            {
              value: "light",
              label: (
                <Center>
                  <IconSun size="1rem" />
                  <Box ml={10}>Hell</Box>
                </Center>
              ),
            },
            {
              value: "dark",
              label: (
                <Center>
                  <IconMoon size="1rem" />
                  <Box ml={10}>Dunkel</Box>
                </Center>
              ),
            },
            {
              value: "auto",
              label: (
                <Center>
                  <IconToggleRight size="1rem" />
                  <Box ml={10}>Auto</Box>
                </Center>
              ),
            },
          ]}
        />

        <Select
          label="Sprache"
          value={"de"}
          placeholder="Sprache auswählen"
          data={[{ value: "de", label: "Deutsch" }]}
        />
      </Stack>
    </>
  );
}
