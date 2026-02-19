import {
  ActionIcon,
  Button,
  ColorPicker,
  Container,
  Grid,
  Group,
  MultiSelect,
  ScrollArea,
  Space,
  Stack,
  Switch,
  Text,
  Title,
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
        notifications.show({
          title: "Noch nicht implementiert",
          message: "Das ist leider noch nicht implementiert :(",
          withBorder: true,
          color: "gray",
        });
      },
    });

  return (
    <ScrollArea p="xl">
      <Group justify="space-between" mb="xl">
        <Group gap={"xs"}>
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => {
              navigate("/boards/" + boardId);
            }}
          >
            <IconArrowLeft size="1em" />
          </ActionIcon>
          <Text>Zurück zum Board</Text>
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

      <Title style={{ fontFamily: "IBM Plex Serif", fontWeight: 400 }}>
        Einstellungen des Boards
      </Title>

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

      <Grid align="flex-start">
        <Grid.Col span={descriptionSpan}>
          <Stack gap={"xs"}>
            <Text>Label</Text>
            <Text size="sm" c="dimmed">
              TODO: Implement labels with titles and colors
            </Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={inputSpan} offset={offset}>
          <ColorPicker
            format="hex"
            // value={value}
            onChange={(val) => console.log(val)}
            withPicker={false}
            swatches={[
              "#2e2e2e",
              "#868e96",
              "#fa5252",
              "#e64980",
              "#be4bdb",
              "#7950f2",
              "#4c6ef5",
              "#228be6",
              "#15aabf",
              "#12b886",
              "#40c057",
              "#82c91e",
              "#fab005",
              "#fd7e14",
            ]}
          />
        </Grid.Col>
      </Grid>

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
    </ScrollArea>
  );
}
