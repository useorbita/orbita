import { Button, Text } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import { useUserStore } from "../../stores/userStore";

export function UserSettings() {
  const logout = useUserStore((state) => state.logout);
  return (
    <>
      <Text>Einstellungen - Profil</Text>

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
        onClick={logout}
      >
        Logout
      </Button>
    </>
  );
}
