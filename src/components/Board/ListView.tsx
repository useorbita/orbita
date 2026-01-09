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
import { CardsResponse, LabelsResponse, UsersResponse } from "../../api/types";
import { useActiveBoardStore } from "../../stores/activeBoardStore";
import { List } from "./List";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";

interface ListViewProps {
  allData: Record<string, CardsResponse[]>;
  users: UsersResponse[];
  labels: LabelsResponse[];
}

// https://next.dndkit.com/react/guides/multiple-sortable-lists

export function ListView({ allData, users, labels }: ListViewProps) {
  const [addListMode, setAddListMode] = useState(false);
  const [newListName, setNewListName] = useState("");

  const createList = useActiveBoardStore((state) => state.createList);

  return (
    <>
      <ScrollArea>
        <DragDropProvider
          onDragEnd={(data) => {
            if (isSortable(data.operation.source)) {
              const oldGroup = data.operation.source.sortable.initialGroup;
              const newGroup = data.operation.source.sortable.group;
              const oldIndex = data.operation.source.sortable.initialIndex;
              const newIndex = data.operation.source.sortable.index;
              console.log(oldGroup, newGroup, oldIndex, newIndex);
            }
          }}
        >
          <Group
            style={{ width: Object.keys(allData).length * 280 + 250 }}
            justify="start"
          >
            {Object.entries(allData).map(([listId, cards], index) => (
              <List
                key={listId}
                index={index}
                cards={cards}
                listId={listId}
                users={users}
                labels={labels}
              />
            ))}

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
                  <IconPlus size={"1em"} /> Neue Liste anlegen
                </Text>
              )}
            </div>
          </Group>
        </DragDropProvider>
      </ScrollArea>
    </>
  );
}
