import {
  Avatar,
  Badge,
  Card as MantineCard,
  Group,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconCalendar, IconTriangle } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import type { CardsResponse, LabelsResponse, UsersResponse } from "../../api/types";

interface CardProps {
  index: number;
  card: CardsResponse;
  users: UsersResponse[];
  labels: LabelsResponse[];
  listId: string;
  boardId: string;
}

export function Card({ index, card, users, labels, listId, boardId }: CardProps) {
  const navigate = useNavigate();
  return (

    <MantineCard
      shadow="sm"
      withBorder
      // data-dragging={isDragging}
      onClick={() => navigate(`/boards/${boardId}/cards/${card.id}`)}
    >
      <Text fw={500}>{card.title}</Text>

      {card.labels.map((label) => (
        <Badge
          key={label}
          variant="light"
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
            ).title
          }
        </Badge>
      ))}

      {card.members.length > 0 && (
        <Tooltip.Group openDelay={100} closeDelay={100}>
          <Avatar.Group spacing="sm">
            {card.members.map((member) => (
              <Tooltip
                key={member}
                label={
                  (
                    users.find(
                      (user: UsersResponse) => user.id === member
                    ) || {
                      name: "Unbekannt",
                    }
                  ).name
                }
                withArrow
              >
                <Avatar radius="xl" />
              </Tooltip>
            ))}
          </Avatar.Group>
        </Tooltip.Group>
      )}

      {card.date && (
        <Group>
          <IconCalendar color="gray" size={"1em"} />
          <Text c="dimmed" size="sm">
            {new Date(card.date).toLocaleDateString("DE-de")}
          </Text>
        </Group>
      )}

      {card.priority && (
        <Group>
          <IconTriangle color="gray" size={"1em"} />
          <Text c="dimmed" size="sm">
            {card.priority}
          </Text>
        </Group>
      )}
    </MantineCard>

  );
}
