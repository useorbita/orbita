import { ActionIcon, Group, Text, Tooltip } from "@mantine/core";
import { IconDots } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ColumnView } from "../components/Board/ColumnView";
import { ListView } from "../components/Board/ListView";
import { CardModal } from "../components/Card/CardModal";
import { FilterMenu } from "../components/UI/FilterMenu";
import { Search } from "../components/UI/Search";
import { ViewSwitch } from "../components/UI/ViewSwitch";
import { useActiveBoardStore } from "../stores/activeBoardStore";

export function Board() {
  const { boardId, cardId } = useParams();

  const isLoading = useActiveBoardStore((state) => state.isLoading);
  const getActiveBoard = useActiveBoardStore((state) => state.getActiveBoard);
  const activeBoard = useActiveBoardStore((state) => state.activeBoard);

  const states = useActiveBoardStore((state) => state.states);
  const users = useActiveBoardStore((state) => state.users);
  const labels = useActiveBoardStore((state) => state.labels);
  const cards = useActiveBoardStore((state) => state.cards);

  const [view, setView] = useState("column");
  const navigate = useNavigate();

  useEffect(() => {
    getActiveBoard({ boardId });
  }, [boardId]);

  return (
    <>
      {cardId && (
        <CardModal
          open={!!cardId}
          close={() => navigate("/" + boardId)}
          cardId={cardId}
        />
      )}

      <Group justify="space-between" mb="xl">
        <Group gap={"xs"}>
          {/* <Tooltip
            label="[TODO] Dieses Board ist öffentlich"
            position="bottom-start"
            openDelay={500}
            withArrow
          >
            <IconWorld size={"1em"} />
          </Tooltip> */}
          <Text>{activeBoard?.title}</Text>

          <Tooltip
            label="Einstellungen"
            position="right"
            openDelay={500}
            withArrow
          >
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => {
                navigate("/settings/" + boardId);
              }}
            >
              <IconDots size="1em" />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Group>
          <Search />
          <FilterMenu />
          <ViewSwitch view={view} setView={setView} />
        </Group>
      </Group>

      {!isLoading && view === "column" && (
        <ColumnView
          states={states}
          cards={cards}
          users={users}
          labels={labels}
        />
      )}

      {!isLoading && view === "list" && (
        <ListView states={states} cards={cards} users={users} labels={labels} />
      )}
    </>
  );
}
