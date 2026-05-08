# Orbita Codebase Audit Report

> Merged from `todo.md` (pre-existing code smells) + full codebase audit (2026-05-06).
> Tasks are ordered by priority: **P0** (critical/security), **P1** (high-impact), **P2** (medium), **P3** (nice-to-have).

---

## P0 — Critical (Security, Data Loss, Type Safety)

### P0-1: XSS via `dangerouslySetInnerHTML`
- **File**: `src/components/Card/CardModal.tsx:128`
- `dangerouslySetInnerHTML={{ __html: comment.content }}` renders un-sanitized HTML from user comments. Malicious `<script>` or event-handler injection possible.
- **Action**: Install `dompurify` + `@types/dompurify`, wrap with `DOMPurify.sanitize(comment.content)` before rendering. Alternatively render comments through a read-only TipTap editor.

### P0-2: Dev credentials exposed in production
- **File**: `src/pages/Authentication.tsx:18-19`
- `useState(import.meta.env.VITE_PB_USERNAME)` / `VITE_PB_PASSWORD` pre-fills sign-in fields unconditionally. Vite embeds these at build time so they ship to production.
- **Action**: Guard pre-fill with `import.meta.env.DEV`:
  ```ts
  const [email, setEmail] = useState(import.meta.env.DEV ? import.meta.env.VITE_PB_USERNAME : "");
  const [password, setPassword] = useState(import.meta.env.DEV ? import.meta.env.VITE_PB_PASSWORD : "");
  ```

### P0-3: No error states on any query
- **Files**: Every page using `useQuery` (Board, Home, OrgOverview, ProjectOverview, DocumentView, etc.)
- All components check `isLoading` but never `isError`. A failed API call silently breaks the UI with no user feedback.
- **Action**: In **every** component with queries, add:
  ```tsx
  if (query.isError) return <ErrorState message="..." onRetry={() => query.refetch()} />
  ```
  Also add error handling to `CardModal.tsx` for failed card/comments queries (from original todo).

### P0-4: `@ts-ignore` and `as any` casts
| File | Line | Issue | Fix |
|------|------|-------|-----|
| `pages/Board.tsx` | 47 | `(card as any).list` | `CardsRecord` already has `list: RecordIdString` — check why the Response type loses it; fix the expand/select |
| `pages/OrgSettings.tsx` | 89 | `(member.expand as any)?.user?.name` | Declare proper expand type (`type OrgMemberExpand = { user: UsersResponse }`) on the query |
| `pages/ProjectSettings.tsx` | 87 | Same as above | Same fix |
| `pages/Settings.tsx` | 92 | `// @ts-ignore` on `SegmentedControl` `onChange` | Cast: `(value: string) => setColorScheme(value as "light" \| "dark" \| "auto")` |

### P0-5: `pb.authStore.record` used directly instead of `useAuth()` hook
- **Files**: `Navbar.tsx:347-357`, `Home.tsx:44`, `Settings.tsx:38-44`, `UserAvatar.tsx:15-16`
- Direct access to `pb.authStore.record` bypasses React state management. UI won't re-render on token expiration, logout, or user data changes.
- **Action**: Replace all direct `pb.authStore` accesses with `const { user } = useAuth()` from `src/api/auth.ts`.

---

## P1 — High-Impact (Architecture, Performance, Correctness)

### P1-1: Navbar over-fetches all boards & documents
- **File**: `Navbar.tsx:115-116`
- `useBoards()` and `useDocuments()` fetch every record in the database on every render, even when no org is selected. At scale this is a performance killer.
- **Action**: Add `enabled: !!selectedOrgId` guards and switch to `useBoardsByProject`/`useDocumentsByProject` keyed to the selected org. Only fetch data the user needs.

### P1-2: `useUsers()` fetches all users globally
- **Files**: `CardModal.tsx:39`, `Board.tsx:27`, `Card.tsx` (via props), `TableView.tsx` (via props)
- Every card view loads the entire user collection. Should be scoped to org or project members.
- **Action**: Create `useUsersByOrganization(orgId)` (filter by `organization_members`) or `useUsersByProject(projectId)`. Add `enabled` guards so it doesn't fire without a selection.

### P1-3: Duplicated `getInitials` function
- **Files**: `src/shared/nameUtils.ts:1-8` and `src/components/UI/UserAvatar.tsx:5-12`
- Two identical implementations. The `UserAvatar` one is dead code (component never imported).
- **Action**: Delete the duplicate in `UserAvatar.tsx`; import from `src/shared/nameUtils.ts` instead.

