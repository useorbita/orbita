import { useNavigate, useParams } from "react-router-dom";

import {
  ActionIcon,
  Grid,
  Group,
  Loader,
  ScrollArea,
  Space,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";

import { useOrganization, useOrganizationMembers } from "../api/organizations";

export default function OrgSettings() {
  const navigate = useNavigate();
  const { orgId } = useParams();

  const org = useOrganization(orgId);
  const members = useOrganizationMembers(orgId);

  const descriptionSpan = 4;
  const inputSpan = 6;
  const offset = 1;

  if (org.isLoading) return <Loader color="gray" />;

  return (
    <ScrollArea p="xl">
      <Group gap="xs" mb="xl">
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={() => navigate(`/orgs/${orgId}`)}
        >
          <IconArrowLeft size="1em" />
        </ActionIcon>
        <Text>Zurück zur Organisation</Text>
      </Group>

      <Title style={{ fontFamily: "Outfit", fontWeight: 400 }}>
        Einstellungen der Organisation
      </Title>

      <Space h="xl" />

      <Grid align="flex-start">
        <Grid.Col span={descriptionSpan}>
          <Stack gap="xs">
            <Text>Name der Organisation</Text>
            <Text size="sm" c="dimmed">
              Dies ist der Name der Organisation, der allen Mitgliedern angezeigt
              wird
            </Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={inputSpan} offset={offset}>
          <TextInput
            placeholder="Name der Organisation"
            defaultValue={org.data?.name}
            disabled={org.data?.is_personal}
          />
        </Grid.Col>
      </Grid>

      <Space h="xl" />

      <Grid align="flex-start">
        <Grid.Col span={descriptionSpan}>
          <Stack gap="xs">
            <Text>Mitglieder</Text>
            <Text size="sm" c="dimmed">
              Mitglieder und ihre Rollen in dieser Organisation
            </Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={inputSpan} offset={offset}>
          {members.isLoading ? (
            <Loader size="sm" color="gray" />
          ) : (
            <Stack gap="xs">
              {members.data?.map((member) => (
                <Group key={member.id} justify="space-between">
                  <Text size="sm">
                    {(member.expand as any)?.user?.name ?? member.user}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {member.role}
                  </Text>
                </Group>
              ))}
              {members.data?.length === 0 && (
                <Text size="sm" c="dimmed">
                  Keine Mitglieder
                </Text>
              )}
            </Stack>
          )}
        </Grid.Col>
      </Grid>
    </ScrollArea>
  );
}
