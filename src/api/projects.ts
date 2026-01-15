import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pb } from "./pocketbase";
import {
  Collections,
  ProjectsResponse,
  ProjectMembersResponse,
  ProjectMembersRoleOptions,
  UsersResponse,
} from "./types";

// ============================================================================
// Query Keys
// ============================================================================

export const projectKeys = {
  all: [Collections.Projects] as const,
  detail: (id: string) => [Collections.Projects, id] as const,
  members: (projectId: string) => [Collections.ProjectMembers, projectId] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Fetch all projects
 */
export const useProjects = () =>
  useQuery({
    queryKey: projectKeys.all,
    queryFn: () =>
      pb.collection(Collections.Projects).getFullList<ProjectsResponse>({
        sort: "created",
      }),
  });

/**
 * Fetch a single project by ID
 */
export const useProject = (id: string | undefined) =>
  useQuery({
    queryKey: projectKeys.detail(id ?? ""),
    enabled: !!id,
    queryFn: () =>
      pb.collection(Collections.Projects).getOne<ProjectsResponse>(id!),
  });

type ProjectMemberExpand = {
  user: UsersResponse;
};

/**
 * Fetch all members of a project with expanded user data
 */
export const useProjectMembers = (projectId: string | undefined) =>
  useQuery({
    queryKey: projectKeys.members(projectId ?? ""),
    enabled: !!projectId,
    queryFn: () =>
      pb
        .collection(Collections.ProjectMembers)
        .getFullList<ProjectMembersResponse<ProjectMemberExpand>>({
          filter: `project = "${projectId}"`,
          expand: "user",
        }),
  });

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new project
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; ticket_counter?: number }) =>
      pb.collection(Collections.Projects).create<ProjectsResponse>(data),
    onSuccess: (data) => {
      queryClient.setQueryData(
        projectKeys.all,
        (old: ProjectsResponse[] | undefined) => (old ? [...old, data] : [data])
      );
    },
  });
};

/**
 * Update a project
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; ticket_counter?: number };
    }) => pb.collection(Collections.Projects).update<ProjectsResponse>(id, data),
    onSuccess: (data) => {
      // Update in list
      queryClient.setQueryData(
        projectKeys.all,
        (old: ProjectsResponse[] | undefined) =>
          old?.map((project) => (project.id === data.id ? data : project))
      );
      // Update detail cache
      queryClient.setQueryData(projectKeys.detail(data.id), data);
    },
  });
};

/**
 * Delete a project
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pb.collection(Collections.Projects).delete(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        projectKeys.all,
        (old: ProjectsResponse[] | undefined) =>
          old?.filter((project) => project.id !== id)
      );
      queryClient.removeQueries({ queryKey: projectKeys.detail(id) });
      queryClient.removeQueries({ queryKey: projectKeys.members(id) });
    },
  });
};

/**
 * Add a member to a project
 */
export const useAddProjectMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      userId,
      role = ProjectMembersRoleOptions.member,
    }: {
      projectId: string;
      userId: string;
      role?: ProjectMembersRoleOptions;
    }) =>
      pb.collection(Collections.ProjectMembers).create<ProjectMembersResponse>({
        project: projectId,
        user: userId,
        role,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.members(variables.projectId),
      });
    },
  });
};

/**
 * Remove a member from a project
 */
export const useRemoveProjectMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      projectId,
    }: {
      memberId: string;
      projectId: string;
    }) => pb.collection(Collections.ProjectMembers).delete(memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.members(variables.projectId),
      });
    },
  });
};

/**
 * Update a member's role in a project
 */
export const useUpdateProjectMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      role,
    }: {
      memberId: string;
      projectId: string;
      role: ProjectMembersRoleOptions;
    }) =>
      pb
        .collection(Collections.ProjectMembers)
        .update<ProjectMembersResponse>(memberId, { role }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.members(variables.projectId),
      });
    },
  });
};
