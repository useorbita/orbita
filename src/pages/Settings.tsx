import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Center,
  FileButton,
  Group,
  PasswordInput,
  ScrollArea,
  SegmentedControl,
  Select,
  Space,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import {
  IconBrush,
  IconLogout,
  IconMoon,
  IconSun,
  IconTrash,
} from "@tabler/icons-react";

import { useLogout } from "../api/auth";
import { SettingsRow } from "../components/Settings/SettingsRow";
import { pb } from "../api/pocketbase";

const timezones = Intl.supportedValuesOf("timeZone");

export default function Settings() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const logout = useLogout();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const avatarPreview = avatarFile ? URL.createObjectURL(avatarFile) : null;

  const [name, setName] = useState(pb.authStore.record?.name ?? "");
  const [email, setEmail] = useState(pb.authStore.record?.email ?? "");

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const cancelPasswordChange = () => {
    setShowPasswordForm(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const [language, setLanguage] = useState("de");
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  const [weekStart, setWeekStart] = useState("monday");

  const confirmDelete = () =>
    modals.openConfirmModal({
      title: "Konto löschen",
      centered: true,
      zIndex: 1000,
      children: (
        <Stack gap="sm">
          <Text size="sm">
            Bist du dir sicher, dass du dein Konto löschen möchtest? Alle
            zugehörigen Daten werden unwiderruflich entfernt.
          </Text>
          <Text size="sm" fw={500}>
            Diese Aktion kann nicht rückgängig gemacht werden.
          </Text>
        </Stack>
      ),
      labels: { confirm: "Konto löschen", cancel: "Abbrechen" },
      confirmProps: { color: "red" },
      onCancel: () => console.log("abgebrochen"),
      onConfirm: () => {
        notifications.show({
          title: "Noch nicht implementiert",
          message: "Das ist leider noch nicht implementiert :(",
          withBorder: true,
          color: "gray",
        });
      },
    });

  return (
    <ScrollArea p="xl">
      <Group justify="space-between" mb="xl">
        <Title style={{ fontFamily: "Outfit", fontWeight: 400 }}>
          Einstellungen
        </Title>
        <Button
          leftSection={<IconLogout size="1em" />}
          color="red"
          variant="light"
          size="sm"
          onClick={() => logout.mutate()}
        >
          Abmelden
        </Button>
      </Group>

      <Title order={4}>Profil</Title>
      <Space h="md" />

      <SettingsRow
        label="Avatar"
        description="Unterstützt PNG, JPG, maximal 2 MB"
      >
        <Group gap="md">
          <Avatar src={avatarPreview} name={name} size="xl" color="initials" />
          <FileButton onChange={setAvatarFile} accept="image/png,image/jpeg">
            {(props) => (
              <Button {...props} variant="light">
                Avatar ändern
              </Button>
            )}
          </FileButton>
        </Group>
      </SettingsRow>

      <Space h="xl" />

      <SettingsRow label="Name" description="Dein Anzeigename">
        <TextInput
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
      </SettingsRow>

      <Space h="xl" />

      <SettingsRow label="E-Mail" description="Deine E-Mail-Adresse">
        <TextInput
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
        />
      </SettingsRow>

      <Space h="xl" />

      <Title order={4}>Darstellung</Title>
      <Space h="md" />

      <SettingsRow
        label="Farbschema"
        description="Wähle dein bevorzugtes Farbschema"
      >
        <SegmentedControl
          data={[
            {
              value: "light",
              label: (
                <Center>
                  <IconSun size="1em" />
                  <Box ml={10}>Hell</Box>
                </Center>
              ),
            },
            {
              value: "dark",
              label: (
                <Center>
                  <IconMoon size="1em" />
                  <Box ml={10}>Dunkel</Box>
                </Center>
              ),
            },
            {
              value: "auto",
              label: (
                <Center>
                  <IconBrush size="1em" />
                  <Box ml={10}>System</Box>
                </Center>
              ),
            },
          ]}
          onChange={setColorScheme}
          value={colorScheme}
        />
      </SettingsRow>

      <Space h="xl" />

      <SettingsRow label="Sprache" description="Wähle deine bevorzugte Sprache">
        <Select
          value={language}
          onChange={(val) => setLanguage(val ?? "de")}
          data={[
            { value: "de", label: "Deutsch" },
            { value: "en", label: "English" },
            { value: "fr", label: "Francais" },
          ]}
        />
      </SettingsRow>

      <Space h={50} />

      <Title order={4}>Einstellungen</Title>
      <Space h="md" />

      <SettingsRow
        label="Zeitzone"
        description="Stellt Datums- und Zeitangaben ein"
      >
        <Select
          value={timezone}
          onChange={(val) => setTimezone(val ?? timezone)}
          data={timezones}
          searchable
        />
      </SettingsRow>

      <Space h="xl" />

      <SettingsRow
        label="Start der Woche"
        description="Legt fest, welcher Tag als Wochenstart gilt"
      >
        <SegmentedControl
          value={weekStart}
          onChange={setWeekStart}
          data={[
            { value: "monday", label: "Montag" },
            { value: "sunday", label: "Sonntag" },
            { value: "saturday", label: "Samstag" },
          ]}
        />
      </SettingsRow>

      <Space h={50} />

      <Title order={4}>Passwort</Title>
      <Space h="md" />

      <SettingsRow label="Passwort" description="Ändere dein Passwort">
        {showPasswordForm ? (
          <Stack gap="md">
            <PasswordInput
              label="Aktuelles Passwort"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.currentTarget.value)}
            />
            <PasswordInput
              label="Neues Passwort"
              description="Mindestens 8 Zeichen"
              value={newPassword}
              onChange={(e) => setNewPassword(e.currentTarget.value)}
            />
            <PasswordInput
              label="Passwort bestätigen"
              description="Gib das neue Passwort erneut ein"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.currentTarget.value)}
            />
            <Group gap="sm">
              <Button
                onClick={() => {
                  notifications.show({
                    title: "Noch nicht implementiert",
                    message: "Das ist leider noch nicht implementiert :(",
                    withBorder: true,
                    color: "gray",
                  });
                }}
              >
                Passwort speichern
              </Button>
              <Button
                variant="light"
                color="gray"
                onClick={cancelPasswordChange}
              >
                Abbrechen
              </Button>
            </Group>
          </Stack>
        ) : (
          <Button variant="light" onClick={() => setShowPasswordForm(true)}>
            Passwort ändern
          </Button>
        )}
      </SettingsRow>

      <Space h={50} />

      <Title order={4} c="red">
        Danger Zone
      </Title>
      <Space h="md" />

      <SettingsRow
        label="Konto löschen"
        description="Sobald du dein Konto löschst, werden alle zugehörigen Daten
          unwiderruflich entfernt. Diese Aktion kann nicht rückgängig gemacht
          werden."
      >
        <Button
          leftSection={<IconTrash size="1em" />}
          color="red"
          variant="outline"
          onClick={confirmDelete}
        >
          Konto löschen
        </Button>
      </SettingsRow>
    </ScrollArea>
  );
}
