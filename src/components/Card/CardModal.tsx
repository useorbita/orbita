import {
  ActionIcon,
  Button,
  Grid,
  Group,
  Modal,
  MultiSelect,
  Select,
  Space,
  Stack,
  Text,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { modals } from "@mantine/modals";
import { IconLink, IconTrash } from "@tabler/icons-react";

import { useCard, useUpdateCard } from "../../api/cards";
import { useCommentsByCard } from "../../api/comments";
import { useLabels } from "../../api/labels";
import { CardsPriorityOptions } from "../../api/types";
import { useUsers } from "../../api/users";

import { formatDateTime } from "../../shared/dateUtils";
import { showNotImplemented } from "../../shared/notifications";

import { TextEditor } from "../UI/TextEditor";

export function CardModal({
  open = true,
  close,
  cardId,
}: {
  open?: boolean;
  close: () => void;
  cardId: string;
}) {
  const card = useCard(cardId);
  const comments = useCommentsByCard(cardId);
  const updateCardMutation = useUpdateCard();
  const labels = useLabels();
  const users = useUsers();

  const activeCard = card.data;
  const isLoading = card.isLoading || comments.isLoading;

  const updateCard = (data: Record<string, unknown>) => {
    if (!activeCard) return;
    updateCardMutation.mutate({ id: activeCard.id, data });
  };

  const confirmDelete = () =>
    modals.openConfirmModal({
      title: "Karte löschen",
      centered: true,
      zIndex: 1000,
      children: (
        <Text size="sm">
          Sind Sie sich sicher, dass Sie die Karte "{activeCard?.title}" löschen
          möchten?
        </Text>
      ),
      labels: { confirm: "Karte löschen", cancel: "Nein, nicht löschen" },
      confirmProps: { color: "red" },
      onCancel: () => {},
      onConfirm: () => {
        close();
        showNotImplemented();
      },
    });

  const linkToClipboard = () => showNotImplemented();

  return (
    <Modal.Root opened={open} onClose={close} centered size={"64em"}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>
            {activeCard && <Text>{activeCard.title}</Text>}
          </Modal.Title>
          <Group justify="start">
            <Button
              leftSection={<IconLink size={20} />}
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

        <Modal.Body p={"lg"}>
          {!isLoading && activeCard ? (
            <Grid>
              <Grid.Col span={7}>
                <Text>Beschreibung:</Text>
                <TextEditor
                  content={activeCard.description}
                  onSave={(content) => {
                    updateCard({ description: content });
                  }}
                />
                <Space h={"xl"} />
                <Text>Aktivität:</Text>
                <ul>
                  {comments.data?.map((comment) => (
                    <li key={comment.id}>
                      {comment.author}, {comment.created},
                      <Text
                        dangerouslySetInnerHTML={{ __html: comment.content }}
                      />
                    </li>
                  ))}
                </ul>
                <Text>
                  Verändert am{" "}
                  {activeCard && formatDateTime(activeCard.updated)}
                </Text>
                <Text>
                  Erstellt am {activeCard && formatDateTime(activeCard.created)}
                </Text>
              </Grid.Col>

              <Grid.Col span={5}>
                <Stack>
                  <MultiSelect
                    label="Label"
                    placeholder="Label Auswählen"
                    data={
                      labels.data?.map((label) => ({
                        value: label.id,
                        label: label.name,
                      })) || []
                    }
                    value={activeCard.labels}
                    onChange={(value) => updateCard({ labels: value })}
                    searchable
                  />

                  <MultiSelect
                    label="Mitglieder"
                    placeholder="Personen Auswählen"
                    data={
                      users.data?.map((user) => ({
                        value: user.id,
                        label: user.name || user.username,
                      })) || []
                    }
                    value={activeCard.members}
                    onChange={(value) => updateCard({ members: value })}
                    searchable
                  />

                  <Select
                    label="Priorität"
                    placeholder="Pick value"
                    data={[
                      {
                        value: CardsPriorityOptions.highest,
                        label: "Sehr Hoch",
                      },
                      { value: CardsPriorityOptions.high, label: "Hoch" },
                      { value: CardsPriorityOptions.medium, label: "Mittel" },
                      { value: CardsPriorityOptions.low, label: "Niedrig" },
                      {
                        value: CardsPriorityOptions.lowest,
                        label: "Sehr Niedrig",
                      },
                    ]}
                    value={activeCard.priority}
                    onChange={(value) => {
                      updateCard({ priority: value as CardsPriorityOptions });
                    }}
                    clearable
                  />

                  <DatePickerInput
                    label="Datum"
                    placeholder="Datum auswählen"
                    value={activeCard.date ? new Date(activeCard.date) : null}
                    onChange={(value) => {
                      updateCard(
                        value
                          ? { date: value.toString() }
                          : { date: undefined },
                      );
                    }}
                    clearable
                  />
                </Stack>
              </Grid.Col>
            </Grid>
          ) : (
            <Text>Lade Karte...</Text>
          )}
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
