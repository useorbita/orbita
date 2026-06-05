import { useState, useMemo } from "react";

import {
  ActionIcon,
  Box,
  Button,
  Group,
  Stack,
  TextInput,
} from "@mantine/core";
import { IconCheck, IconPlus, IconX } from "@tabler/icons-react";

import { useCreateList } from "../../api/lists";
import type {
  CardsResponse,
  LabelsResponse,
  ListsResponse,
  UsersResponse,
} from "../../api/types";

import { List } from "./List";

interface ListViewProps {
  items: Record<string, string[]>;
  cardMap: Record<string, CardsResponse>;
  lists: ListsResponse[];
  boardId: string;
  users: UsersResponse[];
  labels: LabelsResponse[];
}

export function ListView({
  items,
  cardMap,
  lists,
  boardId,
  users,
  labels,
}: ListViewProps) {
  const [addingList, setAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  const createList = useCreateList();

  const listMap = useMemo(
    () => Object.fromEntries(lists.map((l) => [l.id, l])),
    [lists],
  );
  const columnOrder = Object.keys(items);

  function handleAddList() {
    if (!newListTitle.trim()) return;
    createList.mutate(
      { title: newListTitle.trim(), board: boardId },
      {
        onSuccess: () => {
          setNewListTitle("");
          setAddingList(false);
        },
      },
    );
  }

  return (
    <Box h="100%" style={{ overflow: "auto hidden", minHeight: 0 }}>
      <Group
        style={{ height: "100%" }}
        justify="start"
        align="start"
        wrap="nowrap"
      >
        {columnOrder.map((listId) => (
          <List
            key={listId}
            listId={listId}
            listTitle={listMap[listId]?.title ?? listId}
            boardId={boardId}
            cardIds={items[listId]}
            cardMap={cardMap}
            users={users}
            labels={labels}
          />
        ))}

        {addingList ? (
          <Stack gap="xs" p="xs">
            <TextInput
              placeholder="List title"
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddList();
                if (e.key === "Escape") setAddingList(false);
              }}
              autoFocus
              size="xs"
            />
            <Group gap="xs">
              <ActionIcon
                size="sm"
                variant="filled"
                onClick={handleAddList}
                loading={createList.isPending}
              >
                <IconCheck size="0.9em" />
              </ActionIcon>
              <ActionIcon
                size="sm"
                variant="subtle"
                color="gray"
                onClick={() => setAddingList(false)}
              >
                <IconX size="0.9em" />
              </ActionIcon>
            </Group>
          </Stack>
        ) : (
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconPlus size="1em" />}
            size="xs"
            onClick={() => setAddingList(true)}
          >
            Add list
          </Button>
        )}
      </Group>
    </Box>
  );
}
