import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
  Avatar,
  Badge,
  Card as MantineCard,
  Grid,
  Group,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";
import { useSortable } from "@dnd-kit/react/sortable";
import dayjs from "dayjs";

import {
  CardsPriorityOptions,
  type CardsResponse,
  type LabelsResponse,
  type UsersResponse,
} from "../../api/types";

interface CardProps {
  index: number;
  card: CardsResponse;
  users: UsersResponse[];
  labels: LabelsResponse[];
  listId: string;
  boardId: string;
}

const PRIORITY_COLOR: Record<string, string> = {
  [CardsPriorityOptions.lowest]: "gray",
  [CardsPriorityOptions.low]: "blue",
  [CardsPriorityOptions.medium]: "yellow",
  [CardsPriorityOptions.high]: "orange",
  [CardsPriorityOptions.highest]: "red",
};

export function Card({
  index,
  card,
  users,
  labels,
  listId,
  boardId,
}: CardProps) {
  const navigate = useNavigate();

  const { ref, isDragging } = useSortable({
    id: card.id,
    index,
    group: listId,
    type: "card",
  });

  // O(1) lookup maps — avoids repeated .find() in the render loop
  const labelMap = useMemo(
    () => Object.fromEntries(labels.map((l) => [l.id, l])),
    [labels],
  );
  const userMap = useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u])),
    [users],
  );

  return (
    <div ref={ref}>
      <MantineCard
        shadow="sm"
        p="sm"
        withBorder
        onClick={() => navigate(`/boards/${boardId}/cards/${card.id}`)}
        style={{
          opacity: isDragging ? 0.5 : 1,
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        <Stack gap="xs">
          <Grid>
            <Grid.Col span="content">
              <Text size="xs" c="dimmed">
                PR-{card.number}
              </Text>
            </Grid.Col>

            <Grid.Col span="auto" align="end">
              <Group justify="end" gap={3}>
                {card.labels.map((labelId) => {
                  const label = labelMap[labelId];
                  return (
                    <Badge
                      key={labelId}
                      variant="dot"
                      size="xs"
                      color={label?.color ?? "grey"}
                    >
                      {label?.name ?? "Unbekannt"}
                    </Badge>
                  );
                })}
              </Group>
            </Grid.Col>
          </Grid>

          <Text>{card.title}</Text>

          <Group justify="space-between" align="end">
            <Stack gap="xs">
              {card.date && (
                <Group gap="xs">
                  <IconCalendar color="gray" size={"1em"} />
                  <Text c="dimmed" size="sm">
                    {dayjs(card.date).format("DD.MM.YYYY")}
                  </Text>
                </Group>
              )}

              {card.members.length > 0 && (
                <Tooltip.Group openDelay={100} closeDelay={100}>
                  <Avatar.Group spacing="sm">
                    {card.members.map((memberId) => {
                      const user = userMap[memberId];
                      return (
                        <Tooltip
                          key={memberId}
                          label={user?.name ?? "Unbekannt"}
                          withArrow
                        >
                          <Avatar
                            radius="xl"
                            size="sm"
                            name={user?.name ?? "Unbekannt"}
                            color="initials"
                          />
                        </Tooltip>
                      );
                    })}
                  </Avatar.Group>
                </Tooltip.Group>
              )}
            </Stack>

            {card.priority && (
              <Badge
                variant="light"
                color={PRIORITY_COLOR[card.priority ?? ""] ?? "blue"}
                size="xs"
              >
                {card.priority}
              </Badge>
            )}
          </Group>
        </Stack>
      </MantineCard>
    </div>
  );
}
