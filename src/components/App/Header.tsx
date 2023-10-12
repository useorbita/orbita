import {
  ActionIcon,
  Avatar,
  Group,
  Menu,
  Text,
  Title,
  Tooltip,
  rem,
} from "@mantine/core";
import {
  IconCircleDotted,
  IconLogout,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { pb } from "../../api/pocketbase";
import { BoardsResponse } from "../../api/types";
import { useActiveBoardStore } from "../../stores/activeBoardStore";
import { useUserStore } from "../../stores/userStore";
import { FilterMenu } from "../UI/FilterMenu";
import { Search } from "../UI/Search";
import { ViewSwitch } from "../UI/ViewSwitch";

export function Header({ boards }: { boards: BoardsResponse[] }) {
  const activeBoard = useActiveBoardStore((state) => state.activeBoard);
  const logout = useUserStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Group justify="space-between">
      <Group>
        <Title
          order={2}
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
          mr={"md"}
        >
          orbita
        </Title>

        {location.pathname !== "/" &&
          location.pathname !== "/settings" &&
          location.pathname !== "/settings/me" && (
            <>
              <Menu shadow="md" width={250} position="bottom-start" withArrow>
                <Menu.Target>
                  <Text>{activeBoard?.title}</Text>
                </Menu.Target>

                <Menu.Dropdown>
                  {boards.map((board) => (
                    <Menu.Item
                      key={board.id}
                      leftSection={<IconCircleDotted size="1em" stroke={1.5} />}
                      onClick={() => navigate("/" + board.id)}
                    >
                      {board.title}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>

              <Tooltip
                label="Einstellungen"
                position="right"
                openDelay={500}
                withArrow
              >
                <ActionIcon
                  variant="default"
                  color="gray"
                  onClick={() => {
                    navigate("/settings/" + activeBoard?.id);
                  }}
                >
                  <IconSettings size="1em" />
                </ActionIcon>
              </Tooltip>
            </>
          )}
      </Group>

      <Group>
        {location.pathname === "/" ||
          (!location.pathname.includes("settings") && (
            <>
              <ViewSwitch />
              <FilterMenu />
            </>
          ))}

        <Search />

        <Menu shadow="md" width={200} withArrow>
          <Menu.Target>
            <Avatar radius="xl" mr="xs" style={{ cursor: "pointer" }}>
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
              Dein Profil
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
