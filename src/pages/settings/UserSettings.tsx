import { Avatar, Button, Divider, Group, Text } from "@mantine/core";
import { IconAdjustments, IconLogout, IconUser } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { pb } from "../../api/pocketbase";

export function UserSettings() {
  const navigate = useNavigate();

  return (
    <>
      <Group>
        <Button
          variant="subtle"
          leftIcon={<IconAdjustments />}
          onClick={() => navigate("/settings")}
        >
          Anwendung
        </Button>
        <Button
          variant="light"
          leftIcon={<IconUser />}
          onClick={() => navigate("/settings/me")}
        >
          Profil
        </Button>
      </Group>

      <Divider mt="sm" mb="lg" />

      <Group>
        <Avatar size={40} color="blue" radius="xl">
          {pb.authStore.model?.name.substring(0, 2)}
        </Avatar>
        <div>
          <Text>{pb.authStore.model?.name}</Text>
          <Text size="xs" color="dimmed">
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
        leftIcon={<IconLogout />}
        onClick={() => pb.authStore.clear()}
      >
        Logout
      </Button>
    </>
  );
}
