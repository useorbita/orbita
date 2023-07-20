import { Group, Stack, Text } from "@mantine/core";

export function Card({ card }) {

  console.log(card)

  return (
    <>
      {/* <pre>{JSON.stringify(card, null, 2)}</pre> */}
      <Group>
        <Stack>
          <Text>{card && card.description}</Text>
          <Text>Checklist/Progress</Text>
          <Text>Kommentare</Text>
        </Stack>
        <Stack>
          <Text>Status (Backlog, Next, etc.)</Text>
          <Text>Label</Text>
          <Text>Mitglieder</Text>
          <Text>Priorität</Text>
          <Text>Datum</Text>
          <Text>Author</Text>
          <Text>Erstellt am</Text>
          <Text>Verändert zuletzt</Text>
        </Stack>
      </Group>
    </>
  );
}
