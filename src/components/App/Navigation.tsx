import {
  ActionIcon,
  AppShell,
  Avatar,
  FocusTrap,
  Group,
  NavLink,
  ScrollArea,
  Space,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconCheck,
  IconCircleDotted,
  IconHome2,
  IconPlus,
  IconSettings,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { pb } from "../../api/pocketbase";
import { BoardsResponse } from "../../api/types";
import { useBoardStore } from "../../stores/boardStore";
import { BoardLink } from "./BoardLink";

export function Navigation({
  loading,
  boards,
}: {
  loading: boolean;
  boards: BoardsResponse[];
}) {
  const navigate = useNavigate();

  const [addBoardMode, setAddBoardMode] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");

  const createBoard = useBoardStore((state) => state.createBoard);

  return (
    <>
      <AppShell.Section>
        <Space h="xl" />
        <Title order={2} ml="sm">
          Orbita
        </Title>
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
      </AppShell.Section>

      <AppShell.Section grow component={ScrollArea} mt={"xl"}>
        {!loading && boards.map((board) => <BoardLink key={board.id} board={board} />)}

        {addBoardMode ? (
          <FocusTrap active={addBoardMode}>
            <TextInput
              variant="unstyled"
              mt={"xs"}
              onChange={(event) => setNewBoardName(event.currentTarget.value)}
              leftSection={<IconCircleDotted size="1em" stroke={1.5} />}
              leftSectionWidth={40}
              rightSection={
                <>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={() => {
                      createBoard({
                        title: newBoardName,
                        member: pb.authStore.model?.id,
                      });

                      setNewBoardName("");
                      setAddBoardMode(false);
                    }}
                  >
                    <IconCheck size="1em" />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={() => {
                      setAddBoardMode(false);
                    }}
                  >
                    <IconX size="1em" />
                  </ActionIcon>
                </>
              }
              rightSectionWidth={79}
            />
          </FocusTrap>
        ) : (
          <NavLink
            mt={"xs"}
            label="Neues Board hinzufügen"
            leftSection={<IconPlus size="1em" stroke={1.5} />}
            style={{ color: "grey" }}
            onClick={() => setAddBoardMode(true)}
          />
        )}
      </AppShell.Section>

      <AppShell.Section>
        <NavLink
          h={60}
          label={
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
          }
          onClick={() => navigate("/settings/me")}
        />
      </AppShell.Section>
    </>
  );
}
