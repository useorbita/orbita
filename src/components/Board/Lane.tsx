import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import {
  CardsResponse,
  LabelsResponse,
  ListsResponse,
  UsersResponse,
} from "../../api/types";
import { useActiveBoardStore } from "../../stores/activeBoardStore";
import { Card } from "../Card/Card";

interface LaneProps {
  list: ListsResponse;
  cards: CardsResponse[];
  users: UsersResponse[];
  labels: LabelsResponse[];
}

export function Lane({ list, cards, users, labels }: LaneProps) {
  const [addCardMode, setAddCardMode] = useState(false);
  const [newCardName, setNewCardName] = useState("");

  const createCard = useActiveBoardStore((list) => list.createCard);

  const {
    attributes,
    setNodeRef,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
    data: {
      type: "container",
    },
  });

  return (
    <div
      key={list.id}
      {...attributes}
      ref={setNodeRef}
      style={{
        transition,
        transform: CSS.Translate.toString(transform),
      }}
      {...listeners}
    >
      <Text>
        {list.title}
        {isDragging && "..."}
      </Text>

      <Paper
        h={"75vh"}
        w={250}
        style={{ backgroundColor: "#00000009" }}
        ref={setNodeRef}
      >
        <SortableContext
          items={cards
            .filter((card) => card.list === list.id)
            // .sort((a, b) => a.position - b.position)
            .map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <Stack>
            {cards
              .filter((card) => card.list === list.id)
              //   .sort((a, b) => a.position - b.position)
              .map((card: CardsResponse) => (
                <Card key={card.id} card={card} users={users} labels={labels} />
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
                <Text
                  size="sm"
                  c={"dimmed"}
                  onClick={() => setAddCardMode(true)}
                >
                  <IconPlus size={"1em"} /> Neue Karte anlegen
                </Text>
              )}
            </Box>
          </Stack>
        </SortableContext>
      </Paper>
    </div>
  );
}
