import { Avatar as MantineAvatar, AvatarProps } from "@mantine/core";

function getInitials(name: string | undefined): string {
  if (!name) return "";
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

interface UserAvatarProps extends AvatarProps {
  name: string | undefined;
}

export function UserAvatar({ name, ...props }: UserAvatarProps) {
  return <MantineAvatar {...props}>{getInitials(name)}</MantineAvatar>;
}
