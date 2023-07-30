import {
  Avatar,
  Badge,
  Group,
  Card as MantineCard,
  Text,
  Tooltip,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { CardsResponse } from "../api/types";
import { IconCalendar, IconTriangle } from "@tabler/icons-react";

export function Card({ card }: { card: CardsResponse }) {
  const navigate = useNavigate();

  return (
    <MantineCard shadow="sm" withBorder onClick={() => navigate(card.id)}>
      <Text weight={500}>{card.title}</Text>
      {card.labels.map((label) => (
        <Badge variant="light">{label}</Badge>
      ))}

      <Tooltip.Group openDelay={300} closeDelay={100}>
        <Avatar.Group spacing="sm">
          {card.members.map((member) => (
            <Tooltip label={member} withArrow>
              <Avatar src="image.png" radius="xl" />
            </Tooltip>
          ))}
        </Avatar.Group>
      </Tooltip.Group>

      <Group>
        <IconCalendar color="gray" size={"1rem"} />
        <Text color="dimmed" size="sm">
          {new Date(card.dueDate).toLocaleDateString("DE-de")}
        </Text>
      </Group>

      <Group>
        <IconTriangle color="gray" size={"1rem"} />
        <Text color="dimmed" size="sm">
          {card.priority}
        </Text>
      </Group>
    </MantineCard>
  );
}
