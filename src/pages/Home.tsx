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
  IconActivity,
  IconClockPause,
  IconDashboard,
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
            <IconActivity size="1.2em" stroke={1.5} />
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">
              Aktivitaet (Activity Feed)
            </Text>
          </Group>
          <Text size="xs" c="dimmed">
            Unified feed of recent card/document changes across all orgs.
            Shows "Max hat Karte X erstellt", "Anna hat Dokument Y aktualisiert" etc.
            Data source: card_events + document_events (already being logged).
          </Text>
        </Paper>

        <Paper withBorder p="md" radius="sm" style={{ borderStyle: "dashed", opacity: 0.6 }}>
          <Group gap="xs" mb="xs">
            <IconTargetArrow size="1.2em" stroke={1.5} />
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">
              Anstehende Fristen (Upcoming Deadlines)
            </Text>
          </Group>
          <Text size="xs" c="dimmed">
            Cards with due dates in the next 7 days, sorted by urgency.
            Show priority badge, card title, project name, days remaining.
          </Text>
        </Paper>

        <Paper withBorder p="md" radius="sm" style={{ borderStyle: "dashed", opacity: 0.6 }}>
          <Group gap="xs" mb="xs">
            <IconDashboard size="1.2em" stroke={1.5} />
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">
              Schnellstatistiken (Quick Stats)
            </Text>
          </Group>
          <Text size="xs" c="dimmed">
            Total orgs, projects, open cards you're assigned to.
            Could also show completion % or a simple sparkline chart.
          </Text>
        </Paper>

        <Paper withBorder p="md" radius="sm" style={{ borderStyle: "dashed", opacity: 0.6 }}>
          <Group gap="xs" mb="xs">
            <IconClockPause size="1.2em" stroke={1.5} />
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">
              Zuletzt angesehen (Recently Viewed)
            </Text>
          </Group>
          <Text size="xs" c="dimmed">
            Quick-access to your last 5-10 visited items (cards, docs, boards).
            "Pick up where you left off" — like Linear's recent issues.
          </Text>
        </Paper>
      </SimpleGrid>
    </ScrollArea>
  );
}
