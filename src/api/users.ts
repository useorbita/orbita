import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pb } from "./pocketbase";
import { Collections, type UsersResponse } from "./types";

// ============================================================================
// Query Keys
// ============================================================================

export const userKeys = {
  all: [Collections.Users] as const,
  detail: (id: string) => [Collections.Users, id] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Fetch all users
 */
export const useUsers = () =>
  useQuery({
    queryKey: userKeys.all,
    queryFn: () =>
      pb.collection(Collections.Users).getFullList<UsersResponse>({
        sort: "name",
      }),
  });

/**
 * Fetch a single user by ID
 */
export const useUser = (id: string | undefined) =>
  useQuery({
    queryKey: userKeys.detail(id ?? ""),
    enabled: !!id,
    queryFn: () =>
      pb.collection(Collections.Users).getOne<UsersResponse>(id as string),
  });

// ============================================================================
// Mutations
// ============================================================================

/**
 * Update a user
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        name?: string;
        email?: string;
        username?: string;
        avatar?: File;
      };
    }) => pb.collection(Collections.Users).update<UsersResponse>(id, data),
    onSuccess: (data) => {
      // Update in list
      queryClient.setQueryData(
        userKeys.all,
        (old: UsersResponse[] | undefined) =>
          old?.map((user) => (user.id === data.id ? data : user)),
      );
      // Update detail cache
      queryClient.setQueryData(userKeys.detail(data.id), data);
    },
  });
};

/**
 * Delete a user
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pb.collection(Collections.Users).delete(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        userKeys.all,
        (old: UsersResponse[] | undefined) =>
          old?.filter((user) => user.id !== id),
      );
      queryClient.removeQueries({ queryKey: userKeys.detail(id) });
    },
  });
};