### P1-4: Day.js global locale setup duplicated
- **Files**: `DocumentView.tsx:17-20`, `ProjectOverview.tsx:32-36`
- `dayjs.locale("de")` mutates the global singleton from two different lazy-loaded pages. Whichever chunk loads first "wins" — non-deterministic behavior.
- **Action**: Move `import "dayjs/locale/de"; dayjs.extend(relativeTime); dayjs.locale("de")` to `src/main.tsx`, once, before the app renders.

### P1-5: `QueryClient` has no default options
- **File**: `src/main.tsx:32`
- `new QueryClient()` with zero config means `staleTime: 0` (refetches on every mount), `retry: 3` with no backoff, no global error handler.
- **Action**: Configure with sensible defaults:
  ```ts
  new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
      mutations: { retry: 0 },
    },
  })
  ```

### P1-6: `boards.ts` — unsafe `id!` assertion
- **File**: `boards.ts:52` (and all other entity files have the same pattern)
- `queryFn: () => pb.collection(...).getOne<BoardsResponse>(id!)` — non-null assertion on potentially undefined `id`. If the `enabled` guard fails, this throws at runtime.
- **Action**: Replace with `id as string` or add a runtime guard: `if (!id) throw new Error("id required")`.

### P1-7: Obsolete `boardId !== "settings"` guard
- **File**: `cards.ts:37`
- `enabled: !!boardId && boardId !== "settings"` — workaround for `/boards/settings` matching the `:boardId` route param. With correct route ordering (`/boards/:boardId/settings` defined) this may be obsolete.
- **Action**: Verify the route definitions prevent this collision; remove the guard if so.

### P1-8: `eslint.config.js` missing `react` plugin rules
- Missing core rules: `react/jsx-key`, `react/no-danger`, `react/self-closing-comp`, `react/jsx-no-target-blank`.
- **Action**: Add `eslint-plugin-react` as a dev dependency and extend its recommended flat config (or add key rules manually).

### P1-9: No error boundary at app root
- Any uncaught React error crashes the entire app to a white screen (no fallback UI).
- **Action**: Create `src/components/App/ErrorBoundary.tsx` (class component with `componentDidCatch` + `getDerivedStateFromError`) and wrap `<App />` in `main.tsx`.

### P1-10: `cards.ts` — `useCards` has no `staleTime`/`gcTime`, `useCardsByBoard` sorts by `position` but `useCards` doesn't sort
- `useCards` (`cards.ts:26-29`) sorts by `position`, but `useCardsByBoard` (`cards.ts:38-41`) has no sort at all. Cards in the board view won't be in position order.
- **Action**: Add `sort: "position"` to `useCardsByBoard`.

---

## P2 — Medium (Code Quality, Duplication, UI Polish)

### P2-1: Duplicated "not implemented" notification
- **Files**: `CardModal.tsx:60-66`, `CardModal.tsx:70-75`, `BoardSettings.tsx:46-52`
- Three identical `notifications.show({ title: "Noch nicht implementiert", ... })` calls.
- **Action**: Extract `export function showNotImplemented() { notifications.show({ ... }) }` to `src/shared/notifications.ts`. Replace all three call sites. Also use it for `CardModal`'s `confirmDelete.onConfirm`.

### P2-2: Duplicated `confirmDelete` pattern
- **Files**: `CardModal.tsx:44-67`, `BoardSettings.tsx:30-53`
- Nearly identical `modals.openConfirmModal` blocks (same structure, same "not implemented" on confirm).
- **Action**: Extract `export function openDeleteConfirm({ title, itemName, onConfirm })` to `src/shared/confirmDialogs.ts`.

### P2-3: Duplicated `PRIORITY_COLOR` mapping
- **Files**: `Card.tsx:31-37`, `Calendar.tsx:25-31`
- Identical constant defined in two places.
- **Action**: Move to `src/shared/priorityUtils.ts`; import from both components.

### P2-4: Duplicated org sort logic (personal org first)
- **Files**: `Home.tsx:35-39`, `Navbar.tsx:139-143`
- Same `sort((a, b) => { if (a.is_personal...) })` in two places.
- **Action**: Extract `export function sortOrganizations<T extends { is_personal?: boolean }>(orgs: T[]): T[]`.

### P2-5: Duplicated `descriptionSpan`/`inputSpan`/`offset` layout constants
- **Files**: `OrgSettings.tsx:26-28`, `ProjectSettings.tsx:26-28`, `BoardSettings.tsx:26-28`
- Magic number block repeated in three settings pages.
- **Action**: Extract to `src/shared/settingsLayout.ts`:
  ```ts
  export const SETTINGS_GRID = { description: 4, input: 6, offset: 1 }
  ```

