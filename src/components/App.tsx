import { AppShell, Button, Navbar, Space, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { pb } from "../api/pocketbase";
import { BoardsResponse, Collections } from "../api/types";
import { Board } from "./Board";

export function App() {
  const [boards, setBoards] = useState<BoardsResponse[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<BoardsResponse>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);

      // TODO: remove this and replace with proper auth
      await pb.admins.authWithPassword(
        import.meta.env.VITE_PB_USERNAME,
        import.meta.env.VITE_PB_PASSWORD
      );

      const boards = await pb
        .collection(Collections.Boards)
        .getFullList<BoardsResponse>();

      setBoards(boards);
      setSelectedBoard(boards[0]);
      setLoading(false);
    })();
  }, []);

  return (
    <AppShell
      padding="md"
      navbar={
        <Navbar width={{ base: 300 }} p="xs">
          <Text>Mello</Text>
          <Space h="xl" />
          <Stack>
            {loading ? (
              <Text>Lade Boards...</Text>
            ) : (
              boards.map((board) => (
                <Button
                  key={board.id}
                  onClick={() => setSelectedBoard(board)}
                  variant="subtle"
                >
                  <strong>{board.name}</strong>
                </Button>
              ))
            )}

            <Button
              leftIcon={<IconPlus size={18} />}
              variant="default"
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
              Board hinzufügen
            </Button>
          </Stack>
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
      {loading || !selectedBoard ? (
        <Text>Lade Board...</Text>
      ) : (
        <Board board={selectedBoard} />
      )}
    </AppShell>
  );
}
