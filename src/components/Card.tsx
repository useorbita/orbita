import { ActionIcon, Button, Group, Modal, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconLink, IconTrash } from "@tabler/icons-react";
import { CardsResponse } from "../api/types";

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
                <Text>Kommentare</Text>
              </Stack>
              <Stack>
                <Text>Status: {card && card.state}</Text>
                <Text>Labels: {card && card.labels}</Text>
                <Text>Mitglieder: {card && card.members}</Text>
                <Text>Priorität: {card && card.priority}</Text>
                <Text>Datum: {card && card.dueDate}</Text>
                <Text>Author: {card && card.author}</Text>
                <Text>Erstellt am {card && card.created}</Text>
                <Text>Verändert zuletzt{card && card.updated}</Text>
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
