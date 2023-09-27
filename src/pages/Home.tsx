import {
  Avatar,
  Card,
  Container,
  Group,
  List,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useBoardStore } from "../stores/boardStore";

export function Home() {
  const allBoards = useBoardStore((state) => state.allBoards);
  const isLoading = useBoardStore((state) => state.isLoading);
  const navigate = useNavigate();

  return (
    <Container>
      <Stack>
        <Title order={4}>Deine Boards</Title>

        <Group>
          {!isLoading &&
            allBoards.map((board) => (
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
                </Group>

                <Text size="sm" c="dimmed">
                  Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
                  diam nonumy eirmod tempor invidunt ut labore et dolore magna
                  aliquyam erat, sed diam voluptua.
                </Text>

                <Avatar.Group mt="xs">
                  {board.members.map((member) => (
                    <Avatar>{member.substring(0, 2)}</Avatar>
                  ))}
                </Avatar.Group>
              </Card>
            ))}
        </Group>

        <Title order={4} mt={"xl"}>
          Aktivität
        </Title>
        <List>
          <List.Item>TODO</List.Item>
        </List>
      </Stack>
    </Container>
  );
}
