---
date: 2026-06-12
type: implementation-plan
status: draft
title: "Frontend Error Handling — Error Boundaries, Query/Mutation Errors, and Auth Failures"
tags: [frontend, error-handling, react-query, pocketbase, ux]
depends_on: [2026-06-05-codebase-audit]
---
# Frontend Error Handling — Error Boundaries, Query/Mutation Errors, and Auth Failures

## Summary

The frontend currently has **zero error handling across all layers**. Every `useQuery` call checks `isLoading` but never `isError` (audit P0-2). No `useMutation` notifies the user on failure — mutations just silently stop. Auth failures (wrong password, network down, token expiry) produce no feedback. There is no `ErrorBoundary`, so a single uncaught React exception crashes the entire app to a white screen (audit P1-9).

This RFC defines a layered error-handling strategy spanning four levels:

| Layer | Mechanism | Handles |
|-------|-----------|---------|
| **Root** | `ErrorBoundary` class component | Uncaught render exceptions → fallback UI |
| **Query** | Per-component `isError` check + shared `<ErrorState>` component | Failed data fetches → inline error with retry |
| **Mutation** | Global `onError` defaults on `QueryClient` + per-mutation overrides | Failed writes → toast notification + cache rollback |
| **Auth** | Specialized `onError` in auth mutations + 401 interceptor | Wrong credentials, expired token → inline form error + redirect |
| **Offline** | `useOnlineStatus` hook + `<OfflineBanner>` component | Lost internet → persistent warning banner, auto-dismiss on reconnect |

PocketBase throws `ClientResponseError` with structured `status`, `data` fields. A shared `parseError(error)` utility extracts a human-readable (German) message from any error shape — PocketBase, network `TypeError`, or generic `Error`.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    ErrorBoundary                     │
│  Catches uncaught render exceptions from the tree.  │
│  Renders <AppCrashFallback> instead of white screen.│
├─────────────────────────────────────────────────────┤
│                   QueryClient                        │
│  defaultOptions.mutations.onError = showErrorToast  │
│  (global fallback for any mutation without its own  │
│   onError handler)                                  │
├─────────────────────────────────────────────────────┤
│               Component error states                 │
│  {query.isError && <ErrorState onRetry={...} />}    │
├─────────────────────────────────────────────────────┤
│              Auth-specific handling                  │
│  useSignIn / useSignUp: onError sets form error     │
│  401 interceptor: global redirect to login          │
├─────────────────────────────────────────────────────┤
│              Offline detection                       │
│  useOnlineStatus hook + <OfflineBanner>             │
│  Persistent banner while navigator.onLine === false │
└─────────────────────────────────────────────────────┘
```

### Design Principles

1. **Never show a white screen.** Every code path must render *something* — a fallback, an error message, a retry button.
2. **Errors must be actionable.** Error messages tell the user what happened and what they can do (retry, re-login, check connection).
3. **PocketBase errors are first-class.** `ClientResponseError` carries structured information (`status`, `data`) that should drive the UX, not just a raw stack trace.
4. **German user-facing strings.** All error messages are in German, matching the rest of the UI.
5. **Shared, not scattered.** One `parseError()` function, one `<ErrorState>` component, one global mutation error handler. Per-component code is minimal.

## Implementation Plan

### Step 1: Error Utility (`src/shared/errorUtils.ts`)

Create a single file that takes any caught error and produces a user-facing message.

```ts
// src/shared/errorUtils.ts
import { ClientResponseError } from "pocketbase";

/**
 * Extract a human-readable German error message from any error shape.
 * Handles PocketBase ClientResponseError, fetch/network errors, and
 * generic Error instances.
 */
export function parseError(error: unknown): string {
  // PocketBase structured error
  if (error instanceof ClientResponseError) {
    return parsePocketBaseError(error);
  }

  // Network/fetch errors (offline, DNS, CORS, etc.)
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return "Keine Verbindung zum Server. Bitte überprüfe deine Internetverbindung.";
  }

  // Generic Error with message
  if (error instanceof Error) {
    return error.message;
  }

  // Fallback for non-Error throws (string, object, etc.)
  return "Ein unbekannter Fehler ist aufgetreten.";
}

