import { Button, Divider, Select, Stack } from "@mantine/core";
import { IconAdjustments, IconUser } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

export function AppSettings() {
  const navigate = useNavigate();

  return (
    <>
      <Button.Group>
        <Button
          variant="light"
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

      <Divider mt="sm" mb="lg" />

      <Stack w={"20em"}>
        <Select
          label="Farbschema"
          value={"light"}
          placeholder="Hell/Dunkel/Auto"
          data={[
            { value: "light", label: "Hell" },
            { value: "dark", label: "Dunkel" },
            { value: "auto", label: "Automatisch" },
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
