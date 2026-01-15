import { Button, Group, Menu, Space, Text, Title } from "@mantine/core";
import {
  IconCircle,
  IconLoader,
  IconLogout,
  IconSettings,
} from "@tabler/icons-react";

import { useIsFetching } from "@tanstack/react-query";
import { useMatch, useNavigate } from "react-router-dom";

import { pb, useBoard } from "../../api/pocketbase";
import { useLogout } from "../../api/auth";

import { UserAvatar } from "../UI/UserAvatar";
import { FilterMenu } from "../UI/FilterMenu";
import { Search } from "../UI/Search";
import { ViewSwitch } from "../UI/ViewSwitch";

export function Header() {
  const logout = useLogout();
  const navigate = useNavigate();

  const isFetching = useIsFetching();

  // This is a workaround to get the boardId from the URL
  // because useParams is not working in the header
  // TODO: find a better solution, maybe with zustand
  const match = useMatch("/:boardId/*");
  const boardId = match?.params.boardId;
  const board = useBoard(boardId);

  return (
    <Group justify="space-between">
      <Group>
        {isFetching ? (
          <IconLoader
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          />
        ) : (
          <IconCircle
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          />
        )}

        <Title order={4}>{board?.data?.board.title}</Title>
      </Group>

      <Group gap={"xs"}>
        {boardId && boardId !== "settings" && (
          <>
            <Button
              variant="subtle"
              color="gray"
              size="xs"
              leftSection={<IconSettings size="1.2em" />}
              onClick={() => {
                navigate(`${boardId}/settings/`);
              }}
            >
              Einstellungen
            </Button>

            <FilterMenu />
            <ViewSwitch />
          </>
        )}

        {/* <Search /> */}

        <Menu shadow="md" width={230} withArrow>
          <Menu.Target>
            <Group>
              <UserAvatar
                  name={pb.authStore.record?.name}
                  radius="xl"
                  mr="xs"
                  style={{ cursor: "pointer" }}
                />
            </Group>
          </Menu.Target>

          <Menu.Dropdown>
            <Space h={"xs"} />

            <Menu.Item onClick={() => navigate("/settings/me")}>
              <Group>
                <UserAvatar name={pb.authStore.record?.name} radius="xl" />
                <div>
                  <Text size="sm">{pb.authStore.record?.name}</Text>
                  <Text size="xs" c="dimmed">
                    {pb.authStore.record?.email}
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
              onClick={() => logout.mutate()}
            >
              Abmelden
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
}
