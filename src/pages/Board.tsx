import {
  ActionIcon,
  Group,
  Loader,
  Space,
  Title,
  Tooltip,
} from "@mantine/core";

import { useNavigate, useParams } from "react-router-dom";
import { CodeView } from "../components/Board/CodeView";
import { LaneView } from "../components/Board/LaneView";
import { ListView } from "../components/Board/ListView";
import { CardModal } from "../components/Card/CardModal";
import { useActiveBoardStore } from "../stores/activeBoardStore";
import { IconSettings } from "@tabler/icons-react";
import { ViewSwitch } from "../components/UI/ViewSwitch";
import { FilterMenu } from "../components/UI/FilterMenu";
import { useBoard } from "../api/pocketbase";

export function Board() {
  const { boardId, cardId } = useParams();

  const board = useBoard(boardId);
  const view = useActiveBoardStore((state) => state.view);

  const navigate = useNavigate();

  if (board.isLoading) return <Loader color="gray" size="sm" />;

  return (
    <>
      {cardId && (
        <CardModal
          open={!!cardId}
          close={() => navigate("/" + boardId)}
          cardId={cardId}
        />
      )}

      <Group justify="space-between">
        <Group>
          <Title order={4}>{board.data?.board.title}</Title>
          <Tooltip
            label="Einstellungen"
            position="right"
            openDelay={500}
            withArrow
          >
            <ActionIcon
              variant="subtle"
              size="lg"
              color="gray"
              onClick={() => {
                navigate("settings/");
              }}
            >
              <IconSettings size="1.2em" />
            </ActionIcon>
          </Tooltip>
        </Group>
        <Group>
          <FilterMenu />
          <ViewSwitch />
        </Group>
      </Group>

      <Space h="sm" />

      {view === "code" && board.data && (
        <CodeView
          lists={board.data.lists}
          cards={board.data.cards}
          users={board.data.users}
          labels={board.data.labels}
        />
      )}

      {view === "lane" && board.data && (
        <LaneView
          lists={board.data.lists}
          cards={board.data.cards}
          users={board.data.users}
          labels={board.data.labels}
        />
      )}

      {view === "list" && board.data && (
        <ListView
          lists={board.data.lists}
          cards={board.data.cards}
          users={board.data.users}
          labels={board.data.labels}
        />
      )}
    </>
  );
}
