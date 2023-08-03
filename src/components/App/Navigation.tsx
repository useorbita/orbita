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

      <Group position="apart">
        <Title order={2} ml="sm">
          Mello
        </Title>
        <Tooltip label={pb.authStore.model?.name} position="right">
          <Avatar
            size={36}
            color="dark"
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
        icon={<IconHome2 size="1rem" stroke={1.5} />}
        onClick={() => navigate("/")}
      />

      <NavLink
        h={44}
        label="Einstellungen"
        icon={<IconSettings size="1rem" stroke={1.5} />}
        onClick={() => navigate("settings")}
      />

      <Space h="xl" />

      {loading ? (
        <Text>Lade Boards...</Text>
      ) : (
        boards.map((board) => (
          <Group key={board.id} position="apart">
            <NavLink
              label={board.title}
              icon={<IconCircleDotted size="1rem" stroke={1.5} />}
              onClick={() => navigate(board.id)}
              rightSection={
                <ActionIcon
                  variant="light"
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
        icon={<IconPlus size="1rem" stroke={1.5} />}
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
