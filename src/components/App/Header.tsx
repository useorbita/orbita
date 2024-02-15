import { Avatar, Button, Group, Menu, Space, Text } from "@mantine/core";
import {
  IconChevronDown,
  IconCircle,
  IconLogout,
  IconSettings,
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { pb } from "../../api/pocketbase";
import { BoardsResponse } from "../../api/types";
import { useUserStore } from "../../stores/userStore";
import { Search } from "../UI/Search";

export function Header({ boards }: { boards: BoardsResponse[] }) {
  const logout = useUserStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Group justify="space-between">
      <Group gap={"xs"}>
        <IconCircle
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        />

        {location.pathname !== "/" &&
          location.pathname !== "/settings" &&
          location.pathname !== "/settings/me" && (
          <>
            <Menu shadow="md" width={250} position="bottom-start">
              <Menu.Target>
                <Button
                  variant="subtle"
                  rightSection={<IconChevronDown />}
                  color="gray"
                >
                  Deine Boards
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                {boards.map((board) => (
                  <Menu.Item
                    key={board.id}
                    onClick={() => navigate("/" + board.id)}
                  >
                    {board.title}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          </>
        )}
      </Group>

      <Group>
        <Search />

        <Menu shadow="md" width={230} withArrow>
          <Menu.Target>
            <Group>
              <Avatar radius="xl" mr="xs" style={{ cursor: "pointer" }}>
                {pb.authStore.model?.name.substring(0, 2)}
              </Avatar>
            </Group>
          </Menu.Target>

          <Menu.Dropdown>
            <Space h={"xs"} />

            <Menu.Item onClick={() => navigate("/settings/me")}>
              <Group>
                <Avatar radius="xl">
                  {pb.authStore.model?.name.substring(0, 2)}
                </Avatar>
                <div>
                  <Text size="sm">{pb.authStore.model?.name}</Text>
                  <Text size="xs" c="dimmed">
                    {pb.authStore.model?.email}
                  </Text>
                </div>
              </Group>
            </Menu.Item>

            <Space h={"xs"} />
            <Menu.Divider />
            <Space h={"xs"} />

            <Menu.Item
              leftSection={<IconSettings size={"1em"} />}
              onClick={() => navigate("/settings")}
            >
              Einstellungen
            </Menu.Item>

            <Menu.Item
              leftSection={<IconLogout size={"1em"} />}
              color="red"
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