### P2-6: Duplicated inline-create pattern (TextInput + Check/X)
- **Files**: `OrgOverview.tsx`, `ProjectOverview.tsx`, `List.tsx`, `ListView.tsx`
- All implement identical create UX with separate local state, Enter/Escape handlers, refs, focus effects.
- **Action**: Extract `<InlineCreate placeholder="..." onSubmit={...} />` component that encapsulates the whole pattern.

### P2-7: Duplicated Date formatting in CardModal
- **File**: `CardModal.tsx:132-138`
- `new Date(activeCard.updated).toLocaleString("de")` and `new Date(activeCard.created).toLocaleString("de")` are identical calls on different fields.
- **Action**: Extract `function formatDate(d: string): string` to `src/shared/dateUtils.ts`.

### P2-8: Duplicated `labels.find()` / `users.find()` lookups in Card
- **File**: `Card.tsx:66-86` and `Card.tsx:108-133`
- `labels.find()` called twice per label (once for `color`, once for `title`). `users.find()` called twice per member (once for tooltip label, once for avatar name).
- **Action**: Find once, destructure both properties:
  ```ts
  const label = labels.find((l) => l.id === id);
  color={label?.color} >{label?.name ?? "Unbekannt"}
  ```

### P2-9: CardModal repeated mutation calls
- **File**: `CardModal.tsx:143-214`
- Every `onChange` repeats `updateCardMutation.mutate({ id: activeCard.id, data: { ... } })`.
- **Action**: Extract `const updateCard = (data) => updateCardMutation.mutate({ id: activeCard.id, data })` and use throughout.

### P2-10: Unused dead components
| File | Status |
|------|--------|
| `components/UI/UserAvatar.tsx` | Exported but never imported |
| `components/UI/Search.tsx` | Exported but never imported |
| `components/UI/FilterMenu.tsx` | Exported but never imported + hardcoded placeholders |

- **Action**: Delete them or wire them in.

### P2-11: Magic pixel offsets in Navbar
- **File**: `Navbar.tsx:136,148,158,167` (reduced to `pt={19}`, `pt={18}`, `pt={5}` in the existing todo)
- These compensate for a layout issue — not a proper fix.
- **Action**: Debug the root layout cause; use Mantine spacing tokens (`p="xs"`, `p="md"`) instead.

### P2-12: Navbar: `rightSection={<></>}` and `!= 0`
- **File**: `Navbar.tsx:250-253`
- `rightSection={<></>}` should be `null`. `!= 0` should be `> 0`.
- **Action**: Fix both.

### P2-13: Inconsistent language in placeholders
| File | Current | Fix |
|------|---------|-----|
| `List.tsx:90` | `"Card title"` | `"Kartentitel"` |
| `ListView.tsx:83` | `"List title"` | `"Listentitel"` |
| `ListView.tsx:120` | `"Add list"` | `"Liste hinzufügen"` |
| `List.tsx:120` | `"Add card"` (title attr) | `"Karte hinzufügen"` |

### P2-14: Wrong locale casing
| File | Line | Current | Fix |
|------|------|---------|-----|
| `Card.tsx` | 99 | `"DE-de"` | `"de-DE"` |
| `TableView.tsx` | 97 | `"DE-de"` | `"de-DE"` |
| `Calendar.tsx` | 103 | `"DE-de"` | `"de-DE"` |

### P2-15: `Board.tsx:82` — redundant `!!cardId`
- `{cardId && <CardModal open={!!cardId} ...>}` — inside the `cardId &&` guard, `!!cardId` is always `true`. Simplify to `open`.
- **Action**: Remove the `!!`.

### P2-16: Raw `<div>` with inline styles in List.tsx
- **File**: `List.tsx:38-46`
- `<div className="Column">` with inline `style` instead of Mantine layout primitives.
- **Action**: Replace with `<Stack>`, `<Box>`, or other Mantine components.

### P2-17: Hardcoded background color in List.tsx
- **File**: `List.tsx:56`
- `backgroundColor: "#00000009"` — theme-insensitive; breaks dark mode.
- **Action**: Replace with `bg="gray.0"` (light) or a CSS variable `var(--mantine-color-default-hover)`.

### P2-18: Commented-out code / debug leftovers
| File | Line | Content |
|------|------|---------|
| `CardModal.tsx` | 57 | `onCancel: () => console.log("Cancel")` |
| `Card.tsx` | 29 | `// data-dragging={isDragging}` |
| `Board.tsx` | 28 | `// Default view` |
| `Calendar.tsx` | 67 | `console.log(scheduleEvents)` |
| `DocumentEditor.tsx` | 32 | `// UndoRedo // TODO` |
| `DocumentEditor.tsx` | 96-99 | Commented-out Undo/Redo controls |
| `TextEditor.tsx` | 45 | Commented-out `style` prop |
| `BoardSettings.tsx` | 136 | `// value={value}` |

