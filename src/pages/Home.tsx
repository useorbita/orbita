import { useNavigate } from "react-router-dom";

import {
  Box,
  Card,
  Group,
  Paper,
  ScrollArea,
  SimpleGrid,
  Space,
  Text,
  Title,
} from "@mantine/core";
import {
  IconChartBar,
  IconClockPause,
  IconTargetArrow,
} from "@tabler/icons-react";
import { IconBuilding } from "@tabler/icons-react";

import { useOrganizations } from "../api/organizations";
import { pb } from "../api/pocketbase";

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return `Guten Morgen, ${name}`;
  if (hour >= 12 && hour < 18) return `Guten Nachmittag, ${name}`;
  if (hour >= 18 && hour < 22) return `Guten Abend, ${name}`;
  return `Noch wach, ${name}?`;
}

export default function Home() {
  const navigate = useNavigate();
  const organizations = useOrganizations();
  const sortedOrgs = [...(organizations.data ?? [])].sort((a, b) => {
    if (a.is_personal && !b.is_personal) return -1;
    if (!a.is_personal && b.is_personal) return 1;
    return 0;
  });

  return (
    <ScrollArea p={"xl"}>
      <Title style={{ fontFamily: "Outfit", fontWeight: 400 }}>
        {getGreeting(pb.authStore.record?.name)}
      </Title>
      <Space h={"md"} />
      <Text>„Richte Deine Aufmerksamkeit auf das, was vor Dir liegt."</Text>
      <Text fs="italic">&ndash; Marcus Aurelius</Text>

      <Box mt="xl">
        <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="md">
          Organisationen
        </Text>
        <SimpleGrid cols={3} spacing="sm">
          {sortedOrgs.map((org) => (
            <Card
              key={org.id}
              withBorder
              shadow="sm"
              padding="md"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/orgs/${org.id}`)}
            >
              <Group gap="xs">
                <IconBuilding size="1em" stroke={1.5} />
                <Text size="sm">
                  {org.is_personal ? "Dein Bereich" : org.name}
                </Text>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      </Box>

      <SimpleGrid cols={2} spacing="sm" mt="xl">
        <Paper withBorder p="md" radius="sm" style={{ borderStyle: "dashed", opacity: 0.6 }}>
          <Group gap="xs" mb="xs">
            <IconTargetArrow size="1.2em" stroke={1.5} />
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">
              Meine Aufgaben (My Tasks)
            </Text>
          </Group>
          <Text size="xs" c="dimmed">
            Summary of your workload across all orgs — not the full list (that's Calendar with "assigned to me" filter).
            Show two or three key numbers: overdue count (red), due this week, open cards assigned to you.
            Each number links to the corresponding filtered view in Calendar.
            "3 überfällig · 5 diese Woche → Alle anzeigen"
          </Text>
        </Paper>

        <Paper withBorder p="md" radius="sm" style={{ borderStyle: "dashed", opacity: 0.6 }}>
          <Group gap="xs" mb="xs">
            <IconClockPause size="1.2em" stroke={1.5} />
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">
              Kürzlich angesehen (Recently Viewed)
            </Text>
          </Group>
          <Text size="xs" c="dimmed">
            Last 5-8 items the user visited: cards, documents, boards.
            Each row shows type icon (card/doc/board), title, and org/project breadcrumb.
            One click to jump back — reduces navigation friction. "Pick up where you left off."
            Store in local state or via a view_events collection.
          </Text>
        </Paper>

        <Paper withBorder p="md" radius="sm" style={{ borderStyle: "dashed", opacity: 0.6 }}>
          <Group gap="xs" mb="xs">
            <IconChartBar size="1.2em" stroke={1.5} />
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">
              Projektfortschritt (Project Progress)
            </Text>
          </Group>
          <Text size="xs" c="dimmed">
            All projects you're a member of, each with a progress bar.
            Progress = cards in done-lists / total cards per project.
            Shows which projects are on track and which need attention at a glance.
            Click a project to navigate to its ProjectOverview.
          </Text>
        </Paper>
      </SimpleGrid>
    </ScrollArea>
  );
}
