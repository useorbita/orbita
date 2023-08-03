import { Avatar, Button, Group, Space, Text } from "@mantine/core";
import { IconAdjustments, IconLogout, IconUser } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { pb } from "../../api/pocketbase";

export function UserSettings() {
  const navigate = useNavigate();

  return (
    <>
      <Button.Group>
        <Button
          variant="subtle"
          color="dark"
          leftIcon={<IconAdjustments />}
          onClick={() => navigate("/settings")}
        >
          Anwendung
        </Button>
        <Button
          variant="outline"
          color="dark"
          leftIcon={<IconUser />}
          onClick={() => navigate("/settings/me")}
        >
          Profil
        </Button>
      </Button.Group>

      <Space h="xl" />
      <Space h="md" />

      <Group>
        <Avatar size={40} color="dark" radius="xl">
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
