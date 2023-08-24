import { Avatar, Button, Group, Text } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import { pb } from "../../api/pocketbase";

export function UserSettings() {
  return (
    <>
      <Text>Einstellungen - Profil</Text>

      <Group mt={"xl"}>
        <Avatar size={40} radius="xl">
          {pb.authStore.model?.name.substring(0, 2)}
        </Avatar>
        <div>
          <Text>{pb.authStore.model?.name}</Text>
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

      <Button
        variant="outline"
        color="gray"
        leftSection={<IconLogout size={18} />}
        onClick={() => pb.authStore.clear()}
      >
        Logout
      </Button>
    </>
  );
}
