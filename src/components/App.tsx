import { AppShell, Button, Header, Navbar, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { pb } from "../api/pocketbase";
import { BoardsResponse, Collections } from "../api/types";
import { Board } from "./Board";

export function App() {
  const [boards, setBoards] = useState<BoardsResponse[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<BoardsResponse>();

  useEffect(() => {
    (async () => {
      const result = await pb
        .collection(Collections.Boards)
        .getFullList<BoardsResponse>();

      setBoards(result);
      setSelectedBoard(result[0]);
    })();
  }, []);

  return (
    <AppShell
      padding="md"
      header={
        <Header height={60} p="xs">
          <Text>Mello</Text>
        </Header>
      }
      navbar={
        <Navbar width={{ base: 300 }} p="xs">
          <Stack>
            {boards &&
              boards.map((board) => (
                <Button
                  key={board.id}
                  onClick={() => setSelectedBoard(board)}
                  variant="subtle"
                >
                  <strong>{board.name}</strong>
                </Button>
              ))}
          </Stack>

          <Button
            leftIcon={<IconPlus size={18} />}
            variant="default"
            mt="xl"
            size="xs"
            onClick={() =>
              notifications.show({
                title: "Noch nicht implementiert",
                message:
                  "Das ist leider noch nicht implementiert. Aber es wird super!",
                withBorder: true,
                color: "gray",
              })
            }
          >
            Projekt hinzufügen
          </Button>
        </Navbar>
      }
      styles={(theme) => ({
        main: {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      })}
    >
      {selectedBoard ? (
        <Board board={selectedBoard} />
      ) : (
        <Text>Lade Projekt...</Text>
      )}
    </AppShell>
  );
}
