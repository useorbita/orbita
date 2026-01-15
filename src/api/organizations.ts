import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pb } from "./pocketbase";
import {
  Collections,
  OrganizationsResponse,
  OrganizationMembersResponse,
  OrganizationMembersRoleOptions,
  UsersResponse,
} from "./types";

// ============================================================================
// Query Keys
// ============================================================================

export const organizationKeys = {
  all: [Collections.Organizations] as const,
  detail: (id: string) => [Collections.Organizations, id] as const,
  members: (orgId: string) => [Collections.OrganizationMembers, orgId] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Fetch all organizations
 */
export const useOrganizations = () =>
  useQuery({
    queryKey: organizationKeys.all,
    queryFn: () =>
      pb.collection(Collections.Organizations).getFullList<OrganizationsResponse>({
        sort: "created",
      }),
  });

/**
 * Fetch a single organization by ID
 */
export const useOrganization = (id: string | undefined) =>
  useQuery({
    queryKey: organizationKeys.detail(id ?? ""),
    enabled: !!id,
    queryFn: () =>
      pb.collection(Collections.Organizations).getOne<OrganizationsResponse>(id!),
  });

type OrganizationMemberExpand = {
  user: UsersResponse;
};

/**
 * Fetch all members of an organization with expanded user data
 */
export const useOrganizationMembers = (orgId: string | undefined) =>
  useQuery({
    queryKey: organizationKeys.members(orgId ?? ""),
    enabled: !!orgId,
    queryFn: () =>
      pb
        .collection(Collections.OrganizationMembers)
        .getFullList<OrganizationMembersResponse<OrganizationMemberExpand>>({
          filter: `organization = "${orgId}"`,
          expand: "user",
        }),
  });

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new organization
 */
export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string }) =>
      pb.collection(Collections.Organizations).create<OrganizationsResponse>(data),
    onSuccess: (data) => {
      queryClient.setQueryData(
        organizationKeys.all,
        (old: OrganizationsResponse[] | undefined) => (old ? [...old, data] : [data])
      );
    },
  });
};

/**
 * Update an organization
 */
export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string } }) =>
      pb.collection(Collections.Organizations).update<OrganizationsResponse>(id, data),
    onSuccess: (data) => {
      // Update in list
      queryClient.setQueryData(
        organizationKeys.all,
        (old: OrganizationsResponse[] | undefined) =>
          old?.map((org) => (org.id === data.id ? data : org))
      );
      // Update detail cache
      queryClient.setQueryData(organizationKeys.detail(data.id), data);
    },
  });
};

/**
 * Delete an organization
 */
export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      pb.collection(Collections.Organizations).delete(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        organizationKeys.all,
        (old: OrganizationsResponse[] | undefined) =>
          old?.filter((org) => org.id !== id)
      );
      queryClient.removeQueries({ queryKey: organizationKeys.detail(id) });
      queryClient.removeQueries({ queryKey: organizationKeys.members(id) });
    },
  });
};

/**
 * Add a member to an organization
 */
export const useAddOrganizationMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      userId,
      role = OrganizationMembersRoleOptions.member,
    }: {
      organizationId: string;
      userId: string;
      role?: OrganizationMembersRoleOptions;
    }) =>
      pb.collection(Collections.OrganizationMembers).create<OrganizationMembersResponse>({
        organization: organizationId,
        user: userId,
        role,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: organizationKeys.members(variables.organizationId),
      });
    },
  });
};

/**
 * Remove a member from an organization
 */
export const useRemoveOrganizationMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      organizationId,
    }: {
      memberId: string;
      organizationId: string;
    }) => pb.collection(Collections.OrganizationMembers).delete(memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: organizationKeys.members(variables.organizationId),
      });
    },
  });
};

/**
 * Update a member's role in an organization
 */
export const useUpdateOrganizationMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      role,
    }: {
      memberId: string;
      organizationId: string;
      role: OrganizationMembersRoleOptions;
    }) =>
      pb
        .collection(Collections.OrganizationMembers)
        .update<OrganizationMembersResponse>(memberId, { role }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: organizationKeys.members(variables.organizationId),
      });
    },
  });
};
