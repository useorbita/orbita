import {
  ActionIcon,
  Button,
  Container,
  Grid,
  Group,
  MultiSelect,
  Space,
  Stack,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconArrowLeft, IconTrash } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";

export function BoardSettings() {
  const navigate = useNavigate();
  const { boardId } = useParams();

  const descriptionSpan = 4;
  const inputSpan = 6;
  const offset = 1;

  const confirmDelete = () =>
    modals.openConfirmModal({
      title: "Board löschen",
      centered: true,
      zIndex: 1000,
      children: (
        <Text size="sm">
          Sind Sie sich sicher, dass Sie dieses Board löschen möchten? Das Board
          und alle dazugehörigen Daten werden gelöscht. Dies kann nicht
          rückgängig gemacht werden
        </Text>
      ),
      labels: { confirm: "Board löschen", cancel: "Nein, nicht löschen" },
      confirmProps: { color: "red" },
      onCancel: () => console.log("Cancel"),
      onConfirm: () => {
        close();
        notifications.show({
          title: "Noch nicht implementiert",
          message: "Das ist leider noch nicht implementiert :(",
          withBorder: true,
          color: "gray",
        });
      },
    });

  return (
    <Container>
      <Group justify="space-between" mb="xl">
        <Group gap={"xs"}>
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

        <Button
          leftSection={<IconTrash size={20} />}
          variant="subtle"
          color="gray"
          size="xs"
          onClick={confirmDelete}
        >
          Board löschen
        </Button>
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
            <Text>Öffentlich</Text>
            <Text size="sm" c="dimmed">
              Öffentliche Boards können über einen Link eingesehen werden.
              Änderungen und Kommentare können nicht vorgenommen werden.
            </Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={inputSpan} offset={offset}>
          <Switch />
          <Space h={"sm"} />
          <TextInput
            placeholder="URL"
            disabled
            variant="filled"
            value={"Link..."}
          />
        </Grid.Col>
      </Grid>
    </Container>
  );
}
