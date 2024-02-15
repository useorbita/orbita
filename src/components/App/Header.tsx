import {
  ActionIcon,
  Avatar,
  Button,
  Group,
  Menu,
  Space,
  Text,
  Tooltip
} from "@mantine/core";
import {
  IconCircle,
  IconLogout,
  IconSettings
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { pb } from "../../api/pocketbase";
import { BoardsResponse } from "../../api/types";
import { useActiveBoardStore } from "../../stores/activeBoardStore";
import { useUserStore } from "../../stores/userStore";
import { ViewSwitch } from "../UI/ViewSwitch";

export function Header({ boards }: { boards: BoardsResponse[] }) {
  const activeBoard = useActiveBoardStore((state) => state.activeBoard);
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
            <Menu shadow="md" width={250} position="bottom-start" withArrow>
              <Menu.Target>
                <Button
                  variant="default"
                  size={"xs"}
                  ml={"xs"}
                  miw={"10em"}
                >
                  {activeBoard?.title}
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

            {location.pathname !== "/" &&
              location.pathname !== "/settings" &&
              location.pathname !== "/settings/me" && (
              <Tooltip
                label="Einstellungen"
                position="right"
                openDelay={500}
                withArrow
              >
                <ActionIcon
                  variant="transparent"
                  color="gray"
                  onClick={() => {
                    navigate(activeBoard?.id + "/settings/");
                  }}
                >
                  <IconSettings size="1em" />
                </ActionIcon>
              </Tooltip>
            )}
          </>
        )}
      </Group>

      <Group>
        {location.pathname === "/" ||
          (!location.pathname.includes("settings") && (
            <>
              <ViewSwitch />
              {/* <FilterMenu /> */}
            </>
          ))}

        {/* <Search /> */}

        <Menu shadow="md" width={230} withArrow>
          <Menu.Target>
            <Avatar radius="xl" mr="xs" style={{ cursor: "pointer" }}>
              {pb.authStore.model?.name.substring(0, 2)}
            </Avatar>
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
