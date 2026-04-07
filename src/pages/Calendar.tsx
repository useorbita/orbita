import { useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  Box,
  Center,
  Group,
  Loader,
  SegmentedControl,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Schedule } from "@mantine/schedule";
import { IconCalendar, IconLayoutList } from "@tabler/icons-react";

import dayjs from "dayjs";

import { useBoards } from "../api/boards";
import { useCards } from "../api/cards";
import { CardsPriorityOptions } from "../api/types";
import type { CardsResponse } from "../api/types";

const PRIORITY_COLOR: Record<string, string> = {
  [CardsPriorityOptions.lowest]: "gray",
  [CardsPriorityOptions.low]: "blue",
  [CardsPriorityOptions.medium]: "yellow",
  [CardsPriorityOptions.high]: "orange",
  [CardsPriorityOptions.highest]: "red",
};

export function Calendar() {
  const navigate = useNavigate();

  const cards = useCards();
  const boards = useBoards();
  const [view, setView] = useState("calendar");

  const isLoading = cards.isLoading || boards.isLoading;

  const boardMap = Object.fromEntries(boards.data?.map((b) => [b.id, b]) ?? []);

  const cardsWithDate = cards.data
    ?.filter((c) => !!c.date)
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

  // Group by date string (YYYY-MM-DD)
  const grouped: Record<string, CardsResponse[]> = {};
  cardsWithDate?.forEach((card) => {
    const day = card.date!.slice(0, 10);
    if (!grouped[day]) grouped[day] = [];
    grouped[day]!.push(card);
  });

  const sortedDays = Object.keys(grouped).sort();

  const scheduleEvents: any[] =
    cardsWithDate?.map((card) => ({
      id: card.id,
      title: card.title,
      start: dayjs(card.date).startOf("day").format("YYYY-MM-DD HH:mm:ss"),
      end: dayjs(card.date).endOf("day").format("YYYY-MM-DD HH:mm:ss"),
      color: PRIORITY_COLOR[card.priority ?? ""] ?? "blue",
    })) ?? [];

  console.log(scheduleEvents)

  if (isLoading) return <Loader color="gray" />;

  return (
    <Box p="xl">
      <Group justify="space-between" mb={"lg"}>
        <Title style={{ fontFamily: "Outfit", fontWeight: 400 }}>
          Kalender
        </Title>

        <SegmentedControl
          data={[
            {
              value: "calendar",
              label: (
                <Center>
                  <IconCalendar size="1em" />
                </Center>
              ),
            },
            {
              value: "list",
              label: (
                <Center>
                  <IconLayoutList size="1em" />
                </Center>
              ),
            },
          ]}
          value={view}
          onChange={setView}
        />
      </Group>

      {view === "calendar" ? (
        <Schedule defaultView="month" locale="DE-de" events={scheduleEvents} />
      ) : (
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
      )}
    </Box>
  );
}
