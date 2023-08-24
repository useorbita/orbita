import {
  ActionIcon,
  Avatar,
  Group,
  NavLink,
  Space,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconCircleDotted,
  IconHome2,
  IconPencil,
  IconPlus,
  IconSettings,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { pb } from "../../api/pocketbase";
import { BoardsResponse } from "../../api/types";

export function Navigation({
  loading,
  boards,
}: {
  loading: boolean;
  boards: BoardsResponse[];
}) {
  const navigate = useNavigate();

  return (
    <>
      <Space h="xl" />

      <Group justify="space-between">
        <Title order={2} ml="sm">
          Mello
        </Title>
        <Tooltip label={pb.authStore.model?.name} position="bottom">
          <Avatar
            size={36}
            radius="xl"
            mr="xs"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/settings/me")}
          >
            {pb.authStore.model?.name.substring(0, 2)}
          </Avatar>
        </Tooltip>
      </Group>

      <Space h="xl" />

      <NavLink
        label="Übersicht"
        h={44}
        leftSection={<IconHome2 size="1em" stroke={1.5} />}
        onClick={() => navigate("/")}
      />

      <NavLink
        h={44}
        label="Einstellungen"
        leftSection={<IconSettings size="1em" stroke={1.5} />}
        onClick={() => navigate("settings")}
      />

      <Space h="xl" />

      {loading ? (
        <Text>Lade Boards...</Text>
      ) : (
        boards.map((board) => (
          <Group key={board.id} justify="space-between">
            <NavLink
              label={board.title}
              leftSection={<IconCircleDotted size="1em" stroke={1.5} />}
              onClick={() => navigate(board.id)}
              rightSection={
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("settings/" + board.id);
                  }}
                >
                  <IconPencil size="1em" />
                </ActionIcon>
              }
            />
          </Group>
        ))
      )}

      <Space h="xl" />

      <NavLink
        label="Board hinzufügen"
        leftSection={<IconPlus size="1em" stroke={1.5} />}
        style={{ color: "grey" }}
        onClick={() =>
          notifications.show({
            title: "Noch nicht implementiert",
            message: "Das ist leider noch nicht implementiert :(",
            withBorder: true,
            color: "gray",
          })
        }
      />
    </>
  );
}
