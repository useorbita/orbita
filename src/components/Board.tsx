import { ActionIcon, Button, Group, Modal, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconLink, IconTrash } from "@tabler/icons-react";
import { Card } from "./Card";
import { useState } from "react";
import { CardsResponse } from "../api/types";

export function Board({ cards }: { cards: CardsResponse[] }) {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedCard, setSelectedCard] = useState<CardsResponse>();

  return (
    <>
      <Modal.Root opened={opened} onClose={close} centered size={"45em"}>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>{selectedCard && selectedCard.title}</Modal.Title>
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
            {selectedCard ? (
              <Card card={selectedCard} />
            ) : (
              <Text>Lade Karte...</Text>
            )}
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>

      {cards &&
        cards.map((card: CardsResponse) => (
          <Button
            key={card.id}
            onClick={() => {
              setSelectedCard(card);
              open();
            }}
          >
            <strong>{card.title}</strong>
          </Button>
        ))}

      {/* <pre>{JSON.stringify(cards, null, 2)}</pre> */}
    </>
  );
}
