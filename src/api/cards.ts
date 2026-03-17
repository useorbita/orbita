import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pb } from "./pocketbase";
import { Collections, type CardsResponse, CardsPriorityOptions } from "./types";

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

/**
 * Fetch all cards
 */
export const useCards = () =>
  useQuery({
    queryKey: cardKeys.all,
    queryFn: () =>
      pb.collection(Collections.Cards).getFullList<CardsResponse>({
        sort: "position",
      }),
  });

/**
 * Fetch cards for a specific board
 */
export const useCardsByBoard = (boardId: string | undefined) =>
  useQuery({
    queryKey: cardKeys.byBoard(boardId ?? ""),
    enabled: !!boardId && boardId !== "settings",
    queryFn: () =>
      pb.collection(Collections.Cards).getFullList<CardsResponse>({
        filter: `board = "${boardId}"`,
      }),
  });

/**
 * Fetch a single card by ID
 */
export const useCard = (id: string | undefined) =>
  useQuery({
    queryKey: cardKeys.detail(id ?? ""),
    enabled: !!id,
    queryFn: () => pb.collection(Collections.Cards).getOne<CardsResponse>(id!),
  });

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new card
 */
export const useCreateCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      list: string;
      board?: string;
      description?: string;
      priority?: CardsPriorityOptions;
      labels?: string[];
      members?: string[];
      position?: number;
      date?: string;
    }) => pb.collection(Collections.Cards).create<CardsResponse>(data),
    onSuccess: (data) => {
      queryClient.setQueryData(
        cardKeys.all,
        (old: CardsResponse[] | undefined) => (old ? [...old, data] : [data])
      );
      if (data.board) {
        queryClient.invalidateQueries({
          queryKey: cardKeys.byBoard(data.board),
        });
      }
    },
  });
};

/**
 * Update a card
 */
export const useUpdateCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        title?: string;
        list?: string;
        board?: string;
        description?: string;
        priority?: CardsPriorityOptions;
        labels?: string[];
        members?: string[];
        position?: number;
        date?: string;
      };
    }) => pb.collection(Collections.Cards).update<CardsResponse>(id, data),
    onSuccess: (data) => {
      // Update in list
      queryClient.setQueryData(
        cardKeys.all,
        (old: CardsResponse[] | undefined) =>
          old?.map((card) => (card.id === data.id ? data : card))
      );
      // Update detail cache
      queryClient.setQueryData(cardKeys.detail(data.id), data);
      // Invalidate board-specific list if card has a board
      if (data.board) {
        queryClient.invalidateQueries({
          queryKey: cardKeys.byBoard(data.board),
        });
      }
    },
  });
};

/**
 * Delete a card
 */
export const useDeleteCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pb.collection(Collections.Cards).delete(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        cardKeys.all,
        (old: CardsResponse[] | undefined) => old?.filter((card) => card.id !== id)
      );
      queryClient.removeQueries({ queryKey: cardKeys.detail(id) });
    },
  });
};
