import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pb } from "./pocketbase";
import { Collections, CardCommentsResponse } from "./types";

// ============================================================================
// Query Keys
// ============================================================================

export const commentKeys = {
  all: [Collections.CardComments] as const,
  byCard: (cardId: string) => [Collections.CardComments, "card", cardId] as const,
  detail: (id: string) => [Collections.CardComments, id] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Fetch all comments
 */
export const useComments = () =>
  useQuery({
    queryKey: commentKeys.all,
    queryFn: () =>
      pb.collection(Collections.CardComments).getFullList<CardCommentsResponse>({
        sort: "-created",
      }),
  });

/**
 * Fetch comments for a specific card
 */
export const useCommentsByCard = (cardId: string | undefined) =>
  useQuery({
    queryKey: commentKeys.byCard(cardId ?? ""),
    enabled: !!cardId,
    queryFn: () =>
      pb.collection(Collections.CardComments).getFullList<CardCommentsResponse>({
        filter: `card = "${cardId}"`,
        sort: "-created",
      }),
  });

/**
 * Fetch a single comment by ID
 */
export const useComment = (id: string | undefined) =>
  useQuery({
    queryKey: commentKeys.detail(id ?? ""),
    enabled: !!id,
    queryFn: () =>
      pb.collection(Collections.CardComments).getOne<CardCommentsResponse>(id!),
  });

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new comment
 */
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { content?: string; card?: string; author?: string }) =>
      pb.collection(Collections.CardComments).create<CardCommentsResponse>(data),
    onSuccess: (data) => {
      queryClient.setQueryData(
        commentKeys.all,
        (old: CardCommentsResponse[] | undefined) => (old ? [...old, data] : [data])
      );
      if (data.card) {
        queryClient.invalidateQueries({
          queryKey: commentKeys.byCard(data.card),
        });
      }
    },
  });
};

/**
 * Update a comment
 */
export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { content?: string; card?: string; author?: string };
    }) =>
      pb.collection(Collections.CardComments).update<CardCommentsResponse>(id, data),
    onSuccess: (data) => {
      // Update in list
      queryClient.setQueryData(
        commentKeys.all,
        (old: CardCommentsResponse[] | undefined) =>
          old?.map((comment) => (comment.id === data.id ? data : comment))
      );
      // Update detail cache
      queryClient.setQueryData(commentKeys.detail(data.id), data);
      // Invalidate card-specific list if comment has a card
      if (data.card) {
        queryClient.invalidateQueries({
          queryKey: commentKeys.byCard(data.card),
        });
      }
    },
  });
};

/**
 * Delete a comment
 */
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      pb.collection(Collections.CardComments).delete(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        commentKeys.all,
        (old: CardCommentsResponse[] | undefined) =>
          old?.filter((comment) => comment.id !== id)
      );
      queryClient.removeQueries({ queryKey: commentKeys.detail(id) });
    },
  });
};
