import { Box, Loader } from "@mantine/core";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useCardsByBoard } from "../api/cards";
import { useListsByBoard } from "../api/lists";
import { useUsers } from "../api/users";
import { useLabels } from "../api/labels";
import { CardsResponse } from "../api/types";

import { CodeView } from "../components/Board/CodeView";
import { ListView } from "../components/Board/ListView";
import { TableView } from "../components/Board/TableView";
import { CardModal } from "../components/Card/CardModal";

export function Board() {
  const { boardId, cardId } = useParams();

  const cards = useCardsByBoard(boardId);
  const lists = useListsByBoard(boardId);
  const users = useUsers();
  const labels = useLabels();

  const view = "table"; // Default view
  const navigate = useNavigate();

  // Group cards by list
  const allData = useMemo(() => {
    if (!cards.data || !lists.data) return {};

    const data: Record<string, CardsResponse[]> = {};

    // Initialize an empty array for each list id
    lists.data.forEach((list) => {
      data[list.id] = [];
    });

    // Assign each card to its list bucket
    cards.data.forEach((card) => {
      const listId = (card as any).list;
      if (listId && data[listId]) {
        data[listId].push(card);
      }
    });

    return data;
  }, [cards.data, lists.data]);

  const isLoading =
    cards.isLoading || lists.isLoading || users.isLoading || labels.isLoading;

  if (isLoading) return <Loader color="gray" size="sm" />;

  return (
    <Box h="100%">
      {cardId && (
        <CardModal
          open={!!cardId}
          close={() => navigate("/" + boardId)}
          cardId={cardId}
        />
      )}
      {/*
      {view === "code" &&
        lists.data &&
        cards.data &&
        users.data &&
        labels.data && (
          <CodeView
            allData={allData}
            lists={lists.data}
            cards={cards.data}
            users={users.data}
            labels={labels.data}
          />
        )}

      {view === "list" && users.data && labels.data && (
        <ListView allData={allData} users={users.data} labels={labels.data} />
      )} */}

      {view === "table" &&
        lists.data &&
        cards.data &&
        users.data &&
        labels.data && (
          <TableView
            lists={lists.data}
            cards={cards.data}
            users={users.data}
            labels={labels.data}
          />
        )}
    </Box>
  );
}
