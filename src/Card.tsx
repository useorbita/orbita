import { Text, Stack, Group, ActionIcon, Tooltip } from "@mantine/core";
import { IconCopy, IconTrash } from "@tabler/icons-react";

export function Card() {
  return (
    <>
      <Group justify="space-between">
        <Stack>
          <Text>Löschen</Text>

          <Tooltip label="Karte Löschen">
            <ActionIcon variant="default">
              <IconTrash />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Link kopieren">
            <ActionIcon variant="default">
              <IconCopy />
            </ActionIcon>
          </Tooltip>

          <Text>Beschreibung</Text>
          <Text>Mitglieder</Text>

          <Text>Checklist/Progress</Text>
        </Stack>
        <Stack>
          <Text>Status (Backlog, Next, etc.)</Text>
          <Text>Label</Text>
          <Text>Priorität</Text>

          <Text>Datum</Text>

          <Text>Mitglieder</Text>
          <Text>Author</Text>
          <Text>Erstellt am</Text>
          <Text>Verändert zuletzt</Text>
        </Stack>
      </Group>
    </>
  );
}