function parsePocketBaseError(error: ClientResponseError): string {
  const status = error.status;

  switch (status) {
    case 400:
      return error.message || "Ungültige Anfrage. Bitte überprüfe deine Eingaben.";

    case 401:
      return "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.";

    case 403:
      return "Du hast keine Berechtigung für diese Aktion.";

    case 404:
      return "Der angeforderte Eintrag wurde nicht gefunden.";

    case 429:
      return "Zu viele Anfragen. Bitte warte einen Moment.";

    case 500:
    case 502:
    case 503:
      return "Ein Serverfehler ist aufgetreten. Bitte versuche es später erneut.";

    default:
      return error.message || `Fehler ${status}: Ein unerwartetes Problem ist aufgetreten.`;
  }
}

/**
 * Check if an error is an auth-related PocketBase error (401 or
 * token-expired).
 */
export function isAuthError(error: unknown): boolean {
  return error instanceof ClientResponseError && error.status === 401;
}
```

### Step 2: Error Boundary (`src/components/App/ErrorBoundary.tsx`)

A class component wrapping the entire app tree. Catches uncaught render errors and renders a fallback instead of crashing to white.

```tsx
// src/components/App/ErrorBoundary.tsx
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button, Center, Code, Stack, Text, Title } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Center h="100vh">
          <Stack align="center" gap="md" maw={480}>
            <IconAlertTriangle size={48} stroke={1.5} color="var(--mantine-color-red-6)" />
            <Title order={3} ta="center">
              Etwas ist schiefgelaufen
            </Title>
            <Text size="sm" c="dimmed" ta="center">
              Ein unerwarteter Fehler ist aufgetreten. Bitte lade die Seite neu,
              um fortzufahren.
            </Text>
            {this.state.error && (
              <Code block style={{ maxWidth: "100%", overflow: "auto" }}>
                {this.state.error.message}
              </Code>
            )}
            <Button
              variant="default"
              onClick={() => window.location.reload()}
            >
              Seite neu laden
            </Button>
          </Stack>
        </Center>
      );
    }

    return this.props.children;
  }
}
```

**Placement in `main.tsx`**: Wrap `<App />` with `<ErrorBoundary>` — inside `QueryClientProvider` and `MantineProvider` so the fallback still renders with Mantine components and theme.

### Step 3: Query Error States — Shared `<ErrorState>` Component

Create a reusable component for rendering query errors inline (where the data would have been). Every page imports and uses it.

```tsx
// src/components/App/ErrorState.tsx
import { Alert, Button, Center, Stack, Text } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { parseError } from "../../shared/errorUtils";

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  message?: string; // override the parsed message
}

export function ErrorState({ error, onRetry, message }: ErrorStateProps) {
  const displayMessage = message ?? parseError(error);

  return (
    <Center h="100%" py="xl">
      <Stack align="center" gap="md" maw={400}>
        <IconAlertCircle size={32} stroke={1.5} color="var(--mantine-color-red-6)" />
        <Text size="sm" c="dimmed" ta="center">
          {displayMessage}
        </Text>
        {onRetry && (
          <Button variant="default" size="sm" onClick={onRetry}>
            Erneut versuchen
          </Button>
        )}
      </Stack>
    </Center>
  );
}
```

**Integration pattern** (applied to every page):

```tsx
// Before (current)
if (board.isLoading || cards.isLoading) return <Loader color="gray" />;

