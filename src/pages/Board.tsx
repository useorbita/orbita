import { Box, Loader } from "@mantine/core";

import { useNavigate, useParams } from "react-router-dom";
import { useBoard } from "../api/pocketbase";

import { CodeView } from "../components/Board/CodeView";
import { ListView } from "../components/Board/ListView";
import { TableView } from "../components/Board/TableView";
import { CardModal } from "../components/Card/CardModal";

import { useActiveBoardStore } from "../stores/activeBoardStore";

export function Board() {
  const { boardId, cardId } = useParams();

  const board = useBoard(boardId);
  const view = useActiveBoardStore((state) => state.view);

  const navigate = useNavigate();

  if (board.isLoading) return <Loader color="gray" size="sm" />;

  return (
    <Box h="100%">
      {cardId && (
        <CardModal
          open={!!cardId}
          close={() => navigate("/" + boardId)}
          cardId={cardId}
        />
      )}

      {view === "code" && board.data && (
        <CodeView
          allData={board.data.allData}
          lists={board.data.lists}
          cards={board.data.cards}
          users={board.data.users}
          labels={board.data.labels}
        />
      )}

      {view === "list" && board.data && (
        <ListView
          allData={board.data.allData}
          users={board.data.users}
          labels={board.data.labels}
        />
      )}

      {/* {view === "table" && board.data && (
        <TableView
          lists={board.data.lists}
          cards={board.data.cards}
          users={board.data.users}
          labels={board.data.labels}
        />
      )} */}
    </Box>
  );
}
