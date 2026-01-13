import { CollisionPriority } from "@dnd-kit/abstract";
import { useSortable } from "@dnd-kit/react/sortable";
import { Paper, ScrollArea, Stack, Text } from "@mantine/core";
import { CardsResponse, LabelsResponse, UsersResponse } from "../../api/types";
import { Card } from "../Card/Card";

interface ListProps {
  index: number;
  listId: string;
  cards: CardsResponse[];
  users: UsersResponse[];
  labels: LabelsResponse[];
}

export function List({ index, listId, cards, users, labels }: ListProps) {
  const { ref: columnRef } = useSortable({
    id: listId,
    index,
    type: "column",
    accept: ["item"],
    collisionPriority: CollisionPriority.Low,
    group: "columns",
  });

  return (
    <div
      ref={columnRef}
      className="Column"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "var(--mantine-spacing-xs)",
        minHeight: 500,
      }}
    >
      <Text>{listId}</Text>

      <Paper
        w={250}
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
                key={card.id}
                card={card}
                users={users}
                labels={labels}
              />
            ))}
          </Stack>
        </ScrollArea>
      </Paper>
    </div>
  );
}
