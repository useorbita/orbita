import {
  ActionIcon,
  Avatar,
  Card,
  Container,
  FocusTrap,
  Group,
  Loader,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconCheck, IconPlus, IconSettings, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { pb, useBoards, useCreateBoard } from "../api/pocketbase";
// import { useBoardStore } from "../stores/boardStore";

export function Home() {
  const navigate = useNavigate();

  const boards = useBoards();
  const createBoard = useCreateBoard();

  const [addBoardMode, setAddBoardMode] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");

  return (
    <Container>
      <Stack>
        <Title order={4}>Deine Boards</Title>

        <Group>
          {!boards.isLoading &&
            boards.data?.map((board) => (
              <Card
                key={board.id}
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                w={300}
                onClick={() => navigate("/" + board.id)}
                style={{ cursor: "pointer" }}
              >
                <Group justify="space-between" mb="xs">
                  <Text fw={500}>{board.title}</Text>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(board.id + "/settings/");
                    }}
                  >
                    <IconSettings size="1em" />
                  </ActionIcon>
                </Group>

                <Text size="sm" c="dimmed">
                  {board.description}
                </Text>

                <Avatar.Group mt="xs">
                  {board.members.map((member) => (
                    <Avatar key={member}>{member.substring(0, 2)}</Avatar>
                  ))}
                </Avatar.Group>
              </Card>
            ))}

          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            w={300}
            style={{ cursor: "pointer" }}
          >
            {addBoardMode
              ? (
                createBoard.isPending
                  ? <Loader size="1em" />
                  : (
                    <FocusTrap active={addBoardMode}>
                      <TextInput
                        variant="unstyled"
                        onChange={(event) =>
                          setNewBoardName(event.currentTarget.value)}
                        rightSection={
                          <>
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              onClick={() => {
                                createBoard.mutate({
                                  title: newBoardName,
                                  member: pb.authStore.model?.id,
                                }, {
                                  onSuccess: () => {
                                    setNewBoardName("");
                                    setAddBoardMode(false);
                                  },
                                });
                              }}
                            >
                              <IconCheck size="1em" />
                            </ActionIcon>
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              onClick={() => {
                                setAddBoardMode(false);
                              }}
                            >
                              <IconX size="1em" />
                            </ActionIcon>
                          </>
                        }
                        rightSectionWidth={66}
                      />
                    </FocusTrap>
                  )
              )
              : (
                <Text
                  fw={500}
                  c={"dimmed"}
                  onClick={() => setAddBoardMode(true)}
                >
                  <IconPlus size={"1em"} /> Neues Board anlegen
                </Text>
              )}
          </Card>
        </Group>
      </Stack>
    </Container>
  );
}
