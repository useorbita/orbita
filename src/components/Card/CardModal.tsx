import { ActionIcon, Button, Group, Modal, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconLink, IconTrash } from "@tabler/icons-react";
import { CardsResponse, Collections, CommentsResponse } from "../../api/types";
import { useEffect, useState } from "react";
import { pb } from "../../api/pocketbase";

export function CardModal({
  open,
  close,
  cardId,
}: {
  open: boolean;
  close: () => void;
  cardId: string;
}) {
  const [card, setCard] = useState<CardsResponse>();
  const [comments, setComments] = useState<CommentsResponse[]>([]);

  useEffect(() => {
    (async () => {
      const [selectedCard, allComments] = await Promise.all([
        pb.collection(Collections.Cards).getOne<CardsResponse>(cardId),
        pb.collection(Collections.Comments).getFullList<CommentsResponse>({
          filter: `card = "${cardId}"`,
          sort: "-created",
        }),
      ]);

      setCard(selectedCard);
      setComments(allComments);
    })();
  }, [cardId]);

  const confirmDelete = () =>
    modals.openConfirmModal({
      title: "Karte löschen",
      centered: true,
      zIndex: 1000,
      children: (
        <Text size="sm">
          Sind Sie sich sicher, dass Sie die Karte "{card?.title}" löschen
          möchten?
        </Text>
      ),
      labels: { confirm: "Karte löschen", cancel: "Nein, nicht löschen" },
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

  const linkToClipboard = () =>
    notifications.show({
      title: "Noch nicht implementiert",
      message: "Das ist leider noch nicht implementiert :(",
      withBorder: true,
      color: "gray",
    });

  return (
    <Modal.Root opened={open} onClose={close} centered size={"50em"}>
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
              onClick={linkToClipboard}
            >
              Link kopieren
            </Button>

            <ActionIcon color="gray" variant="subtle" onClick={confirmDelete}>
              <IconTrash size={20} />
            </ActionIcon>

            <Modal.CloseButton />
          </Group>
        </Modal.Header>
        <Modal.Body mt={"xl"}>
          {card ? (
            <Stack>
              <Text dangerouslySetInnerHTML={{ __html: card.description }} />
              <Text>Status: {card && card.state}</Text>
              <Text>Labels: {card && card.labels}</Text>
              <Text>Mitglieder: {card && card.members}</Text>
              <Text>Priorität: {card && card.priority}</Text>
              <Text>Datum: {card && card.date}</Text>
              <Text>Author: {card && card.author}</Text>
              <Text>Erstellt am {card && card.created}</Text>
              <Text>Verändert zuletzt{card && card.updated}</Text>
              <Text>Kommentare:</Text>
              <ul>
                {comments.map((comment) => (
                  <li key={comment.id}>
                    {comment.author}, {comment.created},
                    <Text
                      dangerouslySetInnerHTML={{ __html: comment.content }}
                    />
                  </li>
                ))}
              </ul>
            </Stack>
          ) : (
            <Text>Lade Karte...</Text>
          )}
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
