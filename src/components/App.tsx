import {
  ActionIcon,
  AppShell,
  Button,
  Center,
  Container,
  Divider,
  Group,
  Navbar,
  Paper,
  PasswordInput,
  Space,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconPlus, IconSettings } from "@tabler/icons-react";
import { RecordAuthResponse } from "pocketbase";
import { useEffect, useState } from "react";
import { pb } from "../api/pocketbase";
import { BoardsResponse, Collections } from "../api/types";
import { Board } from "./Board";

export function App() {
  const [boards, setBoards] = useState<BoardsResponse[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<BoardsResponse>();
  const [loading, setLoading] = useState(true);
  const [userAuthenticated, setUserAuthenticated] = useState(false);
  const [userData, setUserData] = useState<RecordAuthResponse | undefined>();

  const [showSettingsForBoard, setShowSettingsForBoard] =
    useState<BoardsResponse>();

  useEffect(() => {
    (async () => {
      setLoading(true);
      
      const boards = await pb
        .collection(Collections.Boards)
        .getFullList<BoardsResponse>({ expand: "members" });

      setBoards(boards);
      setSelectedBoard(boards[0]);
      setLoading(false);
    })();
  }, [userAuthenticated]);

  return (
    <>
      {!userAuthenticated ? (
        <Container pt={"10em"}>
          <Center maw={900} h="70%" mx="auto">
            <Paper withBorder shadow="xl" p="xl" w={"20em"}>
              <Stack>
                <Title>Mello</Title>
                <TextInput placeholder="Email" label="Email"></TextInput>
                <PasswordInput placeholder="Password" label="Password" />
                <Space h="xs" />
                <Button
                  variant="default"
                  onClick={async () => {
                    const result = await pb
                      .collection("users")
                      .authWithPassword(
                        import.meta.env.VITE_PB_USERNAME,
                        import.meta.env.VITE_PB_PASSWORD
                      );

                    setUserData(result);
                    setUserAuthenticated(pb.authStore.isValid);
                  }}
                >
                  Anmelden
                </Button>
              </Stack>
            </Paper>
          </Center>
        </Container>
      ) : (
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
                    <Group grow>
                      <Button
                        key={board.id}
                        onClick={() => setSelectedBoard(board)}
                        variant={
                          board.id === selectedBoard?.id ? "outline" : "subtle"
                        }
                      >
                        <strong>{board.name}</strong>
                      </Button>
                      <ActionIcon
                        onClick={() => setShowSettingsForBoard(board)}
                      >
                        <IconSettings size="1.125rem" />
                      </ActionIcon>
                    </Group>
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
              <Space h="xl" />
              <Divider />

              <Space h="xl" />

              <Text>{userData?.record.name}</Text>
              <Text>{userData?.record.email}</Text>
              <Text>{userData?.record.id}</Text>
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
          {showSettingsForBoard ? (
            <>
              <Group>
                <Button
                  variant="default"
                  onClick={() => setShowSettingsForBoard(undefined)}
                >
                  Zurück
                </Button>
                <Text>Einstellungen - {showSettingsForBoard?.name}</Text>
              </Group>
              <pre>{JSON.stringify(showSettingsForBoard, null, 2)}</pre>
            </>
          ) : loading || !selectedBoard ? (
            <Text>Lade Board...</Text>
          ) : (
            <Board board={selectedBoard} />
          )}
        </AppShell>
      )}
    </>
  );
}
