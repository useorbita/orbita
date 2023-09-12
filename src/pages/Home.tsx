import { List, Stack, Text, Title } from "@mantine/core";
import { useBoardStore } from "../stores/boardStore";

export function Home() {
  const allBoards = useBoardStore((state) => state.allBoards);
  const isLoading = useBoardStore((state) => state.isLoading);

  return (
    <Stack>
      <Title order={3}>Willkommen</Title>
      <Text>Ihre Projekte:</Text>

      <List>
        {!isLoading &&
          allBoards.map((board) => (
            <List.Item key={board.id}>{board.title}</List.Item>
          ))}
      </List>

      <Text>Letzte Aktivität:</Text>
      <List>
        <List.Item>TODO</List.Item>
      </List>
    </Stack>
  );
}
