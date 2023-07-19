import { ActionIcon, Button, Group, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconLink, IconTrash } from "@tabler/icons-react";
import { Card } from "./Card";

export function Board() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal.Root opened={opened} onClose={close} centered size={"45em"}>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>Das ist ein Titel für die Karte</Modal.Title>
            <Group justify="flex-end">
              <Button
                leftSection={<IconLink size={20} />}
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
            <Card />
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>

      <Button variant="default" onClick={open}>
        Karte öffnen
      </Button>
    </>
  );
}
