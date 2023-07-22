import { ActionIcon, Button, Group, Modal, Stack, Text } from "@mantine/core";
import { CardsResponse } from "../api/types";
import { notifications } from "@mantine/notifications";
import { IconLink, IconTrash } from "@tabler/icons-react";

export function Card({
  open,
  close,
  card,
}: {
  open: boolean;
  close: () => void;
  card?: CardsResponse;
}) {
  console.log(card);

  return (
    <Modal.Root opened={open} onClose={close} centered size={"45em"}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>{card && card.title}</Modal.Title>
          <Group position="right">
            <Button
              leftIcon={<IconLink size={20} />}
              variant="subtle"
              color="gray"
              size="xs"
              onClick={() =>
                notifications.show({
                  title: "Noch nicht implementiert",
                  message:
                    "Das ist leider noch nicht implementiert. Aber es wird super!",
                  withBorder: true,
                  color: "gray",
                })
              }
            >
              Link kopieren
            </Button>

            <ActionIcon color="gray" variant="subtle">
              <IconTrash size={20} />
            </ActionIcon>

            <Modal.CloseButton />
          </Group>
        </Modal.Header>
        <Modal.Body mt={"xl"}>
          {card ? (
            <Group>
              <Stack>
                <Text>{card && card.description}</Text>
                <Text>Checklist/Progress</Text>
                <Text>Kommentare</Text>
              </Stack>
              <Stack>
                <Text>Status (Backlog, Next, etc.)</Text>
                <Text>Label</Text>
                <Text>Mitglieder</Text>
                <Text>Priorität</Text>
                <Text>Datum</Text>
                <Text>Author</Text>
                <Text>Erstellt am</Text>
                <Text>Verändert zuletzt</Text>
              </Stack>
            </Group>
          ) : (
            <Text>Lade Karte...</Text>
          )}
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