// After
if (board.isLoading || cards.isLoading) return <Loader color="gray" />;
if (board.isError) return <ErrorState error={board.error} onRetry={() => board.refetch()} />;
if (cards.isError) return <ErrorState error={cards.error} onRetry={() => cards.refetch()} />;
```

For pages with multiple queries, check errors in order of importance. The most critical query's error is shown (e.g., the board itself failing is worse than labels failing).

### Step 4: Global Mutation Error Handler

Set a global `onError` default on `QueryClient` so every mutation without its own `onError` gets a notification toast. Individual mutations can override this for custom behavior (e.g., auth forms setting inline errors).

```ts
// In main.tsx, add to QueryClient defaults:
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
    mutations: {
      retry: 0,
      onError: (error) => {
        const message = parseError(error);
        notifications.show({
          title: "Fehler",
          message,
          color: "red",
        });
      },
    },
  },
});
```

**Important**: Mutations that already have `onError` for cache rollback (`useUpdateCard`, `useDeleteCard`) must also add `notifications.show` or rely on the global default. Since `onError` in `useMutation` overrides the global default, those mutations need to either:

- **Option A**: Call `showErrorToast()` explicitly in their `onError` (in addition to rollback logic).
- **Option B**: Remove their `onError` and use `onSettled` for rollback instead. But `onSettled` fires after success OR error, making rollback logic trickier.

**Recommendation: Option A** — keep existing `onError` handlers for cache management and add a `notifications.show()` call inside each.

### Step 5: Auth Error Handling

Auth is the only place where errors should appear **inline in the form** rather than as a toast. The user types a wrong password and needs to see the message next to the input field.

```tsx
// Authentication.tsx — modified SignInForm
function SignInForm({ onSwitch }: { onSwitch: () => void }) {
  const [email, setEmail] = useState(import.meta.env.VITE_PB_USERNAME);
  const [password, setPassword] = useState(import.meta.env.VITE_PB_PASSWORD);
  const [error, setError] = useState<string | null>(null);

  const signIn = useSignIn();

  const handleSubmit = () => {
    setError(null);
    signIn.mutate(
      { email, password },
      {
        onError: (err) => {
          setError(parseError(err));
        },
      },
    );
  };

  return (
    <Stack gap="md">
      <Title ta="center" style={{ fontFamily: "Outfit", fontWeight: 400 }} mb="xl">
        Orbita
      </Title>

      {error && (
        <Alert color="red" variant="light" onClose={() => setError(null)} withCloseButton>
          {error}
        </Alert>
      )}

      <TextInput
        label="Email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
        error={error && !password ? " " : undefined}
      />
      <PasswordInput
        label="Password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
      />
      <Button
        variant="default"
        loading={signIn.isPending}
        onClick={handleSubmit}
        mt="lg"
      >
        Anmelden
      </Button>
      {/* ... */}
    </Stack>
  );
}
```

Same pattern for `SignUpForm`.

### Step 6: 401 Token-Expiry Handling

When PocketBase token expires, queries and mutations fail with 401. The app should redirect to the auth screen.

Two approaches:

**Approach A — PocketBase authStore `onChange` listener**: The `useAuth` hook already watches `pb.authStore.onChange`. When the store invalidates (`isValid` → `false`), `App.tsx` already switches to `<Authentication />`. This works for *token clear* events but NOT for API calls that return 401 without clearing the store.

**Approach B — Global query/mutation error inspection**: Before showing an error toast, check if it's a 401. If so, clear the auth store and let the existing auth flow handle the redirect.

```ts
// In the global mutation onError (in QueryClient defaults):
onError: (error) => {
  if (error instanceof ClientResponseError && error.status === 401) {
    pb.authStore.clear(); // triggers useAuth → isAuthenticated=false → App shows Authentication
    return; // No toast — the redirect is the feedback
  }
  notifications.show({
    title: "Fehler",
    message: parseError(error),
    color: "red",
  });
},
```

**Recommendation: Approach B** — it's simpler, requires no new infrastructure, and handles all 401s regardless of origin.

### Step 7: Offline Detection & Banner

When the browser goes offline, React Query's built-in `onlineManager` pauses all queries (no requests are made) and resumes them when connectivity returns. We subscribe to the same manager to show a persistent, non-dismissable warning banner telling the user not to make changes.

This is **not an error** — it's a proactive status indicator. The banner auto-dismisses when the connection returns.

#### `useOnlineStatus` Hook

```ts
// src/shared/useOnlineStatus.ts
import { useEffect, useState } from "react";
import { onlineManager } from "@tanstack/react-query";