- **Action**: Delete all.

### P2-19: `index.html` lang attribute mismatch
- **File**: `index.html:2` — `lang="en"` but the entire app UI is in German.
- **Action**: Change to `lang="de"`.

### P2-20: `<FallbackLoader />` not centered
- **File**: `App.tsx:25` — `<Loader color="gray" />` renders top-left during lazy-loading.
- **Action**: Wrap in `<Center h="100%">`.

### P2-21: Missing proper 404 page
- **File**: `App.tsx:68` — `<p>Seite nicht gefunden</p>` is a raw `<p>` tag outside Mantine.
- **Action**: Create `src/pages/NotFound.tsx` with proper Mantine layout and the Outfit title font.

### P2-22: No loading skeletons
- Everywhere uses bare `<Loader color="gray" />` with no skeleton placeholders.
- **Action**: Add Mantine `<Skeleton>` components for cards, nav items, document content, lists. Prioritize Board page, Home page, ProjectOverview, and DocumentView.

---

## P3 — Lower Priority (Feature Completeness, Testing, i18n)

### P3-1: Search is non-functional
- **Files**: `pages/Search.tsx`, `UI/Search.tsx`
- Both are UI stubs with no actual search logic. The page has a title+text input; the component has a bare input — neither queries anything.
- **Action**: Implement search (query PocketBase across cards, documents, boards) or remove the route/component until ready. If keeping, delete `UI/Search.tsx` (dead) and build the page.

### P3-2: FilterMenu is a static placeholder
- **File**: `FilterMenu.tsx` — checkboxes don't persist state; component is never imported or wired to any list.
- **Action**: Implement filtering logic or delete the component.

### P3-3: Board settings form is non-functional
- **File**: `BoardSettings.tsx`
- Inputs don't read/write board state. Members use hardcoded `["Max", "Erika", "Jane", "John"]`. No save button. ColorPicker `onChange` only logs to console. Name `TextInput` has no mutation.
- **Action**: Wire up `useBoard()` and `useUpdateBoard()` to the form. Replace hardcoded members with actual member data.

### P3-4: Language selector is non-functional
- **File**: `Settings.tsx:97-106`
- Select is hardcoded to `"de"` with no `onChange` handler.
- **Action**: Either implement proper i18n (react-i18next or similar — large effort) or remove the selector until ready. As an interim step, define a central `src/i18n/strings.ts` file with all German strings used across the app.

### P3-5: Zero tests
- No `*.test.ts`, `*.test.tsx`, `*.spec.ts`, or `*.spec.tsx` files anywhere.
- **Action**: Start with:
  1. Unit tests for `getInitials()`, `getGreeting()`, priority utilities (`src/shared/*.ts`)
  2. Integration tests for query hooks (mock `pb`)
  3. Smoke tests for the Authentication page

### P3-6: Remove unused `index` prop
- **Files**: `List.tsx:20`, `Card.tsx:23`
- `index` prop is passed but never read (except passed through from one component to another where it's also not used).
- **Action**: Remove from both interfaces and call sites.

### P3-7: `verbatimModuleSyntax` compatibility with react-scan
- **File**: `main.tsx:21-26`
- The commented-out `scan()` import, if re-enabled, would conflict with `verbatimModuleSyntax: true`.
- **Action**: If you want react-scan, use dynamic import: `if (import.meta.env.DEV) import("react-scan").then(m => m.scan({...}))`.

### P3-8: Centralize all UI strings
- All strings are hardcoded in German across components. Before adding language support, extract all user-facing strings to a single dictionary.
- **Action**: Create `src/i18n/de.ts` with all strings as a flat object; import from there. This makes future i18n trivial.

---

## Summary Table

| Priority | Count | Focus |
|----------|-------|-------|
| P0 | 5 | Security, type safety, error handling |
| P1 | 10 | Architecture, performance, config |
| P2 | 22 | Duplication, dead code, UI polish |
| P3 | 8 | Feature stubs, testing, i18n |
| **Total** | **45** | |

### Suggested Work Order

1. **P0** — Start here. These are the items that can cause real user harm or data issues.
2. **P1** — Architecture and performance fixes that prevent future scaling problems.
3. **P2** — Code quality. Do a few per day; the duplication fixes pair well (multiple identical patterns to extract).
4. **P3** — Feature completion and testing. These can be spread across sprints.
