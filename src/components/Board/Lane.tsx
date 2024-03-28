import { Draggable, Droppable } from "@hello-pangea/dnd";
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

  return (
    <Draggable draggableId={list.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Text>
            {list.title}
          </Text>
          <Droppable droppableId={list.id} type="CARD">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {
                  // style={{
                  //   backgroundColor: snapshot.isDraggingOver ? "blue" : "grey",
                  // }}
                  ...provided.droppableProps
                }
              >
                <Paper
                  h={"75vh"}
                  w={250}
                  style={{ backgroundColor: "#00000009" }}
                >
                  <Stack>
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

                    {provided.placeholder}

                    <Box m="md">
                      {addCardMode
                        ? (
                          <FocusTrap active={addCardMode}>
                            <TextInput
                              // variant="unstyled"
                              onChange={(event) =>
                                setNewCardName(event.currentTarget.value)}
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
                        )
                        : (
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
                </Paper>
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
}
