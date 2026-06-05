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
import { useDroppable } from "@dnd-kit/react";
import { keyAfter } from "../../shared/fractionalIndex";

import { useCreateCard } from "../../api/cards";
import type {
  CardsResponse,
  LabelsResponse,
  UsersResponse,
} from "../../api/types";

import { Card } from "../Card/Card";

/** Equivalent to CollisionPriority.Low from @dnd-kit/abstract. */
const DROPPABLE_LOW_PRIORITY = 1;

interface ListProps {
  listId: string;
  listTitle: string;
  boardId: string;
  cardIds: string[];
  cardMap: Record<string, CardsResponse>;
  users: UsersResponse[];
  labels: LabelsResponse[];
}

export function List({
  listId,
  listTitle,
  boardId,
  cardIds,
  cardMap,
  users,
  labels,
}: ListProps) {
  const [addingCard, setAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");

  const createCard = useCreateCard();

  // Column as a droppable target (for cards dropped from other lists / empty lists)
  // Low collision priority so cards within the list take precedence for hit-testing.
  const { ref: droppableRef } = useDroppable({
    id: listId,
    collisionPriority: DROPPABLE_LOW_PRIORITY,
  });

  function handleAddCard() {
    if (!newCardTitle.trim()) return;

    // Compute the orderKey so the new card appears at the end of the list
    const lastCardId = cardIds.length > 0 ? cardIds[cardIds.length - 1] : null;
    const lastKey = lastCardId ? cardMap[lastCardId]?.orderKey || null : null;
    const newOrderKey = keyAfter(lastKey);

    createCard.mutate(
      {
        title: newCardTitle.trim(),
        list: listId,
        board: boardId,
        orderKey: newOrderKey,
      },
      {
        onSuccess: () => {
          setNewCardTitle("");
          setAddingCard(false);
        },
      },
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
        minHeight: 0,
      }}
    >
      <Text fw={500} size="sm">
        {listTitle}
      </Text>

      <Paper
        ref={droppableRef}
        w={300}
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#00000009",
        }}
      >
        <ScrollArea style={{ flex: 1, minHeight: 0 }} type="scroll">
          <Stack gap="xs" p="xs">
            {cardIds.map((cardId: string, idx: number) => {
              const card = cardMap[cardId];
              if (!card) return null;
              return (
                <Card
                  index={idx}
                  key={cardId}
                  card={card}
                  listId={listId}
                  boardId={boardId}
                  users={users}
                  labels={labels}
                />
              );
            })}
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
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="gray"
                  onClick={() => setAddingCard(false)}
                >
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
