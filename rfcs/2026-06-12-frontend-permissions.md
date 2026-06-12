---
date: 2026-06-12
type: implementation-plan
status: draft
title: "Frontend Permissions — Client-Side Role Derivation for UI Controls"
tags: [frontend, permissions, react, pocketbase, ux, api-rules]
depends_on: [2026-06-12-api-rules]
---
# Frontend Permissions — Client-Side Role Derivation for UI Controls

## Summary

The API rules RFC defines a server-enforced, role-based permission model. PocketBase rejects unauthorized operations with HTTP 403. The frontend needs to **mirror** those rules client-side so the UI can hide or disable controls (create, edit, delete, settings, member management) *before* the user attempts a forbidden action. This RFC defines a reusable `usePermissions` hook that derives the current user's effective permissions from their `organization_members` and `project_members` records, and defines where each permission check applies across the existing component tree.

## Architecture

### Data Flow

```
PocketBase
  ├── organization_members (role: "owner" | "member", is_external)
  └── project_members      (role: "admin" | "member" | "viewer", is_external)
         │
         ▼
  usePermissions(orgId?, projectId?)
         │
         ▼
  { canCreateContent, canEditContent, canDeleteContent,
    canManageLabels, canManageMembers, canManageSettings,
    canDeleteComment(authorId), isViewer }
         │
         ▼
  Component conditionally renders buttons / enables inputs
```

The server API rules remain the **only security boundary**. Client-side checks are purely for UX — hiding controls the user cannot use. Every mutation should still handle HTTP 403 gracefully as a fallback.

### Why Derive, Not Duplicate

The permission rules are complex (4 levels of relation traversal, OR-combined clauses for org owner override). Re-implementing the exact PocketBase filter logic in the frontend would be error-prone and drift-prone. Instead, we query the two membership tables — the same data PocketBase uses to evaluate rules — and derive boolean capabilities from the role values alone. This is simple, deterministic, and stays in sync because the server validates every write.

## The `usePermissions` Hook

### Location

New file: `src/api/permissions.ts`

### Signature

```ts
function usePermissions(orgId?: string, projectId?: string): Permissions
```

When only `orgId` is provided, returns org-scoped permissions (e.g., "can create project"). When `projectId` is also provided, returns project-scoped permissions (inheriting org owner override).

### Return Type

```ts
type Permissions = {
  canCreateContent: boolean;
  canEditContent: boolean;
  canDeleteContent: boolean;
  canManageLabels: boolean;
  canManageMembers: boolean;
  canManageSettings: boolean;
  canDeleteComment: (commentAuthorId: string) => boolean;
  isViewer: boolean;
  isLoading: boolean;
};
```

### Implementation Sketch

```ts
import { useQuery } from "@tanstack/react-query";
import { pb } from "./pocketbase";
import { useAuth } from "./auth";
import { Collections } from "./types";

export function usePermissions(orgId?: string, projectId?: string) {
  const { user } = useAuth();

  // 1. Fetch current user's org membership
  const orgMembership = useQuery({
    queryKey: ["perm", "org", orgId, user?.id],
    enabled: !!orgId && !!user,
    queryFn: () =>
      pb.collection(Collections.OrganizationMembers).getFirstListItem(
        `user = "${user!.id}" && organization = "${orgId}"`
      ),
  });

  // 2. Fetch current user's project membership
  const projectMembership = useQuery({
    queryKey: ["perm", "project", projectId, user?.id],
    enabled: !!projectId && !!user,
    queryFn: () =>
      pb.collection(Collections.ProjectMembers).getFirstListItem(
        `user = "${user!.id}" && project = "${projectId}"`
      ),
  });

  // 3. Derive roles
  const isOrgOwner = orgMembership.data?.role === "owner";
  const isProjectAdmin = projectMembership.data?.role === "admin";
  const isProjectMember = projectMembership.data?.role === "member";
  const isViewer = projectMembership.data?.role === "viewer";

  // Org owners have full access to everything in their org
  // Project admins have full access to their project
  const canEdit = isOrgOwner || isProjectAdmin || isProjectMember;
  const canDelete = isOrgOwner || isProjectAdmin;
  const canManage = isOrgOwner || isProjectAdmin;

  return {
    canCreateContent: isOrgOwner || isProjectAdmin || isProjectMember,
    canEditContent: canEdit,
    canDeleteContent: canDelete,
    canManageLabels: canManage,
    canManageMembers: canManage,
    canManageSettings: canManage,
    canDeleteComment: (authorId: string) =>
      user?.id === authorId || canManage,
    isViewer,
    isLoading: orgMembership.isLoading || projectMembership.isLoading,
  };
}
```

### Why `getFirstListItem` Instead of Filtering the Full List

Many pages already fetch all members via `useOrganizationMembers` / `useProjectMembers` for display. Reusing that data by filtering client-side for the current user would avoid an extra query. However:

