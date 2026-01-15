import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pb } from "./pocketbase";
import { Collections, DocsResponse } from "./types";

// ============================================================================
// Query Keys
// ============================================================================

export const docKeys = {
  all: [Collections.Docs] as const,
  byProject: (projectId: string) => [Collections.Docs, "project", projectId] as const,
  detail: (id: string) => [Collections.Docs, id] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Fetch all docs
 */
export const useDocs = () =>
  useQuery({
    queryKey: docKeys.all,
    queryFn: () =>
      pb.collection(Collections.Docs).getFullList<DocsResponse>({
        sort: "order,created",
      }),
  });

/**
 * Fetch docs for a specific project
 */
export const useDocsByProject = (projectId: string | undefined) =>
  useQuery({
    queryKey: docKeys.byProject(projectId ?? ""),
    enabled: !!projectId,
    queryFn: () =>
      pb.collection(Collections.Docs).getFullList<DocsResponse>({
        filter: `project = "${projectId}"`,
        sort: "order,created",
      }),
  });

/**
 * Fetch a single doc by ID
 */
export const useDoc = (id: string | undefined) =>
  useQuery({
    queryKey: docKeys.detail(id ?? ""),
    enabled: !!id,
    queryFn: () => pb.collection(Collections.Docs).getOne<DocsResponse>(id!),
  });

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new doc
 */
export const useCreateDoc = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title?: string;
      content?: string;
      project?: string;
      parent?: string;
      order?: number;
    }) => pb.collection(Collections.Docs).create<DocsResponse>(data),
    onSuccess: (data) => {
      queryClient.setQueryData(
        docKeys.all,
        (old: DocsResponse[] | undefined) => (old ? [...old, data] : [data])
      );
      if (data.project) {
        queryClient.invalidateQueries({
          queryKey: docKeys.byProject(data.project),
        });
      }
    },
  });
};

/**
 * Update a doc
 */
export const useUpdateDoc = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        title?: string;
        content?: string;
        project?: string;
        parent?: string;
        order?: number;
      };
    }) => pb.collection(Collections.Docs).update<DocsResponse>(id, data),
    onSuccess: (data) => {
      // Update in list
      queryClient.setQueryData(
        docKeys.all,
        (old: DocsResponse[] | undefined) =>
          old?.map((doc) => (doc.id === data.id ? data : doc))
      );
      // Update detail cache
      queryClient.setQueryData(docKeys.detail(data.id), data);
      // Invalidate project-specific list if doc has a project
      if (data.project) {
        queryClient.invalidateQueries({
          queryKey: docKeys.byProject(data.project),
        });
      }
    },
  });
};

/**
 * Delete a doc
 */
export const useDeleteDoc = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pb.collection(Collections.Docs).delete(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        docKeys.all,
        (old: DocsResponse[] | undefined) => old?.filter((doc) => doc.id !== id)
      );
      queryClient.removeQueries({ queryKey: docKeys.detail(id) });
    },
  });
};
