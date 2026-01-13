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
  const [items, setItems] = useState({
    "1ru1dzvqd7xrnyi": [
      {
        board: "3ml4xpv4aq59x7e",
        collectionId: "tkpkgund127xiyi",
        collectionName: "cards",
        created: "2024-02-28 21:56:47.072Z",
        date: "2024-12-24 23:00:00.000Z",
        description: "<p>Tast?x</p>",
        id: "0c8fyjthh7zpeqd",
        labels: [],
        list: "1ru1dzvqd7xrnyi",
        members: [],
        number: 1,
        position: 0,
        priority: "highest",
        title: "Joar",
        updated: "2024-12-16 22:32:24.678Z",
      },
      {
        board: "3ml4xpv4aq59x7e",
        collectionId: "tkpkgund127xiyi",
        collectionName: "cards",
        created: "2024-03-28 19:25:30.017Z",
        date: "2024-09-18 22:00:00.000Z",
        description: "",
        id: "t9ygcyh5abg30uh",
        labels: [],
        list: "1ru1dzvqd7xrnyi",
        members: [],
        number: 4,
        position: 0,
        priority: "",
        title: "Test w",
        updated: "2024-09-03 18:48:51.836Z",
      },
      {
        board: "3ml4xpv4aq59x7e",
        collectionId: "tkpkgund127xiyi",
        collectionName: "cards",
        created: "2024-03-28 19:25:37.488Z",
        date: "",
        description: "",
        id: "ttjjveomr2t74fx",
        labels: [],
        list: "1ru1dzvqd7xrnyi",
        members: [],
        number: 5,
        position: 0,
        priority: "",
        title: "ABC",
        updated: "2024-03-28 19:25:37.488Z",
      },
    ],
    ef5ocfoar6p0qm2: [
      {
        board: "3ml4xpv4aq59x7e",
        collectionId: "tkpkgund127xiyi",
        collectionName: "cards",
        created: "2024-12-16 21:44:17.056Z",
        date: "",
        description: "<p>heeeey, lol</p>",
        id: "41gti3hz319o0zl",
        labels: [],
        list: "ef5ocfoar6p0qm2",
        members: [],
        number: 0,
        position: 0,
        priority: "",
        title: "Heeey",
        updated: "2024-12-16 22:31:41.182Z",
      },
      {
        board: "3ml4xpv4aq59x7e",
        collectionId: "tkpkgund127xiyi",
        collectionName: "cards",
        created: "2024-12-16 22:35:31.927Z",
        date: "",
        description: "",
        id: "7e5kkz202251014",
        labels: [],
        list: "ef5ocfoar6p0qm2",
        members: [],
        number: 0,
        position: 0,
        priority: "",
        title: "dd",
        updated: "2024-12-16 22:35:31.927Z",
      },
      {
        board: "3ml4xpv4aq59x7e",
        collectionId: "tkpkgund127xiyi",
        collectionName: "cards",
        created: "2024-02-28 22:05:58.791Z",
        date: "2024-02-20 23:00:00.000Z",
        description: "<p>asd</p><p></p><p>test</p>",
        id: "hrzjdnluisdn127",
        labels: ["3cdqzfaithsvv2k"],
        list: "ef5ocfoar6p0qm2",
        members: ["6f1eqdj2uo4prxw"],
        number: 2,
        position: 0,
        priority: "high",
        title: "done",
        updated: "2024-12-16 22:31:24.103Z",
      },
    ],
    vc3rh33fzaxq3yr: [
      {
        board: "3ml4xpv4aq59x7e",
        collectionId: "tkpkgund127xiyi",
        collectionName: "cards",
        created: "2024-02-28 22:16:08.515Z",
        date: "2024-04-24 22:00:00.000Z",
        description: "",
        id: "515uh4gzn2yyl9t",
        labels: ["3cdqzfaithsvv2k", "revpv3m64yomoah"],
        list: "vc3rh33fzaxq3yr",
        members: ["6f1eqdj2uo4prxw"],
        number: 3,
        position: 0,
        priority: "highest",
        title: "asd",
        updated: "2024-12-16 21:18:12.910Z",
      },
    ],
  });

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