- Not every page fetches the full member list (e.g., `Board.tsx` does not).
- The `getFirstListItem` query is a **single indexed row** — fast and cheap.
- React Query deduplicates identical queries automatically, so calling `usePermissions` from multiple components under the same org/project only hits the network once.
- The hook is self-contained — it works anywhere without the parent needing to pass membership arrays down.

### Performance: Many-Project Pages

Pages like `Home.tsx` list many projects. Calling `usePermissions` per project card would fire one `project_members` query per project. For this case, use a separate bulk hook:

```ts
function useMyProjectRoles() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["perm", "my-project-roles", user?.id],
    enabled: !!user,
    queryFn: () =>
      pb.collection(Collections.ProjectMembers).getFullList({
        filter: `user = "${user!.id}"`,
      }),
  });
}
```

The caller builds a `Map<projectId, role>`:

```ts
const myRoles = useMyProjectRoles();
const roleMap = new Map(myRoles.data?.map((m) => [m.project, m.role]));
```

Then resolves permissions inline without extra network calls.

## Permission Mapping — Which Controls Are Gated

### Org-Level Pages

| Page | Control | Required Permission | RFC Rule Ref |
|------|---------|-------------------|--------------|
| `OrgOverview` | "Neues Projekt" button | `isOrgOwner \|\| isOrgMember` (any org member) | `projects.createRule` |
| `OrgOverview` | "Einstellungen" button | `canManageSettings` (org owner only) | `organizations.updateRule` |
| `OrgSettings` | Edit org name (enable input) | `canManageSettings` | `organizations.updateRule` |
| `OrgSettings` | Add/remove members | `canManageMembers` | `organization_members.create/deleteRule` |
| `OrgSettings` | Change member roles | `canManageMembers` | `organization_members.updateRule` |
| `OrgSettings` | Delete org button | `canManageSettings` | `organizations.deleteRule` |

### Project-Level Pages

| Page | Control | Required Permission | RFC Rule Ref |
|------|---------|-------------------|--------------|
| `ProjectOverview` | "Neues Board" button | `canCreateContent` (not viewer) | `boards.createRule` |
| `ProjectOverview` | "Neues Dokument" button | `canCreateContent` (not viewer) | `documents.createRule` |
| `ProjectOverview` | "Einstellungen" button | `canManageSettings` | `projects.updateRule` |
| `ProjectSettings` | Edit project name | `canManageSettings` | `projects.updateRule` |
| `ProjectSettings` | Add/remove members | `canManageMembers` | `project_members.create/deleteRule` |
| `ProjectSettings` | Change member roles | `canManageMembers` | `project_members.updateRule` |
| `ProjectSettings` | Delete project button | `canManageSettings` | `projects.deleteRule` |

### Board / Card / Document Pages

| Page/Component | Control | Required Permission | RFC Rule Ref |
|----------------|---------|-------------------|--------------|
| `Board.tsx` | Drag-and-drop cards | `canEditContent` (disable for viewers) | `cards.updateRule` |
| `Board.tsx` | "Einstellungen" button | `canManageSettings` | `boards.updateRule` |
| `BoardSettings` | Edit board title | `canManageSettings` | `boards.updateRule` |
| `BoardSettings` | Delete board | `canManageSettings` | `boards.deleteRule` |
| `ListView` / `TableView` | Inline card create | `canCreateContent` | `cards.createRule` |
| `CardModal` | Edit description, labels, members, priority, date | `canEditContent` | `cards.updateRule` |
| `CardModal` | Delete card (trash icon) | `canDeleteContent` | `cards.deleteRule` |
| `CardModal` | Add comment | `canCreateContent` (not viewer) | `card_comments.createRule` |
| `CardModal` | Edit own comment | comment author only | `card_comments.updateRule` |
| `CardModal` | Delete comment | `canDeleteComment(authorId)` | `card_comments.deleteRule` |
| `DocumentView` | Edit document content | `canEditContent` | `documents.updateRule` |
| `DocumentView` | Delete document | `canDeleteContent` | `documents.deleteRule` |

### Labels (Special Case)

Labels have stricter rules than other content — only project admins and org owners can update or delete them (RFC lines 215-217). Any non-viewer can create.

| Component | Control | Required Permission | RFC Rule Ref |
|-----------|---------|-------------------|--------------|
| Label picker (anywhere) | Create new label | `canCreateContent` (not viewer) | `labels.createRule` |
| Label management UI | Edit label name/color | `canManageLabels` | `labels.updateRule` |
| Label management UI | Delete label | `canManageLabels` | `labels.deleteRule` |

## Component Integration Pattern

Every affected component follows the same pattern:

