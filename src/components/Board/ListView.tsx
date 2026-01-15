import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { Box, Group } from "@mantine/core";
import { CardsResponse, LabelsResponse, UsersResponse } from "../../api/types";
import { List } from "./List";
import { move } from "@dnd-kit/helpers";
import { useState } from "react";

interface ListViewProps {
  allData: Record<string, CardsResponse[]>;
  users: UsersResponse[];
  labels: LabelsResponse[];
}

// https://next.dndkit.com/react/guides/multiple-sortable-lists

export function ListView({ allData, users, labels }: ListViewProps) {
  const [items, setItems] = useState();
  
  const [columnOrder, setColumnOrder] = useState(() => Object.keys(items));

  return (
    <Box h="100%" style={{ overflow: "auto hidden" }}>
      <DragDropProvider
        // onCollision={(data) => console.log(data)}
        onDragOver={(event) => {
          const { source, target } = event.operation;

          if (source?.type === "column") return;

          setItems((items) => move(items, event));
        }}
        onDragEnd={(event) => {
          const { source, target } = event.operation;

          if (event.canceled || source.type !== "column") return;

          setColumnOrder((columns) => move(columns, event));

          if (isSortable(event.operation.source)) {
            const oldGroup = event.operation.source.sortable.initialGroup;
            const newGroup = event.operation.source.sortable.group;
            const oldIndex = event.operation.source.sortable.initialIndex;
            const newIndex = event.operation.source.sortable.index;
            console.log(oldGroup, newGroup, oldIndex, newIndex);
          }
        }}
      >
        <Group
          style={{
            height: "100%",
          }}
          justify="start"
          align="start"
          wrap="nowrap"
          // gap={0}
        >
          {columnOrder.map((listId, index) => (
            <List
              key={listId}
              index={index}
              cards={items[listId] as CardsResponse[]}
              listId={listId}
              users={users}
              labels={labels}
            />
          ))}

          {
            //   Object.entries(items).map(([listId, cards], index) => (
            //   <List
            //     key={listId}
            //     index={index}
            //     cards={cards as CardsResponse[]}
            //     listId={listId}
            //     users={users}
            //     labels={labels}
            //   />
            // ))
          }
        </Group>
      </DragDropProvider>
    </Box>
  );
}
