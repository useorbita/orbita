import { useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { Box, Button, Group, Loader, Title } from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";

import { useBoard } from "../api/boards";
import { useCardsByBoard } from "../api/cards";
import { useLabels } from "../api/labels";
import { useListsByBoard } from "../api/lists";
import type { CardsResponse } from "../api/types";
import { useUsers } from "../api/users";

import { CardModal } from "../components/Card/CardModal";
import { ListView } from "../components/Board/ListView";
import { TableView } from "../components/Board/TableView";
import { ViewSwitch } from "../components/UI/ViewSwitch";

export function Board() {
  const { boardId, cardId } = useParams();

  const board = useBoard(boardId);

  const cards = useCardsByBoard(boardId);
  const lists = useListsByBoard(boardId);
  const users = useUsers();
  const labels = useLabels();

  const [view, setView] = useState("list"); // Default view

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

  if (isLoading) return <Loader color="gray" />;

  return (
    <Box key={boardId} h="100%">
      <Group justify="space-between">
        <Title order={4}>{board?.data?.title}</Title>

        <Group gap={"xs"}>
          <ViewSwitch view={view} onChange={setView} />

          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconSettings size="1.2em" stroke={1.5} />}
            size="xs"
            onClick={() => navigate(`/boards/${boardId}/settings`)}
          >
            Einstellungen
          </Button>
        </Group>
      </Group>

      {cardId && (
        <CardModal
          open={!!cardId}
          close={() => navigate("/boards/" + boardId)}
          cardId={cardId}
        />
      )}


      {view === "list" && users.data && labels.data && boardId && lists.data && (
        <ListView
          allData={allData}
          lists={lists.data}
          boardId={boardId}
          users={users.data}
          labels={labels.data}
        />
      )}

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
