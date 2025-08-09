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

interface LaneProps {
  index: number;
  list: ListsResponse;
  cards: CardsResponse[];
  users: UsersResponse[];
  labels: LabelsResponse[];
}

export function Lane({ index, list, cards, users, labels }: LaneProps) {
  const [addCardMode, setAddCardMode] = useState(false);
  const [newCardName, setNewCardName] = useState("");

  const createCard = useActiveBoardStore((list) => list.createCard);

  const { ref: columnRef } = useDroppable({
    id: list.id,
    type: "column",
    accept: "item",
    collisionPriority: CollisionPriority.Low,
  });

  const { ref: laneRef } = useSortable({
    id: index,
    index,
    type: "column",
    collisionPriority: CollisionPriority.Low,
    accept: ["item", "column"],
  });

  return (
    <Stack className="Lane" ref={laneRef}>
      <Text>{list.title}</Text>

      <Paper h={"75vh"} w={250} style={{ backgroundColor: "#00000009" }}>
        <Stack className="Column" ref={columnRef} style={{ height: "500px" }}>
          {cards
            .filter((card) => card.list === list.id)
            //   .sort((a, b) => a.position - b.position)
            .map((card: CardsResponse, index) => (
              <Card
                index={index}
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
