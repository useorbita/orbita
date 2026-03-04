import { Box, Group, Loader, Stack, Text, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useCards } from "../api/cards";
import { useBoards } from "../api/boards";

export function Calendar() {
  const navigate = useNavigate();

  const cards = useCards();
  const boards = useBoards();

  const isLoading = cards.isLoading || boards.isLoading;

  const boardMap = Object.fromEntries(
    boards.data?.map((b) => [b.id, b]) ?? []
  );

  const cardsWithDate = cards.data
    ?.filter((c) => !!c.date)
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

  // Group by date string (YYYY-MM-DD)
  const grouped: Record<string, typeof cardsWithDate> = {};
  cardsWithDate?.forEach((card) => {
    const day = card.date!.slice(0, 10);
    if (!grouped[day]) grouped[day] = [];
    grouped[day]!.push(card);
  });

  const sortedDays = Object.keys(grouped).sort();

  if (isLoading) return <Loader color="gray" />;

  return (
    <Box p="xl">
      <Title style={{ fontFamily: "Outfit", fontWeight: 400 }} mb="xl">
        Kalender
      </Title>

      {sortedDays.length === 0 && (
        <Text c="dimmed">Keine Karten mit Fälligkeitsdatum vorhanden</Text>
      )}

      <Stack gap="xl">
        {sortedDays.map((day) => (
          <Box key={day}>
            <Text size="sm" fw={700} c="dimmed" mb="xs">
              {new Date(day + "T00:00:00").toLocaleDateString("de-DE", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
            <Stack gap="xs">
              {grouped[day]!.map((card) => (
                <Group
                  key={card.id}
                  p="xs"
                  style={(theme) => ({
                    border: `1px solid ${theme.colors.gray[3]}`,
                    borderRadius: theme.radius.sm,
                    cursor: "pointer",
                  })}
                  onClick={() =>
                    navigate(`/boards/${card.board}/cards/${card.id}`)
                  }
                >
                  <Box style={{ flex: 1 }}>
                    <Text size="sm">{card.title}</Text>
                    {boardMap[card.board] && (
                      <Text size="xs" c="dimmed">
                        {boardMap[card.board].title}
                      </Text>
                    )}
                  </Box>
                </Group>
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
