import {
  ActionIcon,
  Button,
  Grid,
  Group,
  MultiSelect,
  Space,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";

export function BoardSettings() {
  const navigate = useNavigate();
  const { boardId } = useParams();

  const descriptionSpan = 4;
  const inputSpan = 6;
  const offset = 1;

  return (
    <>
      <Group>
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={() => {
            navigate("/" + boardId);
          }}
        >
          <IconArrowLeft size="1em" />
        </ActionIcon>
        <Text>{boardId} Einstellungen</Text>
      </Group>

      <Space h={"xl"} />

      <Grid align="flex-start">
        <Grid.Col span={descriptionSpan}>
          <Stack gap={"xs"}>
            <Text>Name des Boards</Text>
            <Text size="sm" c="dimmed">
              Dies ist der Name des Boards der jedem angezeigt wird
            </Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={inputSpan} offset={offset}>
          <TextInput placeholder="Name des Boards" />
        </Grid.Col>
      </Grid>

      <Space h={"xl"} />

      <Grid align="flex-start">
        <Grid.Col span={descriptionSpan}>
          <Stack gap={"xs"}>
            <Text>Mitglieder</Text>
            <Text size="sm" c="dimmed">
              Folgende Mitglieder haben Zugriff auf das Board
            </Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={inputSpan} offset={offset}>
          <MultiSelect
            placeholder="Auswählen"
            data={["Max", "Erika", "Jane", "John"]}
          />
        </Grid.Col>
      </Grid>

      <Space h={"xl"} />

      <Text>- Label</Text>
      <Text>- States</Text>

      <Space h={"xl"} />

      <Grid align="flex-start">
        <Grid.Col span={descriptionSpan}>
          <Stack gap={"xs"}>
            <Text>Board löschen</Text>
            <Text size="sm" c="dimmed">
              Das Board wird und alle dazugehörigen Daten werden gelöscht. Dies
              kann nicht rückgängig gemacht werden
            </Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={inputSpan} offset={offset}>
          <Button color={"red"}>Board löschen</Button>
        </Grid.Col>
      </Grid>
    </>
  );
}
