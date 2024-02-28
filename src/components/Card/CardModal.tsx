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
import { notifications } from "@mantine/notifications";
import { IconLink, IconTrash } from "@tabler/icons-react";
import { useEffect } from "react";
import { CardsPriorityOptions } from "../../api/types";
import { useActiveBoardStore } from "../../stores/activeBoardStore";
import { useActiveCardStore } from "../../stores/activeCardStore";
import { TextEditor } from "../App/TextEditor";

export function CardModal({
  open,
  close,
  cardId,
}: {
  open: boolean;
  close: () => void;
  cardId: string;
}) {
  const isLoading = useActiveCardStore((state) => state.isLoading);
  const getActiveCard = useActiveCardStore((state) => state.getActiveCard);
  const activeCard = useActiveCardStore((state) => state.activeCard);
  const comments = useActiveCardStore((state) => state.comments);

  const updateCard = useActiveCardStore((state) => state.updateCard);

  const labels = useActiveBoardStore((state) => state.labels);
  const users = useActiveBoardStore((state) => state.users);

  useEffect(() => {
    getActiveCard({ cardId });
  }, [cardId]);

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
          {!isLoading && activeCard
            ? (
              <Grid>
                <Grid.Col span={7}>
                  <Text>Beschreibung:</Text>
                  <TextEditor
                    content={activeCard.description}
                    onSave={(content) => {
                      updateCard({
                        cardId: activeCard.id,
                        data: {
                          description: content,
                        },
                      });
                    }}
                  />
                  <Space h={"xl"} />
                  <Text>Aktivität:</Text>
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
                  <Text>
                    Verändert am {activeCard &&
                      new Date(activeCard.updated).toLocaleString("de")}
                  </Text>
                  <Text>
                    Erstellt am {activeCard &&
                      new Date(activeCard.created).toLocaleString("de")}
                  </Text>
                </Grid.Col>

                <Grid.Col span={5}>
                  <Stack>
                    <MultiSelect
                      label="Label"
                      placeholder="Label Auswählen"
                      data={labels.map((label) => ({
                        value: label.id,
                        label: label.title,
                      }))}
                      value={activeCard.labels}
                      onChange={(value) =>
                        updateCard({
                          cardId: activeCard.id,
                          data: { labels: value },
                        })}
                      searchable
                    />

                    <MultiSelect
                      label="Mitglieder"
                      placeholder="Personen Auswählen"
                      data={users.map((user) => ({
                        value: user.id,
                        label: user.id,
                      }))}
                      value={activeCard.members}
                      onChange={(value) =>
                        updateCard({
                          cardId: activeCard.id,
                          data: { members: value },
                        })}
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
                        updateCard({
                          cardId: activeCard.id,
                          data: { priority: value },
                        });
                      }}
                      clearable
                    />

                    <DatePickerInput
                      label="Datum"
                      placeholder="Datum auswählen"
                      value={activeCard.date ? new Date(activeCard.date) : null}
                      onChange={(value) => {
                        updateCard({
                          cardId: activeCard.id,
                          data: value
                            ? { date: value.toUTCString() }
                            : { date: null },
                        });
                      }}
                      clearable
                    />
                  </Stack>
                </Grid.Col>
              </Grid>
            )
            : <Text>Lade Karte...</Text>}
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
