import { Group, Avatar as MantineAvatar, Text } from "@mantine/core";
import { pb } from "../../api/pocketbase";

function getInitials(name: string | undefined): string {
  if (!name) return "";
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function UserAvatar() {
  const name = pb.authStore.record?.name;
  const email = pb.authStore.record?.email;

  return (
    <Group>
      <MantineAvatar radius="xl">{getInitials(name)}</MantineAvatar>
      <div style={{ flex: 1 }}>
        <Text size="sm" fw={500}>
          {name}
        </Text>
        <Text c="dimmed" size="xs">
          {email}
        </Text>
      </div>
      {/* <IconChevronRight size={14} stroke={1.5} /> */}
    </Group>
  );
}
