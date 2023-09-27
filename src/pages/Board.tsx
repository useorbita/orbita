import { Loader } from "@mantine/core";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CodeView } from "../components/Board/CodeView";
import { LaneView } from "../components/Board/LaneView";
import { ListView } from "../components/Board/ListView";
import { CardModal } from "../components/Card/CardModal";
import { useActiveBoardStore } from "../stores/activeBoardStore";

export function Board() {
  const { boardId, cardId } = useParams();

  const isLoading = useActiveBoardStore((state) => state.isLoading);
  const getActiveBoard = useActiveBoardStore((state) => state.getActiveBoard);

  const states = useActiveBoardStore((state) => state.states);
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

      {view === "code" && (
        <CodeView states={states} cards={cards} users={users} labels={labels} />
      )}

      {view === "lane" && (
        <LaneView states={states} cards={cards} users={users} labels={labels} />
      )}

      {view === "list" && (
        <ListView states={states} cards={cards} users={users} labels={labels} />
      )}
    </>
  );
}
