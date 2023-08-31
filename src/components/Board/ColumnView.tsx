import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button, Group, Paper, ScrollArea, Stack, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import {
  CardsResponse,
  LabelsResponse,
  StatesResponse,
  UsersResponse,
} from "../../api/types";
import { Card } from "../Card/Card";

interface ColumnViewProps {
  states: StatesResponse[];
  cards: CardsResponse[];
  users: UsersResponse[];
  labels: LabelsResponse[];
}

export function ColumnView({ cards, states, users, labels }: ColumnViewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // @ts-ignore FIXME with correct type
  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      console.time("reordering cards");

      //   const activeCard = cards.find((card) => card.id === active.id);
      //   const overCard = cards.find((card) => card.id === over.id);

      // Disabled for now
      //   if (activeCard!.state !== overCard!.state) {
      //     activeCard!.state = overCard!.state;
      //     setCards(cards);
      //   }

      //   setCards((cards) => {
      //     const oldIndex = cards.map((c) => c.id).indexOf(active.id);
      //     const newIndex = cards.map((c) => c.id).indexOf(over.id);

      //     return arrayMove(cards, oldIndex, newIndex);
      //   });
      console.timeEnd("reordering cards");
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <ScrollArea>
        <Group style={{ width: states.length * 280 + 150 }} justify="start">
          {states
            .sort((a, b) => a.position - b.position)
            .map((state: StatesResponse) => (
              <div key={state.id}>
                <Text>{state.title}</Text>

                <Paper
                  h={"75vh"}
                  w={250}
                  style={{ backgroundColor: "#00000009" }}
                >
                  <Stack>
                    <SortableContext
                      items={cards}
                      strategy={verticalListSortingStrategy}
                    >
                      {cards
                        .filter((card) => card.state === state.id)
                        .sort((a, b) => a.position - b.position)
                        .map((card: CardsResponse) => (
                          <Card
                            key={card.id}
                            card={card}
                            users={users}
                            labels={labels}
                          />
                        ))}
                    </SortableContext>
                  </Stack>
                </Paper>
              </div>
            ))}

          <div style={{ height: "75vh", paddingTop: "1em" }}>
            <Button
              variant="subtle"
              leftSection={<IconPlus size="1em" stroke={1.5} />}
              style={{ color: "grey" }}
            >
              Liste hinzufügen
            </Button>
          </div>
        </Group>
      </ScrollArea>
    </DndContext>
  );
}
