import { useMemo, useState, useEffect, useRef, useCallback } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { Box, Button, Group, Loader, Title } from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import { DragDropProvider } from "@dnd-kit/react";
import type { DragOverEvent, DragEndEvent } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { keyBetween, rekeyList } from "../shared/fractionalIndex";

import { useBoard } from "../api/boards";
import { useCardsByBoard, useUpdateCard } from "../api/cards";
import { useLabels } from "../api/labels";
import { useListsByBoard } from "../api/lists";
import type { CardsResponse, ListsResponse } from "../api/types";
import { useUsers } from "../api/users";

import { CardModal } from "../components/Card/CardModal";
import { ListView } from "../components/Board/ListView";
import { TableView } from "../components/Board/TableView";
import { ViewSwitch } from "../components/UI/ViewSwitch";
import type { UseMutationResult } from "@tanstack/react-query";

// ============================================================================
// useBoardDragDrop – encapsulates all dndkit state & event handlers
// ============================================================================

/**
 * Derive the initial items map (listId → cardId[]) from server data.
 * Cards are sorted by their fractional orderKey.
 */
function deriveItems(
  cards: CardsResponse[],
  lists: ListsResponse[],
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const list of lists) {
    result[list.id] = cards
      .filter((card) => card.list === list.id)
      .sort((a, b) => (a.orderKey || "").localeCompare(b.orderKey || ""))
      .map((card) => card.id);
  }
  return result;
}

function useBoardDragDrop(
  cardsData: CardsResponse[] | undefined,
  listsData: ListsResponse[] | undefined,
  updateCard: UseMutationResult<
    CardsResponse,
    Error,
    { id: string; data: { list?: string; orderKey?: string } },
    unknown
  >,
) {
  // Derived lookups
  const cardMap = useMemo(() => {
    if (!cardsData) return {} as Record<string, CardsResponse>;
    return Object.fromEntries(cardsData.map((c) => [c.id, c]));
  }, [cardsData]);

  // Items state – dndkit owns this, mutated optimistically by `move()`
  const [items, setItems] = useState<Record<string, string[]>>({});

  // Refs for coordination between effects and drag handlers
  const isDragging = useRef(false);
  const isMutating = useRef(false);
  const previousItems = useRef<Record<string, string[]>>({});

  // Seed items from the query cache whenever the data changes,
  // but only when the user is NOT dragging and no mutation is in-flight.
  useEffect(() => {
    if (isDragging.current || isMutating.current || !cardsData || !listsData)
      return;
    setItems(deriveItems(cardsData, listsData));
  }, [cardsData, listsData]);

  // Safety net: if the component unmounts while a mutation is pending,
  // reset the guard so the next mount isn't permanently blocked.
  useEffect(() => {
    return () => {
      isMutating.current = false;
    };
  }, []);

  // ── Drag handlers ──────────────────────────────────────────────

  const handleDragStart = useCallback(() => {
    isDragging.current = true;
    previousItems.current = structuredClone(items);
  }, [items]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { source } = event.operation;
    if (source?.type === "column") return;
    // `move` from @dnd-kit/helpers has complex generic types that are
    // impractical to satisfy here; the runtime behaviour is correct.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setItems((prev) => move(prev, event as any));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      isDragging.current = false;

      // Escape pressed → roll back
      if (event.canceled) {
        setItems(previousItems.current);
        return;
      }

      const { source } = event.operation;
      if (!source || source.type === "column") return;

      const cardId = String(source.id);

      // Find where the card landed
      let targetList: string | null = null;
      let targetIndex = -1;
      for (const [listId, cardIds] of Object.entries(items)) {
        const idx = cardIds.indexOf(cardId);
        if (idx !== -1) {
          targetList = listId;
          targetIndex = idx;
          break;
        }
      }
      if (!targetList) return;

      // Compute the new fractional orderKey between neighbours
      const listCards = items[targetList];
      const prevId = targetIndex > 0 ? listCards[targetIndex - 1] : null;
      const nextId =
        targetIndex < listCards.length - 1 ? listCards[targetIndex + 1] : null;
      const prevKey = prevId ? cardMap[prevId]?.orderKey || null : null;
      const nextKey = nextId ? cardMap[nextId]?.orderKey || null : null;

      let newOrderKey: string;
      let bulkUpdates: { id: string; orderKey: string }[] | null = null;

      try {
        newOrderKey = keyBetween(prevKey, nextKey);
      } catch {
        // Keys got out of order — regenerate all keys for this list
        bulkUpdates = rekeyList(listCards);
        newOrderKey = bulkUpdates[targetIndex].orderKey;
      }

      isMutating.current = true;

      const finish = () => {
        isMutating.current = false;
      };

      if (bulkUpdates) {
        // Persist every rekeyed card
        let remaining = bulkUpdates.length;
        let failed = false;

        for (const { id, orderKey } of bulkUpdates) {
          updateCard.mutate(
            { id, data: { orderKey } },
            {
              onSettled: () => {
                remaining--;
                if (remaining === 0) {
                  if (failed) setItems(previousItems.current);
                  finish();
                }
              },
              onError: () => {
                failed = true;
              },
            },
          );
        }
      } else {
        // Single mutation for the moved card
        updateCard.mutate(
          { id: cardId, data: { list: targetList, orderKey: newOrderKey } },
          {
            onSettled: () => finish(),
            onError: () => setItems(previousItems.current),
          },
        );
      }
    },
    [items, cardMap, updateCard],
  );

  return {
    items,
    cardMap,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}

// ============================================================================
// Board page component
// ============================================================================

export default function Board() {
  const { boardId, cardId } = useParams();
  const navigate = useNavigate();

  const board = useBoard(boardId);
  const cards = useCardsByBoard(boardId);
  const lists = useListsByBoard(boardId);
  const users = useUsers();
  const labels = useLabels();
  const updateCard = useUpdateCard();

  const [view, setView] = useState("list");

  const { items, cardMap, handleDragStart, handleDragOver, handleDragEnd } =
    useBoardDragDrop(cards.data, lists.data, updateCard);

  // Loading state: wait for all queries AND for lists to resolve
  // (checking lists.data handles empty boards correctly)
  const isLoading =
    cards.isLoading ||
    lists.isLoading ||
    users.isLoading ||
    labels.isLoading ||
    !lists.data;

  if (isLoading) return <Loader color="gray" />;

  return (
    <Box
      key={boardId}
      h="100%"
      style={{ display: "flex", flexDirection: "column" }}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <Group justify="space-between">
        <Title order={4}>{board?.data?.title}</Title>

        <Group gap="xs">
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

      {/* ── Card modal ──────────────────────────────────────────── */}
      {cardId && (
        <CardModal
          open={!!cardId}
          close={() => navigate(`/boards/${boardId}`)}
          cardId={cardId}
        />
      )}

      {/* ── List view (kanban) ──────────────────────────────────── */}
      {view === "list" &&
        users.data &&
        labels.data &&
        boardId &&
        lists.data && (
          <Box style={{ flex: 1, minHeight: 0 }}>
            <DragDropProvider
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <ListView
                items={items}
                cardMap={cardMap}
                lists={lists.data}
                boardId={boardId}
                users={users.data}
                labels={labels.data}
              />
            </DragDropProvider>
          </Box>
        )}

      {/* ── Table view ──────────────────────────────────────────── */}
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