/**
 * Tracks the browser's online status via TanStack Query's onlineManager.
 * Returns true when online, false when offline.
 *
 * Uses onlineManager instead of raw navigator.onLine because:
 * - onlineManager already handles the window 'online'/'offline' events
 * - It centralizes the state so React Query and our UI stay in sync
 * - It works correctly with React Query's networkMode: 'online' default
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(onlineManager.isOnline());

  useEffect(() => {
    const unsubscribe = onlineManager.subscribe(() => {
      setIsOnline(onlineManager.isOnline());
    });
    return unsubscribe;
  }, []);

  return isOnline;
}
```

#### `<OfflineBanner>` Component

A thin warning bar rendered inside `App.tsx` at the top of `AppShell.Main`. It appears when offline and disappears when back online — no user interaction needed.

```tsx
// src/components/App/OfflineBanner.tsx
import { Alert } from "@mantine/core";
import { IconWifiOff } from "@tabler/icons-react";
import { useOnlineStatus } from "../../shared/useOnlineStatus";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <Alert
      color="yellow"
      variant="filled"
      icon={<IconWifiOff size={16} />}
      title="Keine Internetverbindung"
      style={{ borderRadius: 0 }}
    >
      Du bist offline. Änderungen werden erst gespeichert, wenn die Verbindung
      wiederhergestellt ist.
    </Alert>
  );
}
```

#### Placement in `App.tsx`

The banner sits inside `AppShell.Main`, above the `<Suspense>`/`<Routes>` tree, so it's visible on every page:

```tsx
// App.tsx (excerpt)
<AppShell.Main h="100vh">
  <OfflineBanner />
  <Suspense fallback={<FallbackLoader />}>
    <Routes>
      {/* ... */}
    </Routes>
  </Suspense>
</AppShell.Main>
```

#### Why Not a Toast?

A Mantine `Notification` toast would be dismissable and auto-closed. For offline status we want:

- **Persistent** — stays until connectivity returns (not time-based)
- **Non-dismissable** — the user shouldn't be able to "X" it away, because the warning is still valid
- **Not a notification** — it's ambient status, not a transactional event

An `<Alert>` at the top of the viewport achieves all three and uses no extra library.

#### Interaction with Error Handling

When offline:

- Queries are **paused** by React Query (default `networkMode: "online"`) — no `isError` is triggered, so no error states flash.
- Mutations **fail immediately** with `TypeError: Failed to fetch` → the global `onError` shows a toast. The offline banner above the content already explains *why*.
- When the connection returns, React Query **resumes paused queries** automatically, and the banner disappears.

### Step 8: Query Retry Configuration

The current `retry: 1` in `QueryClient` defaults means a failed query is retried once. For queries that fail with 401 or 403, retrying is pointless — it will fail again. Add a `retry` function that excludes auth errors:

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        // Don't retry auth errors
        if (isAuthError(error)) return false;
        // Retry once for transient failures
        return failureCount < 1;
      },
    },
    mutations: { retry: 0 },
  },
});
```

## Query Error Checklist — Every Page

| Page | Queries | Current State | Action |
|------|---------|---------------|--------|
| `Home.tsx` | `useOrganizations()` | No `isError` check | Add `isError` + `<ErrorState>` |
| `OrgOverview.tsx` | `useOrganization()`, `useProjects()` | No `isError` check | Add error state for both |
| `OrgSettings.tsx` | `useOrganization()`, `useOrganizationMembers()` | No `isError` check | Add error state |
| `ProjectOverview.tsx` | `useProject()`, `useBoardsByProject()`, `useDocumentsByProject()` | No `isError` check | Add error state |
| `ProjectSettings.tsx` | `useProject()`, `useProjectMembers()` | No `isError` check | Add error state |
| `Board.tsx` | `useBoard()`, `useCardsByBoard()`, `useListsByBoard()`, `useUsers()`, `useLabels()` | No `isError` check | Add error state — check board first |
| `BoardSettings.tsx` | `useBoard()` (assumed) | No `isError` check | Add error state |
| `DocumentView.tsx` | `useDocument()` | No `isError` check | Add error state |
| `Calendar.tsx` | `useCards()` (or similar) | No `isError` check | Add error state |
| `CardModal.tsx` | `useCard()`, `useCommentsByCard()`, `useUsers()`, `useLabels()` | No `isError` check | Add inline error inside modal |
| `Authentication.tsx` | `useSignIn()`, `useSignUp()` | No `onError` | Add inline form error state |
| `Settings.tsx` | `useAuth()` (probably) | No error handling | Add error state |
| `Search.tsx` | (stub) | N/A | Future work |
| `Navbar.tsx` | `useOrganizations()`, `useBoards()`, `useDocuments()`, `useProjects()` | No `isError` check | Add error state or degrade gracefully |

## Mutation Error Checklist — Every Mutation Hook