```tsx
// 1. Import the hook
import { usePermissions } from "../api/permissions";

export default function ProjectOverview() {
  const { projectId } = useParams();
  const project = useProject(projectId);

  // 2. Call the hook with the relevant IDs
  const perms = usePermissions(project.data?.organization, projectId);

  // 3. Guard rendering
  return (
    <>
      {perms.canCreateContent && (
        <Button onClick={() => setCreatingBoard(true)}>Neues Board</Button>
      )}

      {perms.canManageSettings && (
        <Button onClick={() => navigate(`/projects/${projectId}/settings`)}>
          Einstellungen
        </Button>
      )}
    </>
  );
}
```

### Edge Cases

- **Loading state**: While `perms.isLoading` is true, either hide all guarded controls (conservative) or show them disabled with a skeleton (optimistic). Hiding is safer — it prevents a viewer from briefly seeing a delete button before it disappears.
- **Missing org/project ID**: The hook returns all `false` when IDs are undefined (guards not yet available).
- **User is not a member**: If the user has no `organization_members` or `project_members` record for the given scope, `getFirstListItem` throws a 404. The hook should catch this and treat it as "no permissions" rather than propagating the error.
- **Personal orgs**: For `is_personal` orgs, some controls (rename, delete) are already disabled in the UI. The `canManageSettings` flag should still reflect the user's actual role.

### Error Handling

Wrap `getFirstListItem` in a try-catch to handle the case where the user has no membership record:

```ts
queryFn: async () => {
  try {
    return await pb.collection(Collections.OrganizationMembers).getFirstListItem(
      `user = "${user!.id}" && organization = "${orgId}"`
    );
  } catch (e) {
    // Not a member — no permissions
    return null;
  }
}
```

The role derivation then treats `null` data as "no role" → all permissions `false`.

## Graceful 403 Fallback

Even with client-side guards, mutations must handle server-rejected requests. Add a shared error handler:

```ts
// In src/api/pocketbase.ts or a new src/shared/errorHandler.ts
import { notifications } from "@mantine/notifications";
import { ClientResponseError } from "pocketbase";

export function handleMutationError(error: unknown) {
  if (error instanceof ClientResponseError && error.status === 403) {
    notifications.show({
      title: "Keine Berechtigung",
      message: "Du hast keine Berechtigung für diese Aktion.",
      color: "red",
    });
    return;
  }
  // Re-throw for other handlers
  throw error;
}
```

Wire into existing mutations:

```ts
return useMutation({
  mutationFn: (id: string) => pb.collection(Collections.Boards).delete(id),
  onError: handleMutationError,
});
```

## Implementation Order

1. **Create `src/api/permissions.ts`** — the `usePermissions` hook and `useMyProjectRoles` bulk hook.
2. **Add error handler** — `handleMutationError` in a shared location.
3. **Gate org-level pages** — `OrgOverview`, `OrgSettings`.
4. **Gate project-level pages** — `ProjectOverview`, `ProjectSettings`.
5. **Gate board/card/document pages** — `Board.tsx`, `BoardSettings`, `CardModal`, `DocumentView`.
6. **Gate label controls** — wherever labels are created/edited/deleted.
7. **Wire `onError: handleMutationError`** into all existing mutations that mutate protected resources.
8. **Test** — verify that viewers see no edit controls, members see no delete/settings, and org owners see everything.

## Files to Create

| File | Purpose |
|------|---------|
| `src/api/permissions.ts` | `usePermissions` and `useMyProjectRoles` hooks |

## Files to Modify

| File | Change |
|------|--------|
| `src/api/pocketbase.ts` | Add `handleMutationError` export (or `src/shared/errorHandler.ts`) |
| `src/pages/OrgOverview.tsx` | Gate "Neues Projekt" and "Einstellungen" buttons |
| `src/pages/OrgSettings.tsx` | Gate member management, name editing |
| `src/pages/ProjectOverview.tsx` | Gate "Neues Board", "Neues Dokument", "Einstellungen" |
| `src/pages/ProjectSettings.tsx` | Gate member management, name editing |
| `src/pages/Board.tsx` | Disable drag-and-drop for viewers, gate settings |
| `src/pages/BoardSettings.tsx` | Gate edit/delete |
| `src/components/Card/CardModal.tsx` | Gate edit fields, delete button; gate comment edit/delete |
| All mutation hooks (`boards.ts`, `cards.ts`, `documents.ts`, `comments.ts`, `labels.ts`, `organizations.ts`, `projects.ts`) | Add `onError: handleMutationError` |

## Risk: Divergence from Server Rules

If the `project_members.role` enum values change or new roles are added, the client-side derivation in `usePermissions` must be updated. This risk is mitigated by:

1. The server remains the authority — a stale client check that allows a forbidden button click will still result in a 403.
2. The derivation logic is in a single file (`permissions.ts`), not scattered across components.
3. The API Rules RFC is the source of truth; the derivation table in this RFC is derived directly from it.
