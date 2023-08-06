import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Avatar,
  Badge,
  Group,
  Card as MantineCard,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconCalendar, IconTriangle } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { CardsResponse, LabelsResponse, UsersResponse } from "../../api/types";

interface CardProps {
  card: CardsResponse;
  users: UsersResponse[];
  labels: LabelsResponse[];
}

export function Card({ card, users, labels }: CardProps) {
  const navigate = useNavigate();

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <MantineCard shadow="sm" withBorder onClick={() => navigate(card.id)}>
        <Text weight={500}>{card.title}</Text>

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
                  <Avatar radius="xl" />
                </Tooltip>
              ))}
            </Avatar.Group>
          </Tooltip.Group>
        )}

        {card.date && (
          <Group>
            <IconCalendar color="gray" size={"1em"} />
            <Text color="dimmed" size="sm">
              {new Date(card.date).toLocaleDateString("DE-de")}
            </Text>
          </Group>
        )}

        {card.priority && (
          <Group>
            <IconTriangle color="gray" size={"1em"} />
            <Text color="dimmed" size="sm">
              {card.priority}
            </Text>
          </Group>
        )}
      </MantineCard>
    </div>
  );
}