All mutation hooks in `src/api/` need to handle errors. The global `QueryClient` default `onError` handles most cases, but mutations with custom `onError` must also show a notification.

| File | Mutations | Has Custom `onError`? | Action |
|------|-----------|----------------------|--------|
| `auth.ts` | `useSignIn`, `useSignUp`, `useLogout` | No | Auth mutations handled inline (form-level). `useLogout` is local-only, no API call. |
| `boards.ts` | `useCreateBoard`, `useUpdateBoard`, `useDeleteBoard` | No | Covered by global default. |
| `cards.ts` | `useCreateCard` | No | Covered by global default. |
| `cards.ts` | `useUpdateCard` | **Yes** (optimistic rollback) | Add `notifications.show({ ... })` inside existing `onError`. |
| `cards.ts` | `useDeleteCard` | **Yes** (optimistic rollback) | Add `notifications.show({ ... })` inside existing `onError`. |
| `comments.ts` | `useCreateComment`, `useUpdateComment`, `useDeleteComment` | No | Covered by global default. |
| `documents.ts` | `useCreateDocument`, `useUpdateDocument`, `useDeleteDocument` | No | Covered by global default. |
| `labels.ts` | `useCreateLabel`, `useUpdateLabel`, `useDeleteLabel` | No | Covered by global default. |
| `lists.ts` | `useCreateList`, `useUpdateList`, `useDeleteList` | No | Covered by global default. |
| `organizations.ts` | All 5 mutations | No | Covered by global default. |
| `projects.ts` | All 5 mutations | No | Covered by global default. |
| `users.ts` | `useUsers()` (query only) | N/A | Query error handling (Step 3). |

## Edge Cases

### Network Offline

When the browser is offline, `fetch` throws a `TypeError("Failed to fetch")`. React Query's default `networkMode: "online"` pauses queries when offline and resumes when back online. However, mutations will fail immediately.

- The `parseError()` utility detects `"Failed to fetch"` and returns a German message about checking the internet connection.
- React Query's built-in `onlineManager` handles query pausing → no action needed.
- The global mutation `onError` will show the "Keine Verbindung" toast for failed mutations.

### Server 500 Errors

Server errors (500, 502, 503) are transient by nature. The `retry` function in `QueryClient` already retries once. The error message tells the user to try later.

### Empty Board / Empty Project

An empty board (no cards) is NOT an error — `useCardsByBoard` returns `[]`. The query succeeds. The `isError` check must only render when `isError` is true, not when the data array is empty.

### Concurrent Query Failures

Pages like `Board.tsx` run 5 queries in parallel. If the board query succeeds but labels fail, showing a full-page error for labels is too aggressive. Strategy:

- **Critical queries** (board, cards, lists) → full-page `<ErrorState>`.
- **Non-critical queries** (users, labels) → degrade gracefully: show the board without labels/users instead of blocking the entire page.

For example, in `Board.tsx`:

```tsx
// Critical — block rendering
if (board.isError) return <ErrorState error={board.error} onRetry={() => board.refetch()} />;
if (cards.isError) return <ErrorState error={cards.error} onRetry={() => cards.refetch()} />;
if (lists.isError) return <ErrorState error={lists.error} onRetry={() => lists.refetch()} />;

// Non-critical — degrade (use empty arrays)
const userData = users.data ?? [];
const labelData = labels.data ?? [];
```

But for now, the simpler approach (block on any error) is acceptable and can be refined later.

### Stale Error After Retry

When the user clicks "Erneut versuchen", the query refetches. If it succeeds, the component re-renders with `data` and the error state disappears. If it fails again, `isError` stays `true` and the error state remains. No special handling needed — React Query's state machine handles this naturally.

## Implementation Order

