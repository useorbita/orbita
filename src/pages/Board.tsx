import { Loader } from "@mantine/core";

import { useNavigate, useParams } from "react-router-dom";
import { useBoard } from "../api/pocketbase";

import { CodeView } from "../components/Board/CodeView";
import { LaneView } from "../components/Board/LaneView";
import { ListView } from "../components/Board/ListView";
import { CardModal } from "../components/Card/CardModal";

import { useActiveBoardStore } from "../stores/activeBoardStore";

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
