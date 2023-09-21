import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Button, Group, ScrollArea } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import {
  CardsResponse,
  LabelsResponse,
  StatesResponse,
  UsersResponse,
} from "../../api/types";
import { Lane } from "./Lane";

interface LaneViewProps {
  states: StatesResponse[];
  cards: CardsResponse[];
  users: UsersResponse[];
  labels: LabelsResponse[];
}

// https://blog.chetanverma.com/how-to-create-an-awesome-kanban-board-using-dnd-kit

export function LaneView({ cards, states, users, labels }: LaneViewProps) {
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
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <ScrollArea>
        <Group style={{ width: states.length * 280 + 150 }} justify="start">
          <SortableContext items={states.map((i) => i.id)}>
            {states
              .sort((a, b) => a.position - b.position)
              .map((state: StatesResponse) => (
                <Lane
                  cards={cards}
                  state={state}
                  users={users}
                  labels={labels}
                />
              ))}
          </SortableContext>

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