1. **Create `src/shared/errorUtils.ts`** — `parseError()` and `isAuthError()` utilities.
2. **Create `src/components/App/ErrorState.tsx`** — shared error display component.
3. **Create `src/components/App/ErrorBoundary.tsx`** — root error boundary class component.
4. **Create `src/shared/useOnlineStatus.ts`** — hook subscribing to React Query's `onlineManager`.
5. **Create `src/components/App/OfflineBanner.tsx`** — persistent offline warning banner.
6. **Wire `ErrorBoundary` and `OfflineBanner` in `main.tsx` / `App.tsx`** — wrap `<App />` with `ErrorBoundary`; render `<OfflineBanner />` inside `AppShell.Main`.
7. **Add global mutation `onError` to `QueryClient` in `main.tsx`** — with 401 detection and toast notification.
8. **Update `retry` function in `QueryClient`** — don't retry 401/403.
9. **Add `isError` checks to all pages** — `Home`, `OrgOverview`, `OrgSettings`, `ProjectOverview`, `ProjectSettings`, `Board`, `BoardSettings`, `DocumentView`, `Calendar`, `CardModal`, `Settings`.
10. **Add inline error state to `Authentication.tsx`** — for sign-in and sign-up forms.
11. **Add notification to `useUpdateCard` and `useDeleteCard` `onError`** — these are the only mutations with custom `onError` handlers.
12. **Test** — trigger each error category (network offline, 401, 403, 404, 500, JS crash) and verify the correct fallback renders.

## Files to Create

| File | Purpose |
|------|---------|
| `src/shared/errorUtils.ts` | `parseError()`, `isAuthError()` — PocketBase-aware error message extraction |
| `src/components/App/ErrorState.tsx` | Reusable inline error display with retry button |
| `src/components/App/ErrorBoundary.tsx` | Class component catching uncaught render errors |
| `src/shared/useOnlineStatus.ts` | Hook subscribing to React Query's `onlineManager` |
| `src/components/App/OfflineBanner.tsx` | Persistent yellow alert shown when browser is offline |

## Files to Modify

| File | Change |
|------|--------|
| `src/main.tsx` | Add `ErrorBoundary` wrapper, update `QueryClient` defaults (global mutation `onError`, smart `retry`) |
| `src/App.tsx` | Render `<OfflineBanner />` inside `AppShell.Main` above `<Suspense>` |
| `src/pages/Home.tsx` | Add `isError` + `<ErrorState>` for `useOrganizations` |
| `src/pages/OrgOverview.tsx` | Add `isError` + `<ErrorState>` for `useOrganization`, `useProjects` |
| `src/pages/OrgSettings.tsx` | Add `isError` + `<ErrorState>` for queries |
| `src/pages/ProjectOverview.tsx` | Add `isError` + `<ErrorState>` for queries |
| `src/pages/ProjectSettings.tsx` | Add `isError` + `<ErrorState>` for queries |
| `src/pages/Board.tsx` | Add `isError` + `<ErrorState>` for critical queries |
| `src/pages/BoardSettings.tsx` | Add `isError` + `<ErrorState>` |
| `src/pages/DocumentView.tsx` | Add `isError` + `<ErrorState>` for `useDocument` |
| `src/pages/Calendar.tsx` | Add `isError` + `<ErrorState>` |
| `src/pages/Authentication.tsx` | Add inline `error` state + `onError` handler for sign-in/sign-up |
| `src/components/Card/CardModal.tsx` | Add `isError` + inline error for queries |
| `src/api/cards.ts` | Add `notifications.show()` inside `onError` of `useUpdateCard` and `useDeleteCard` |

## Risk: Over-Notifying

With the global mutation `onError`, every mutation failure triggers a toast. For rapid-fire mutations (e.g., card label changes via `MultiSelect`), this could produce a flood of toasts. Mitigation:

- Mantine `Notifications` component supports a `limit` prop. Set `limit={3}` so at most 3 toasts are visible.
- In the future, optimistic mutations that fail can be handled silently (cache rollback) while still showing an error indicator on the affected entity (e.g., red border on the label picker).

For now, the toast approach is the right starting point — it makes errors visible and actionable.

## Risk: ErrorBoundary Placement

`ErrorBoundary` must be inside MantineProvider and QueryClientProvider so the fallback UI can use Mantine components. But it must wrap the app routes so it catches routing and rendering errors. The placement:

```tsx
// main.tsx (relevant excerpt)
<QueryClientProvider client={queryClient}>
  <MantineProvider theme={theme} defaultColorScheme="dark">
    <Notifications limit={3} />
    <BrowserRouter>
      <ModalsProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </ModalsProvider>
    </BrowserRouter>
  </MantineProvider>
</QueryClientProvider>
```

This is correct — `ErrorBoundary` wraps `App` but sits inside all providers.
