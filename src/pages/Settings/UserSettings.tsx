import { Avatar, Container, Group, Space, Text, Title } from "@mantine/core";
import { pb } from "../../api/pocketbase";

export function UserSettings() {
  return (
    <Container>
      <Title order={4}>Profil</Title>

      <Space h={"xl"} />

      <Group>
        <Avatar radius="xl">{pb.authStore.model?.name.substring(0, 2)}</Avatar>
        <div>
          <Text size="sm">{pb.authStore.model?.name}</Text>
          <Text size="xs" c="dimmed">
            {pb.authStore.model?.email}
          </Text>
        </div>
      </Group>

      <ul>
        <li>Name</li>
        <li>Avatar</li>
        <li>Passwort ändern</li>
        <li>Konto löschen</li>
      </ul>
    </Container>
  );
}
