import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pb } from "./pocketbase";
import { Collections, type CardsResponse, CardsPriorityOptions } from "./types";

// ============================================================================
// Types
// ============================================================================

/** Subset of card fields accepted by create / update mutations. */
export type CardUpdateData = {
  title?: string;
  list?: string;
  board?: string;
  description?: string;
  priority?: CardsPriorityOptions;
  labels?: string[];
  members?: string[];
  position?: number;
  orderKey?: string;
  date?: string;
};

// ============================================================================
// Helpers
// ============================================================================

/** Sort cards by their fractional orderKey in-place. */
function sortByOrderKey(cards: CardsResponse[]): CardsResponse[] {
  return cards.sort((a, b) =>
    (a.orderKey || "").localeCompare(b.orderKey || ""),
  );
}

/**
 * Resolve the board ID of a card from the query cache.
 * Tries the detail cache first (populated by CardModal), then
 * the all-cards cache.
 */
function resolveBoardId(
  queryClient: ReturnType<typeof useQueryClient>,
  cardId: string,
  fallback?: string,
): string | undefined {
  return (
    fallback ||
    queryClient.getQueryData<CardsResponse>(cardKeys.detail(cardId))?.board ||
    queryClient
      .getQueryData<CardsResponse[]>(cardKeys.all)
      ?.find((c) => c.id === cardId)?.board
  );
}

// ============================================================================
// Query Keys
// ============================================================================

export const cardKeys = {
  all: [Collections.Cards] as const,
  byBoard: (boardId: string) => [Collections.Cards, "board", boardId] as const,
  detail: (id: string) => [Collections.Cards, id] as const,
};

// ============================================================================
// Queries
// ============================================================================

/** Fetch all cards (global). */
export const useCards = () =>
  useQuery({
    queryKey: cardKeys.all,
    queryFn: () =>
      pb.collection(Collections.Cards).getFullList<CardsResponse>({
        sort: "orderKey",
      }),
  });

/** Fetch cards belonging to a specific board. */
export const useCardsByBoard = (boardId: string | undefined) =>
  useQuery({
    queryKey: cardKeys.byBoard(boardId ?? ""),
    enabled: !!boardId,
    queryFn: () =>
      pb.collection(Collections.Cards).getFullList<CardsResponse>({
        filter: `board = "${boardId}"`,
        sort: "orderKey",
      }),
  });

/** Fetch a single card by ID (used by CardModal). */
export const useCard = (id: string | undefined) =>
  useQuery({
    queryKey: cardKeys.detail(id ?? ""),
    enabled: !!id,
    queryFn: () =>
      pb.collection(Collections.Cards).getOne<CardsResponse>(id as string),
  });

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new card.
 */
export const useCreateCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string; list: string } & CardUpdateData) =>
      pb.collection(Collections.Cards).create<CardsResponse>(data),
    onSuccess: (data) => {
      // Append to all-cards cache (keep sorted by orderKey)
      queryClient.setQueryData(
        cardKeys.all,
        (old: CardsResponse[] | undefined) => {
          const updated = old ? [...old, data] : [data];
          return sortByOrderKey(updated);
        },
      );
      // Append to board-specific cache (keep sorted)
      if (data.board) {
        queryClient.setQueryData(
          cardKeys.byBoard(data.board),
          (old: CardsResponse[] | undefined) => {
            const updated = old ? [...old, data] : [data];
            return sortByOrderKey(updated);
          },
        );
      }
    },
  });
};

/**
 * Update a card — fully optimistic: updates all three caches
 * (all, byBoard, detail) inline, no network refetch.
 */
export const useUpdateCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CardUpdateData }) =>
      pb.collection(Collections.Cards).update<CardsResponse>(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches so they don't overwrite us
      await queryClient.cancelQueries({ queryKey: cardKeys.all });

      // Snapshot caches for rollback
      const previousAll = queryClient.getQueryData<CardsResponse[]>(
        cardKeys.all,
      );
      const boardId = resolveBoardId(queryClient, id, data.board);
      const previousByBoard = boardId
        ? queryClient.getQueryData<CardsResponse[]>(cardKeys.byBoard(boardId))
        : undefined;

      // Update all-cards cache
      queryClient.setQueryData(
        cardKeys.all,
        (old: CardsResponse[] | undefined) =>
          old?.map((card) => (card.id === id ? { ...card, ...data } : card)),
      );

      // Update board-specific cache
      if (boardId) {
        queryClient.setQueryData(
          cardKeys.byBoard(boardId),
          (old: CardsResponse[] | undefined) =>
            old?.map((card) => (card.id === id ? { ...card, ...data } : card)),
        );
      }

      // Update detail cache (used by CardModal)
      queryClient.setQueryData(
        cardKeys.detail(id),
        (old: CardsResponse | undefined) =>
          old ? { ...old, ...data } : undefined,
      );

      return { previousAll, previousByBoard, boardId };
    },
    onError: (_err, _vars, context) => {
      // Roll back on failure
      if (context?.previousAll !== undefined) {
        queryClient.setQueryData(cardKeys.all, context.previousAll);
      }
      if (context?.previousByBoard !== undefined && context?.boardId) {
        queryClient.setQueryData(
          cardKeys.byBoard(context.boardId),
          context.previousByBoard,
        );
      }
    },
  });
};

/**
 * Delete a card — optimistic removal from all caches.
 */
export const useDeleteCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pb.collection(Collections.Cards).delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: cardKeys.all });

      const previousAll = queryClient.getQueryData<CardsResponse[]>(
        cardKeys.all,
      );
      const boardId = resolveBoardId(queryClient, id);
      const previousByBoard = boardId
        ? queryClient.getQueryData<CardsResponse[]>(cardKeys.byBoard(boardId))
        : undefined;

      // Remove from all-cards cache
      queryClient.setQueryData(
        cardKeys.all,
        (old: CardsResponse[] | undefined) =>
          old?.filter((card) => card.id !== id),
      );

      // Remove from board-specific cache
      if (boardId) {
        queryClient.setQueryData(
          cardKeys.byBoard(boardId),
          (old: CardsResponse[] | undefined) =>
            old?.filter((card) => card.id !== id),
        );
      }

      return { previousAll, previousByBoard, boardId };
    },
    onError: (_err, _id, context) => {
      if (context?.previousAll !== undefined) {
        queryClient.setQueryData(cardKeys.all, context.previousAll);
      }
      if (context?.previousByBoard !== undefined && context?.boardId) {
        queryClient.setQueryData(
          cardKeys.byBoard(context.boardId),
          context.previousByBoard,
        );
      }
    },
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: cardKeys.detail(id) });
    },
  });
};
