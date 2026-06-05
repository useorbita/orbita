import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pb } from "./pocketbase";
import { Collections, type BoardsResponse } from "./types";

// ============================================================================
// Query Keys
// ============================================================================

export const boardKeys = {
  all: [Collections.Boards] as const,
  byProject: (projectId: string) =>
    [Collections.Boards, "project", projectId] as const,
  detail: (id: string) => [Collections.Boards, id] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Fetch all boards
 */
export const useBoards = () =>
  useQuery({
    queryKey: boardKeys.all,
    queryFn: () =>
      pb.collection(Collections.Boards).getFullList<BoardsResponse>({
        sort: "created",
      }),
  });

/**
 * Fetch boards for a specific project
 */
export const useBoardsByProject = (projectId: string | undefined) =>
  useQuery({
    queryKey: boardKeys.byProject(projectId ?? ""),
    enabled: !!projectId,
    queryFn: () =>
      pb.collection(Collections.Boards).getFullList<BoardsResponse>({
        filter: `project = "${projectId}"`,
        sort: "created",
      }),
  });

/**
 * Fetch a single board by ID
 */
export const useBoard = (id: string | undefined) =>
  useQuery({
    queryKey: boardKeys.detail(id ?? ""),
    enabled: !!id,
    queryFn: () =>
      pb.collection(Collections.Boards).getOne<BoardsResponse>(id as string),
  });

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new board
 */
export const useCreateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      project?: string;
    }) => pb.collection(Collections.Boards).create<BoardsResponse>(data),
    onSuccess: (data) => {
      queryClient.setQueryData(
        boardKeys.all,
        (old: BoardsResponse[] | undefined) => (old ? [...old, data] : [data]),
      );
      if (data.project) {
        queryClient.invalidateQueries({
          queryKey: boardKeys.byProject(data.project),
        });
      }
    },
  });
};

/**
 * Update a board
 */
export const useUpdateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { title?: string; description?: string; project?: string };
    }) => pb.collection(Collections.Boards).update<BoardsResponse>(id, data),
    onSuccess: (data) => {
      // Update in list
      queryClient.setQueryData(
        boardKeys.all,
        (old: BoardsResponse[] | undefined) =>
          old?.map((board) => (board.id === data.id ? data : board)),
      );
      // Update detail cache
      queryClient.setQueryData(boardKeys.detail(data.id), data);
      // Invalidate project-specific list if board has a project
      if (data.project) {
        queryClient.invalidateQueries({
          queryKey: boardKeys.byProject(data.project),
        });
      }
    },
  });
};

/**
 * Delete a board
 */
export const useDeleteBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pb.collection(Collections.Boards).delete(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        boardKeys.all,
        (old: BoardsResponse[] | undefined) =>
          old?.filter((board) => board.id !== id),
      );
      queryClient.removeQueries({ queryKey: boardKeys.detail(id) });
    },
  });
};
