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

// https://next.dndkit.com/react/guides/multiple-sortable-lists

export function LaneView({ cards, lists, users, labels }: LaneViewProps) {
  const [addListMode, setAddListMode] = useState(false);
  const [newListName, setNewListName] = useState("");

  const createList = useActiveBoardStore((state) => state.createList);

  return (
    <>
      <ScrollArea>
        <Group style={{ width: lists.length * 280 + 250 }} justify="start">
          {lists
            .sort((a, b) => a.position - b.position)
            .map((list: ListsResponse, index) => (
              <Lane
                index={index}
                key={list.id}
                cards={cards}
                list={list}
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
              <Text size="sm" c={"dimmed"} onClick={() => setAddListMode(true)}>
                <IconPlus size={"1em"} /> Neue Liste anlegen
              </Text>
            )}
          </div>
        </Group>
      </ScrollArea>
    </>
  );
}
