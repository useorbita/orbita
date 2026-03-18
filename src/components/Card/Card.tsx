import {
  Avatar,
  Badge,
  Card as MantineCard,
  Group,
  Text,
  Tooltip,
  Stack,
  Grid,
} from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
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
  return (
    <MantineCard
      shadow="sm"
      p="sm"
      withBorder
      onClick={() => navigate(`/boards/${boardId}/cards/${card.id}`)}
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
              {card.labels.map((label) => (
                <Badge
                  key={label}
                  variant="dot"
                  size="xs"
                  color={
                    (
                      labels.find((l: LabelsResponse) => l.id === label) || {
                        color: "grey",
                      }
                    ).color
                  }
                >
                  {
                    (
                      labels.find((l: LabelsResponse) => l.id === label) || {
                        title: "Unbekannt",
                      }
                    ).name
                  }
                </Badge>
              ))}
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
                  {new Date(card.date).toLocaleDateString("DE-de")}
                </Text>
              </Group>
            )}

            {card.members.length > 0 && (
              <Tooltip.Group openDelay={100} closeDelay={100}>
                <Avatar.Group spacing="sm">
                  {card.members.map((member) => (
                    <Tooltip
                      key={member}
                      label={
                        (
                          users.find(
                            (user: UsersResponse) => user.id === member,
                          ) || {
                            name: "Unbekannt",
                          }
                        ).name
                      }
                      withArrow
                    >
                      <Avatar
                        radius="xl"
                        size="sm"
                        name={
                          (
                            users.find(
                              (user: UsersResponse) => user.id === member,
                            ) || {
                              name: "Unbekannt",
                            }
                          ).name
                        }
                        color="initials"
                      />
                    </Tooltip>
                  ))}
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
  );
}
