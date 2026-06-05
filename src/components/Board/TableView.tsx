import { useMemo } from "react";
import { Link } from "react-router-dom";

import {
  Avatar,
  Badge,
  Group,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import dayjs from "dayjs";

import type {
  CardsResponse,
  LabelsResponse,
  ListsResponse,
  UsersResponse,
} from "../../api/types";

interface TableViewProps {
  lists: ListsResponse[];
  cards: CardsResponse[];
  users: UsersResponse[];
  labels: LabelsResponse[];
}

export function TableView({ cards, lists, users, labels }: TableViewProps) {
  const labelMap = useMemo(
    () => Object.fromEntries(labels.map((l) => [l.id, l])),
    [labels],
  );
  const userMap = useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u])),
    [users],
  );

  return (
    <ScrollArea>
      <Stack>
        {cards.map((card: CardsResponse) => (
          <Group key={card.id} justify="space-between">
            <Group>
              <Link to={`cards/${card.id}`}>
                <Text size="sm">{card.title}</Text>
              </Link>

              {card.labels.map((labelId) => {
                const label = labelMap[labelId];
                return (
                  <Badge
                    key={labelId}
                    size="sm"
                    variant="light"
                    color={label?.color ?? "grey"}
                  >
                    {label?.name ?? "Unbekannt"}
                  </Badge>
                );
              })}
            </Group>

            <Group>
              <Text size="sm">
                {lists.find((list) => list.id === card.list)?.title}
              </Text>

              <Tooltip.Group openDelay={300} closeDelay={100}>
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
                          size="sm"
                          radius="xl"
                          name={user?.name}
                          color="initials"
                        />
                      </Tooltip>
                    );
                  })}
                </Avatar.Group>
              </Tooltip.Group>

              {card.priority ? (
                <Text size="sm">{card.priority}</Text>
              ) : (
                <Text size="sm" c="dimmed">
                  Priorität
                </Text>
              )}

              {card.date ? (
                <Text size="sm">{dayjs(card.date).format("DD.MM.YYYY")}</Text>
              ) : (
                <Text size="sm" c="dimmed">
                  Datum
                </Text>
              )}
            </Group>
          </Group>
        ))}
      </Stack>
    </ScrollArea>
  );
}
