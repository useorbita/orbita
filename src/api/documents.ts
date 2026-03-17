import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pb } from "./pocketbase";
import { Collections, type DocumentsResponse } from "./types";

// ============================================================================
// Query Keys
// ============================================================================

export const documentKeys = {
  all: [Collections.Documents] as const,
  byProject: (projectId: string) => [Collections.Documents, "project", projectId] as const,
  detail: (id: string) => [Collections.Documents, id] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Fetch all docs
 */
export const useDocuments = () =>
  useQuery({
    queryKey: documentKeys.all,
    queryFn: () =>
      pb.collection(Collections.Documents).getFullList<DocumentsResponse>({
        sort: "order,created",
      }),
  });

/**
 * Fetch docs for a specific project
 */
export const useDocumentsByProject = (projectId: string | undefined) =>
  useQuery({
    queryKey: documentKeys.byProject(projectId ?? ""),
    enabled: !!projectId,
    queryFn: () =>
      pb.collection(Collections.Documents).getFullList<DocumentsResponse>({
        filter: `project = "${projectId}"`,
        sort: "order,created",
      }),
  });

/**
 * Fetch a single document by ID
 */
export const useDocument = (id: string | undefined) =>
  useQuery({
    queryKey: documentKeys.detail(id ?? ""),
    enabled: !!id,
    queryFn: () => pb.collection(Collections.Documents).getOne<DocumentsResponse>(id!),
  });

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new document
 */
export const useCreateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title?: string;
      content?: string;
      project?: string;
      parent?: string;
      order?: number;
    }) => pb.collection(Collections.Documents).create<DocumentsResponse>(data),
    onSuccess: (data) => {
      queryClient.setQueryData(
        documentKeys.all,
        (old: DocumentsResponse[] | undefined) => (old ? [...old, data] : [data])
      );
      if (data.project) {
        queryClient.invalidateQueries({
          queryKey: documentKeys.byProject(data.project),
        });
      }
    },
  });
};

/**
 * Update a document
 */
export const useUpdateDocument = () => {
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
    }) => pb.collection(Collections.Documents).update<DocumentsResponse>(id, data),
    onSuccess: (data) => {
      // Update in list
      queryClient.setQueryData(
        documentKeys.all,
        (old: DocumentsResponse[] | undefined) =>
          old?.map((document) => (document.id === data.id ? data : document))
      );
      // Update detail cache
      queryClient.setQueryData(documentKeys.detail(data.id), data);
      // Invalidate project-specific list if document has a project
      if (data.project) {
        queryClient.invalidateQueries({
          queryKey: documentKeys.byProject(data.project),
        });
      }
    },
  });
};

/**
 * Delete a document
 */
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pb.collection(Collections.Documents).delete(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        documentKeys.all,
        (old: DocumentsResponse[] | undefined) => old?.filter((document) => document.id !== id)
      );
      queryClient.removeQueries({ queryKey: documentKeys.detail(id) });
    },
  });
};
