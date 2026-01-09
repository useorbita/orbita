import {
  ActionIcon,
  Box,
  FocusTrap,
  Paper,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconCheck, IconPlus, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { useDroppable } from "@dnd-kit/react";
import { CollisionPriority } from "@dnd-kit/abstract";
import {
  CardsResponse,
  LabelsResponse,
  ListsResponse,
  UsersResponse,
} from "../../api/types";
import { useActiveBoardStore } from "../../stores/activeBoardStore";
import { Card } from "../Card/Card";
import { useSortable } from "@dnd-kit/react/sortable";

interface ListProps {
  index: number;
  listId: string;
  cards: CardsResponse[];
  users: UsersResponse[];
  labels: LabelsResponse[];
}

export function List({ index, listId, cards, users, labels }: ListProps) {
  const [addCardMode, setAddCardMode] = useState(false);
  const [newCardName, setNewCardName] = useState("");

  const createCard = useActiveBoardStore((list) => list.createCard);

  const { ref: listRef } = useSortable({
    id: listId,
    index,
    type: "column",
    collisionPriority: CollisionPriority.Low,
    accept: ["column"],
  });

  return (
    <Stack className="List" ref={listRef}>
      <Text>{listId}</Text>

      <Paper h={"75vh"} w={250} style={{ backgroundColor: "#00000009" }}>
        <Stack className="Column" ref={listRef} style={{ height: "500px" }}>
          {cards
            // .filter((card) => card.list === listId)
            //   .sort((a, b) => a.position - b.position)
            .map((card: CardsResponse, index) => (
              <Card
                index={index}
                listId={listId}
                key={card.id}
                card={card}
                users={users}
                labels={labels}
              />
            ))}

          <Box m="md">
            {addCardMode ? (
              <FocusTrap active={addCardMode}>
                <TextInput
                  // variant="unstyled"
                  onChange={(event) =>
                    setNewCardName(event.currentTarget.value)
                  }
                  rightSection={
                    <>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={() => {
                          createCard({
                            title: newCardName,
                            listId: list.id,
                          });

                          setNewCardName("");
                          setAddCardMode(false);
                        }}
                      >
                        <IconCheck size="1em" />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={() => {
                          setAddCardMode(false);
                        }}
                      >
                        <IconX size="1em" />
                      </ActionIcon>
                    </>
                  }
                  rightSectionWidth={66}
                />
              </FocusTrap>
            ) : (
              <Text size="sm" c={"dimmed"} onClick={() => setAddCardMode(true)}>
                <IconPlus size={"1em"} /> Neue Karte anlegen
              </Text>
            )}
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
}
