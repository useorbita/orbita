import { Button, Divider, Group, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconPlus } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { BoardsResponse } from "../api/types";

export function Navigation({
  loading,
  boards,
}: {
  loading: boolean;
  boards: BoardsResponse[];
}) {
  return (
    <Stack>
      <Link to={"/"}>Start</Link>
      <Divider />
      {loading ? (
        <Text>Lade Boards...</Text>
      ) : (
        boards.map((board) => (
          <Group key={board.id} position="apart">
            <Link to={board.id}>{board.title}</Link>
            <Link to={"settings/" + board.id}>Einstellungen</Link>
          </Group>
        ))
      )}
      <Button
        leftIcon={<IconPlus size={18} />}
        variant="default"
        onClick={() =>
          notifications.show({
            title: "Noch nicht implementiert",
            message: "Das ist leider noch nicht implementiert :(",
            withBorder: true,
            color: "gray",
          })
        }
      >
        Board hinzufügen
      </Button>
      <Divider />
      <Link to={"/settings"}>Mello Einstellungen</Link>
      <Link to={"/settings/me"}>Nutzer Einstellungen</Link>
    </Stack>
  );
}
