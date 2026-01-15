import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pb } from "./pocketbase";
import { Collections, LabelsResponse } from "./types";

// ============================================================================
// Query Keys
// ============================================================================

export const labelKeys = {
  all: [Collections.Labels] as const,
  byProject: (projectId: string) => [Collections.Labels, "project", projectId] as const,
  detail: (id: string) => [Collections.Labels, id] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Fetch all labels
 */
export const useLabels = () =>
  useQuery({
    queryKey: labelKeys.all,
    queryFn: () =>
      pb.collection(Collections.Labels).getFullList<LabelsResponse>({
        sort: "name",
      }),
  });

/**
 * Fetch labels for a specific project
 */
export const useLabelsByProject = (projectId: string | undefined) =>
  useQuery({
    queryKey: labelKeys.byProject(projectId ?? ""),
    enabled: !!projectId,
    queryFn: () =>
      pb.collection(Collections.Labels).getFullList<LabelsResponse>({
        filter: `project = "${projectId}"`,
        sort: "name",
      }),
  });

/**
 * Fetch a single label by ID
 */
export const useLabel = (id: string | undefined) =>
  useQuery({
    queryKey: labelKeys.detail(id ?? ""),
    enabled: !!id,
    queryFn: () => pb.collection(Collections.Labels).getOne<LabelsResponse>(id!),
  });

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new label
 */
export const useCreateLabel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; color?: string; project?: string }) =>
      pb.collection(Collections.Labels).create<LabelsResponse>(data),
    onSuccess: (data) => {
      queryClient.setQueryData(
        labelKeys.all,
        (old: LabelsResponse[] | undefined) => (old ? [...old, data] : [data])
      );
      if (data.project) {
        queryClient.invalidateQueries({
          queryKey: labelKeys.byProject(data.project),
        });
      }
    },
  });
};

/**
 * Update a label
 */
export const useUpdateLabel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; color?: string; project?: string };
    }) => pb.collection(Collections.Labels).update<LabelsResponse>(id, data),
    onSuccess: (data) => {
      // Update in list
      queryClient.setQueryData(
        labelKeys.all,
        (old: LabelsResponse[] | undefined) =>
          old?.map((label) => (label.id === data.id ? data : label))
      );
      // Update detail cache
      queryClient.setQueryData(labelKeys.detail(data.id), data);
      // Invalidate project-specific list if label has a project
      if (data.project) {
        queryClient.invalidateQueries({
          queryKey: labelKeys.byProject(data.project),
        });
      }
    },
  });
};

/**
 * Delete a label
 */
export const useDeleteLabel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pb.collection(Collections.Labels).delete(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        labelKeys.all,
        (old: LabelsResponse[] | undefined) => old?.filter((label) => label.id !== id)
      );
      queryClient.removeQueries({ queryKey: labelKeys.detail(id) });
    },
  });
};
