import { useState } from "react";

import {
  ActionIcon,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconCheck, IconPlus, IconX } from "@tabler/icons-react";

import { useCreateCard } from "../../api/cards";
import type { CardsResponse, LabelsResponse, UsersResponse } from "../../api/types";

import { Card } from "../Card/Card";

interface ListProps {
  index: number;
  listId: string;
  listTitle: string;
  boardId: string;
  cards: CardsResponse[];
  users: UsersResponse[];
  labels: LabelsResponse[];
}

export function List({ index, listId, listTitle, boardId, cards, users, labels }: ListProps) {
  const [addingCard, setAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");

  const createCard = useCreateCard();

  function handleAddCard() {
    if (!newCardTitle.trim()) return;
    createCard.mutate(
      { title: newCardTitle.trim(), list: listId, board: boardId },
      {
        onSuccess: () => {
          setNewCardTitle("");
          setAddingCard(false);
        },
      }
    );
  }

  return (
    <div
      className="Column"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "var(--mantine-spacing-xs)",
        minHeight: 500,
      }}
    >
      <Text fw={500} size="sm">{listTitle}</Text>

      <Paper
        w={300}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#00000009",
        }}
      >
        <ScrollArea style={{ flex: 1 }} type="scroll">
          <Stack gap="xs" p="xs">
            {cards.map((card: CardsResponse, index) => (
              <Card
                index={index}
                listId={listId}
                boardId={boardId}
                key={card.id}
                card={card}
                users={users}
                labels={labels}
              />
            ))}
          </Stack>
        </ScrollArea>

        <Stack gap="xs" p="xs">
          {addingCard ? (
            <>
              <TextInput
                placeholder="Card title"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddCard();
                  if (e.key === "Escape") setAddingCard(false);
                }}
                autoFocus
                size="xs"
              />
              <Group gap="xs">
                <ActionIcon
                  size="sm"
                  variant="filled"
                  onClick={handleAddCard}
                  loading={createCard.isPending}
                >
                  <IconCheck size="0.9em" />
                </ActionIcon>
                <ActionIcon size="sm" variant="subtle" color="gray" onClick={() => setAddingCard(false)}>
                  <IconX size="0.9em" />
                </ActionIcon>
              </Group>
            </>
          ) : (
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={() => setAddingCard(true)}
              title="Add card"
            >
              <IconPlus size="1em" />
            </ActionIcon>
          )}
        </Stack>
      </Paper>
    </div>
  );
}
