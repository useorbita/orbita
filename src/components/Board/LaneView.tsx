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
import {
  ActionIcon,
  FocusTrap,
  Group,
  ScrollArea,
  Text,
  TextInput,
} from "@mantine/core";
import { IconCheck, IconPlus, IconX } from "@tabler/icons-react";
import { useState } from "react";
import {
  CardsResponse,
  LabelsResponse,
  StatesResponse,
  UsersResponse,
} from "../../api/types";
import { useActiveBoardStore } from "../../stores/activeBoardStore";
import { Lane } from "./Lane";

interface LaneViewProps {
  states: StatesResponse[];
  cards: CardsResponse[];
  users: UsersResponse[];
  labels: LabelsResponse[];
}

// https://blog.chetanverma.com/how-to-create-an-awesome-kanban-board-using-dnd-kit

export function LaneView({ cards, states, users, labels }: LaneViewProps) {
  const [addStateMode, setAddStateMode] = useState(false);
  const [newStateName, setNewStateName] = useState("");

  const createState = useActiveBoardStore((state) => state.createState);

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
        <Group style={{ width: states.length * 280 + 250 }} justify="start">
          <SortableContext items={states.map((i) => i.id)}>
            {states
              .sort((a, b) => a.position - b.position)
              .map((state: StatesResponse) => (
                <Lane
                  key={state.id}
                  cards={cards}
                  state={state}
                  users={users}
                  labels={labels}
                />
              ))}
          </SortableContext>

          <div style={{ height: "75vh", paddingTop: "1em" }}>
            {addStateMode ? (
              <FocusTrap active={addStateMode}>
                <TextInput
                  // variant="unstyled"
                  onChange={(event) =>
                    setNewStateName(event.currentTarget.value)
                  }
                  rightSection={
                    <>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={() => {
                          createState({
                            title: newStateName,
                          });

                          setNewStateName("");
                          setAddStateMode(false);
                        }}
                      >
                        <IconCheck size="1em" />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={() => {
                          setAddStateMode(false);
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
                onClick={() => setAddStateMode(true)}
              >
                <IconPlus size={"1em"} /> Neues Board anlegen
              </Text>
            )}
          </div>
        </Group>
      </ScrollArea>
    </DndContext>
  );
}
