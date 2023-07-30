import { Button, Divider, Group, Select, Stack } from "@mantine/core";
import { IconAdjustments, IconUser } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

export function AppSettings() {
  const navigate = useNavigate();

  return (
    <>
      <Group>
        <Button
          variant="light"
          leftIcon={<IconAdjustments />}
          onClick={() => navigate("/settings")}
        >
          Anwendung
        </Button>
        <Button
          variant="subtle"
          leftIcon={<IconUser />}
          onClick={() => navigate("/settings/me")}
        >
          Profil
        </Button>
      </Group>

      <Divider mt="sm" mb="lg" />

      <Stack w={"20em"}>
        <Select
          label="Farbschema"
          placeholder="Hell/Dunkel/Auto"
          data={[
            { value: "light", label: "Hell" },
            { value: "dark", label: "Dunkel" },
            { value: "auto", label: "Automatisch" },
          ]}
        />

        <Select
          label="Sprache"
          placeholder="Sprache auswählen"
          data={[{ value: "de", label: "Deutsch" }]}
        />
      </Stack>
    </>
  );
}
