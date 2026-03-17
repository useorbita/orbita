import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pb } from "./pocketbase";
import { Collections, type ListsResponse } from "./types";

// ============================================================================
// Query Keys
// ============================================================================

export const listKeys = {
  all: [Collections.Lists] as const,
  byBoard: (boardId: string) => [Collections.Lists, "board", boardId] as const,
  detail: (id: string) => [Collections.Lists, id] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Fetch all lists
 */
export const useLists = () =>
  useQuery({
    queryKey: listKeys.all,
    queryFn: () =>
      pb.collection(Collections.Lists).getFullList<ListsResponse>({
        sort: "position",
      }),
  });

/**
 * Fetch lists for a specific board
 */
export const useListsByBoard = (boardId: string | undefined) =>
  useQuery({
    queryKey: listKeys.byBoard(boardId ?? ""),
    enabled: !!boardId && boardId !== "settings",
    queryFn: () =>
      pb.collection(Collections.Lists).getFullList<ListsResponse>({
        filter: `board = "${boardId}"`,
      }),
  });

/**
 * Fetch a single list by ID
 */
export const useList = (id: string | undefined) =>
  useQuery({
    queryKey: listKeys.detail(id ?? ""),
    enabled: !!id,
    queryFn: () => pb.collection(Collections.Lists).getOne<ListsResponse>(id!),
  });

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new list
 */
export const useCreateList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string; board?: string; position?: number }) =>
      pb.collection(Collections.Lists).create<ListsResponse>(data),
    onSuccess: (data) => {
      queryClient.setQueryData(
        listKeys.all,
        (old: ListsResponse[] | undefined) => (old ? [...old, data] : [data])
      );
      if (data.board) {
        queryClient.invalidateQueries({
          queryKey: listKeys.byBoard(data.board),
        });
      }
    },
  });
};

/**
 * Update a list
 */
export const useUpdateList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { title?: string; board?: string; position?: number };
    }) => pb.collection(Collections.Lists).update<ListsResponse>(id, data),
    onSuccess: (data) => {
      // Update in list
      queryClient.setQueryData(
        listKeys.all,
        (old: ListsResponse[] | undefined) =>
          old?.map((list) => (list.id === data.id ? data : list))
      );
      // Update detail cache
      queryClient.setQueryData(listKeys.detail(data.id), data);
      // Invalidate board-specific list if list has a board
      if (data.board) {
        queryClient.invalidateQueries({
          queryKey: listKeys.byBoard(data.board),
        });
      }
    },
  });
};

/**
 * Delete a list
 */
export const useDeleteList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pb.collection(Collections.Lists).delete(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        listKeys.all,
        (old: ListsResponse[] | undefined) => old?.filter((list) => list.id !== id)
      );
      queryClient.removeQueries({ queryKey: listKeys.detail(id) });
    },
  });
};
