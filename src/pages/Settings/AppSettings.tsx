import {
  Box,
  Center,
  SegmentedControl,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

export function AppSettings() {
  return (
    <>
      <Text>Einstellungen</Text>
      <Stack w={"20em"} mt={"xl"}>
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
          ]}
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
    </>
  );
}
