import {
  ActionIcon,
  Group,
  Loader,
  Space,
  Title,
  Tooltip,
} from "@mantine/core";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CodeView } from "../components/Board/CodeView";
import { LaneView } from "../components/Board/LaneView";
import { ListView } from "../components/Board/ListView";
import { CardModal } from "../components/Card/CardModal";
import { useActiveBoardStore } from "../stores/activeBoardStore";
import { IconSettings } from "@tabler/icons-react";
import { ViewSwitch } from "../components/UI/ViewSwitch";
import { FilterMenu } from "../components/UI/FilterMenu";

export function Board() {
  const { boardId, cardId } = useParams();

  const isLoading = useActiveBoardStore((state) => state.isLoading);
  const getActiveBoard = useActiveBoardStore((state) => state.getActiveBoard);
  const activeBoard = useActiveBoardStore((state) => state.activeBoard);

  const lists = useActiveBoardStore((state) => state.lists);
  const users = useActiveBoardStore((state) => state.users);
  const labels = useActiveBoardStore((state) => state.labels);
  const cards = useActiveBoardStore((state) => state.cards);

  const view = useActiveBoardStore((state) => state.view);

  const navigate = useNavigate();

  useEffect(() => {
    getActiveBoard({ boardId });
  }, [boardId]);

  if (isLoading) return <Loader color="gray" size="sm" />;

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
          <Title order={4}>{activeBoard?.title}</Title>
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

      {view === "code" && (
        <CodeView lists={lists} cards={cards} users={users} labels={labels} />
      )}

      {view === "lane" && (
        <LaneView lists={lists} cards={cards} users={users} labels={labels} />
      )}

      {view === "list" && (
        <ListView lists={lists} cards={cards} users={users} labels={labels} />
      )}
    </>
  );
}
