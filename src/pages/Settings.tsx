import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Center,
  Divider,
  FileButton,
  Group,
  NavLink,
  Paper,
  PasswordInput,
  ScrollArea,
  SegmentedControl,
  Select,
  Space,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { showNotImplemented } from "../shared/notifications";
import {
  IconAdjustments,
  IconBrush,
  IconLogout,
  IconMoon,
  IconPencil,
  IconSun,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";

import { useLogout } from "../api/auth";
import { SettingsRow } from "../components/Settings/SettingsRow";
import { pb } from "../api/pocketbase";
import dayjs from "dayjs";

const timezones = Intl.supportedValuesOf("timeZone");
const FIELD_W = 300;

export default function Settings() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const logout = useLogout();

  const [tab, setTab] = useState<string>("account");
  const [avatarHover, setAvatarHover] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const avatarPreview = avatarFile ? URL.createObjectURL(avatarFile) : null;

  const [name, setName] = useState(pb.authStore.record?.name ?? "");
  const [email, setEmail] = useState(pb.authStore.record?.email ?? "");
  const [biography, setBiography] = useState("");
  const BIO_MAX = 150;

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

  const memberSince = pb.authStore.record?.created
    ? dayjs(pb.authStore.record.created).format("MMMM YYYY")
    : null;

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
      onCancel: () => {},
      onConfirm: () => showNotImplemented(),
    });

  return (
    <ScrollArea p="xl" maw={1320}>
      <Title style={{ fontFamily: "Outfit", fontWeight: 400 }} mb="xl">
        Einstellungen
      </Title>

      <Group align="flex-start" wrap="nowrap" gap="xl">
        <Stack gap={0} w={200}>
          <NavLink
            label="Konto"
            leftSection={<IconUser size="1.2em" stroke={1.5} />}
            active={tab === "account"}
            onClick={() => setTab("account")}
          />
          <NavLink
            label="Darstellung"
            leftSection={<IconAdjustments size="1.2em" stroke={1.5} />}
            active={tab === "settings"}
            onClick={() => setTab("settings")}
          />
        </Stack>

        <Box style={{ flex: 1, minWidth: 0 }}>
          {tab === "account" && (
            <>
              <Paper withBorder p="md" mb="xl">
                <Group justify="space-between" align="center">
                  <Group gap="md">
                    <Avatar
                      src={avatarPreview}
                      name={name}
                      size="lg"
                      color="initials"
                    />
                    <Stack gap={0}>
                      <Text fw={500}>{name || "—"}</Text>
                      <Text size="sm" c="dimmed">
                        {email || "—"}
                      </Text>
                      {memberSince && (
                        <Text mt="xs" size="xs" c="dimmed">
                          Mitglied seit {memberSince}
                        </Text>
                      )}
                    </Stack>
                  </Group>
                  <Button
                    leftSection={<IconLogout size="1em" />}
                    variant="default"
                    onClick={() => logout.mutate()}
                  >
                    Abmelden
                  </Button>
                </Group>
              </Paper>

              <Space h="xl" />

              <SettingsRow label="Avatar" description="Dein Profilbild">
                <FileButton
                  onChange={setAvatarFile}
                  accept="image/png,image/jpeg"
                >
                  {(props) => (
                    <Box
                      {...props}
                      style={{
                        position: "relative",
                        cursor: "pointer",
                        display: "inline-block",
                      }}
                      onMouseEnter={() => setAvatarHover(true)}
                      onMouseLeave={() => setAvatarHover(false)}
                    >
                      <Avatar
                        src={avatarPreview}
                        name={name}
                        size="xl"
                        color="initials"
                      />
                      <Center
                        style={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: "50%",
                          background: "rgba(0,0,0,0.4)",
                          opacity: avatarHover ? 1 : 0,
                          transition: "opacity 150ms",
                        }}
                      >
                        <IconPencil size="1.2em" stroke={1.5} color="white" />
                      </Center>
                    </Box>
                  )}
                </FileButton>
              </SettingsRow>

              <Space h="xl" />

              <SettingsRow label="Name" description="Dein Anzeigename">
                <TextInput
                  value={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                  miw={FIELD_W}
                />
              </SettingsRow>

              <Space h="xl" />

              <SettingsRow
                label="Über dich"
                description="Erzähle anderen etwas über dich"
              >
                <Textarea
                  value={biography}
                  onChange={(e) =>
                    setBiography(e.currentTarget.value.slice(0, BIO_MAX))
                  }
                  maxLength={BIO_MAX}
                  minRows={2}
                  autosize
                  maxRows={6}
                  miw={FIELD_W}
                  bottomSection={
                    <Text size="xs" c="dimmed" ta="right">
                      {biography.length}/{BIO_MAX}
                    </Text>
                  }
                />
              </SettingsRow>

              <Space h="xl" />

              <SettingsRow label="E-Mail" description="Deine E-Mail-Adresse">
                <TextInput
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  miw={FIELD_W}
                />
              </SettingsRow>

              <Space h="xl" />

              <SettingsRow label="Passwort" description="Ändere dein Passwort">
                {showPasswordForm ? (
                  <Stack gap="md" mt={"xl"}>
                    <PasswordInput
                      label="Aktuelles Passwort"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.currentTarget.value)}
                      miw={FIELD_W}
                    />
                    <PasswordInput
                      label="Neues Passwort"
                      description="Mindestens 8 Zeichen"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.currentTarget.value)}
                      miw={FIELD_W}
                    />
                    <PasswordInput
                      label="Passwort bestätigen"
                      description="Gib das neue Passwort erneut ein"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.currentTarget.value)
                      }
                      miw={FIELD_W}
                    />
                    <Group gap="sm" justify="flex-end">
                      <Button variant="default" onClick={cancelPasswordChange}>
                        Abbrechen
                      </Button>
                      <Button onClick={() => showNotImplemented()}>
                        Passwort speichern
                      </Button>
                    </Group>
                  </Stack>
                ) : (
                  <Button
                    variant="default"
                    onClick={() => setShowPasswordForm(true)}
                  >
                    Passwort ändern
                  </Button>
                )}
              </SettingsRow>

              <Space h="xl" />
              <Space h="xl" />
              <Space h="xl" />
              <Space h="xl" />

              <Divider color="red" />

              <Space h="xl" />

              <SettingsRow
                label="Konto löschen"
                description="Sobald du dein Konto löschst, werden alle zugehörigen Daten unwiderruflich entfernt. Diese Aktion kann nicht rückgängig gemacht werden."
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
            </>
          )}

          {tab === "settings" && (
            <>
              <Space h="xs" />
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
                  miw={FIELD_W}
                />
              </SettingsRow>

              <Space h="xl" />

              <SettingsRow
                label="Sprache"
                description="Wähle deine bevorzugte Sprache"
              >
                <Select
                  value={language}
                  onChange={(val) => setLanguage(val ?? "de")}
                  data={[
                    { value: "de", label: "Deutsch" },
                    { value: "en", label: "English" },
                    { value: "fr", label: "Francais" },
                  ]}
                  miw={FIELD_W}
                />
              </SettingsRow>

              <Space h="xl" />

              <SettingsRow
                label="Zeitzone"
                description="Stellt Datums- und Zeitangaben ein"
              >
                <Select
                  value={timezone}
                  onChange={(val) => setTimezone(val ?? timezone)}
                  data={timezones}
                  searchable
                  miw={FIELD_W}
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
                  miw={FIELD_W}
                />
              </SettingsRow>
            </>
          )}
        </Box>
      </Group>
    </ScrollArea>
  );
}
