import {
  Avatar,
  Badge,
  Group,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { Link } from "react-router-dom";
import {
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
  return (
    <ScrollArea>
      <Stack>
        {cards.map((card: CardsResponse) => (
          <Group key={card.id} justify="space-between">
            <Group>
              <Link to={`cards/${card.id}`}>
                <Text size="sm">{card.title}</Text>
              </Link>

              {card.labels.map((label) => (
                <Badge
                  key={label}
                  size="sm"
                  variant="light"
                  color={
                    (
                      labels.find((l: LabelsResponse) => l.id === label) || {
                        color: "",
                      }
                    ).color
                  }
                >
                  {
                    (
                      labels.find((l: LabelsResponse) => l.id === label) || {
                        title: "Unbekannt",
                      }
                    ).title
                  }
                </Badge>
              ))}
            </Group>

            <Group>
              <Text size="sm">
                {lists.find((list) => list.id === card.list)?.title}
              </Text>

              <Tooltip.Group openDelay={300} closeDelay={100}>
                <Avatar.Group spacing="sm">
                  {card.members.map((member) => (
                    <Tooltip
                      key={member}
                      label={
                        (
                          users.find(
                            (user: UsersResponse) => user.id === member
                          ) || { name: "Unbekannt" }
                        ).name
                      }
                      withArrow
                    >
                      <Avatar size="sm" radius="xl" />
                    </Tooltip>
                  ))}
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
                <Text size="sm">
                  {new Date(card.date).toLocaleDateString("DE-de")}
                </Text>
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
