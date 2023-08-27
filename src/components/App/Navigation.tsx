import {
  ActionIcon,
  Avatar,
  FocusTrap,
  Group,
  NavLink,
  Space,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconCheck,
  IconCircleDotted,
  IconDots,
  IconHome2,
  IconPlus,
  IconSettings,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBoard, pb } from "../../api/pocketbase";
import { BoardsResponse } from "../../api/types";

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
                  <IconDots size="1em" />
                </ActionIcon>
              }
            />
          </Group>
        ))
      )}

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
                  onClick={async (e) => {
                    await createBoard({
                      title: newBoardName,
                      member: pb.authStore.model?.id,
                    });

                    // TODO: we need to trigger reload of boards.
                    // i think we need proper state management here
                    window.location.reload();
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
          label="Board hinzufügen"
          leftSection={<IconPlus size="1em" stroke={1.5} />}
          style={{ color: "grey" }}
          onClick={() => setAddBoardMode(true)}
        />
      )}
    </>
  );
}
