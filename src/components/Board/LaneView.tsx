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
  ListsResponse,
  UsersResponse,
} from "../../api/types";
import { useActiveBoardStore } from "../../stores/activeBoardStore";
import { Lane } from "./Lane";

interface LaneViewProps {
  lists: ListsResponse[];
  cards: CardsResponse[];
  users: UsersResponse[];
  labels: LabelsResponse[];
}

// https://blog.chetanverma.com/how-to-create-an-awesome-kanban-board-using-dnd-kit

export function LaneView({ cards, lists, users, labels }: LaneViewProps) {
  const [addListMode, setAddListMode] = useState(false);
  const [newListName, setNewListName] = useState("");

  const createList = useActiveBoardStore((state) => state.createList);

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
      //   if (activeCard!.list !== overCard!.list) {
      //     activeCard!.list = overCard!.list;
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
        <Group style={{ width: lists.length * 280 + 250 }} justify="start">
          <SortableContext items={lists.map((i) => i.id)}>
            {lists
              .sort((a, b) => a.position - b.position)
              .map((list: ListsResponse) => (
                <Lane
                  key={list.id}
                  cards={cards}
                  list={list}
                  users={users}
                  labels={labels}
                />
              ))}
          </SortableContext>

          <div style={{ height: "75vh", paddingTop: "1em" }}>
            {addListMode ? (
              <FocusTrap active={addListMode}>
                <TextInput
                  // variant="unstyled"
                  onChange={(event) =>
                    setNewListName(event.currentTarget.value)
                  }
                  rightSection={
                    <>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={() => {
                          createList({
                            title: newListName,
                          });

                          setNewListName("");
                          setAddListMode(false);
                        }}
                      >
                        <IconCheck size="1em" />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={() => {
                          setAddListMode(false);
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
                onClick={() => setAddListMode(true)}
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
