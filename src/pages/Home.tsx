import { useNavigate } from "react-router-dom";

import {
  Box,
  Card,
  Group,
  ScrollArea,
  SimpleGrid,
  Space,
  Text,
  Title,
} from "@mantine/core";
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
    </ScrollArea>
  );
}
