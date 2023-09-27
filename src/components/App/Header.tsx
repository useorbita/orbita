import { Avatar, Button, Group, Menu, Title, rem } from "@mantine/core";
import {
  IconChevronDown,
  IconCircleDotted,
  IconLogout,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { pb } from "../../api/pocketbase";
import { BoardsResponse } from "../../api/types";
import { useUserStore } from "../../stores/userStore";
import { Search } from "../UI/Search";

export function Header({ boards }: { boards: BoardsResponse[] }) {
  const navigate = useNavigate();
  const logout = useUserStore((state) => state.logout);

  return (
    <Group justify="space-between">
      <Group>
        <Title
          order={2}
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
          mr={"md"}
        >
          Mello
        </Title>

        <Menu shadow="md" width={250} position="bottom-start" withArrow>
          <Menu.Target>
            <Button
              variant="default"
              color="gray"
              rightSection={<IconChevronDown />}
            >
              Boards
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            {boards.map((board) => (
              <Menu.Item
                leftSection={<IconCircleDotted size="1em" stroke={1.5} />}
                onClick={() => navigate("/" + board.id)}
              >
                {board.title}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Group>
        <Search />

        <Menu shadow="md" width={200} withArrow>
          <Menu.Target>
            <Avatar radius="xl" style={{ cursor: "pointer" }}>
              {pb.authStore.model?.name.substring(0, 2)}
            </Avatar>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Einstellungen</Menu.Label>
            <Menu.Item
              leftSection={
                <IconSettings style={{ width: rem(14), height: rem(14) }} />
              }
              onClick={() => navigate("/settings")}
            >
              Anwendung
            </Menu.Item>
            <Menu.Item
              leftSection={
                <IconUser style={{ width: rem(14), height: rem(14) }} />
              }
              onClick={() => navigate("/settings/me")}
            >
              Profil
            </Menu.Item>

            <Menu.Divider />

            <Menu.Item
              leftSection={
                <IconLogout style={{ width: rem(14), height: rem(14) }} />
              }
              onClick={logout}
            >
              Abmelden
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
}
