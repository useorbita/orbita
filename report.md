# Orbita Codebase Audit Report (Updated)

> Re-audited 2026-06-05 against current `main`. Original report from 2026-05-06.
> Issues are ordered by priority: **P0** (critical/security), **P1** (high-impact), **P2** (medium), **P3** (nice-to-have).
>
> Each issue is scored on **Difficulty** (D: 1–5) and **Impact** (I: 1–5).
> - **Difficulty**: 1 = trivial one-liner, 2 = localized fix, 3 = touches multiple files, 4 = significant refactor, 5 = architectural change
> - **Impact**: 1 = cosmetic/cleanup, 2 = code quality, 3 = UX/perf/type safety, 4 = major UX gap or systemic risk, 5 = security/critical

---

## P0 — Critical (Security, Data Loss, Type Safety)

### P0-1: XSS via `dangerouslySetInnerHTML`
- **File**: `src/components/Card/CardModal.tsx:128`
- **D: 2 | I: 5**
- `dangerouslySetInnerHTML={{ __html: comment.content }}` renders un-sanitized HTML from user comments. Malicious `<script>` or event-handler injection possible.
- **Status**: Still present.
- **Action**: Install `dompurify` + `@types/dompurify`, wrap with `DOMPurify.sanitize(comment.content)`, or render comments through a read-only TipTap editor.

### P0-2: No error states on any query
- **Files**: Every page using `useQuery` (Board, Home, OrgOverview, OrgSettings, ProjectOverview, ProjectSettings, DocumentView, Calendar, CardModal)
- **D: 4 | I: 4**
- All components check `isLoading` but never `isError`. A failed API call silently breaks the UI with no user feedback.
- **Status**: Still present across the entire codebase.
- **Action**: In every component with queries, add:
  ```tsx
  if (query.isError) return <ErrorState message="..." onRetry={() => query.refetch()} />
  ```
  Also add error handling to `CardModal.tsx` for failed card/comments queries.

### ~~P0-3: `as any` casts / type unsafety~~
- **Fixed.** All `as any` casts removed from OrgSettings and ProjectSettings. `scheduleEvents: any[]` in Calendar typed properly. The `event as any` in Board.tsx is intentional (dnd-kit generics) and acceptable.

### P0-4: `pb.authStore.record` used directly instead of `useAuth()` hook
- **Files**: `Navbar.tsx:347-352`, `Home.tsx:44`, `Settings.tsx:39,55-56,73-74`, `UserAvatar.tsx:15-16`
- **D: 3 | I: 3**
- Direct access to `pb.authStore.record` bypasses React state management. UI won't re-render on token expiration, logout, or user data changes.
- **Status**: Still present in all listed files.
- **Note**: `App.tsx` correctly uses `useAuth()` for `isAuthenticated`, but `user` from the hook is not passed down or consumed by the components that need it.
- **Action**: Replace all direct `pb.authStore` accesses with `const { user } = useAuth()` from `src/api/auth.ts`.

---

## P1 — High-Impact (Architecture, Performance, Correctness)

### P1-1: Navbar over-fetches all boards & documents
- **File**: `Navbar.tsx:115-116`
- **D: 3 | I: 4**
- `useBoards()` and `useDocuments()` fetch every record in the database on every render, even when no org is selected. At scale this is a performance killer.
- **Status**: Still present.
- **Action**: Add `enabled: !!selectedOrgId` guards and switch to `useBoardsByProject`/`useDocumentsByProject` keyed to the selected org.

### P1-2: `useUsers()` fetches all users globally
- **Files**: `CardModal.tsx:40`, `Board.tsx:212`, `Card.tsx` (via props), `TableView.tsx` (via props)
- **D: 3 | I: 3**
- Every card view loads the entire user collection. Should be scoped to org or project members.
- **Status**: Still present.
- **Action**: Create `useUsersByOrganization(orgId)` (filter by `organization_members`) or `useUsersByProject(projectId)`. Add `enabled` guards.

### ~~P1-3: Duplicated `getInitials` function~~
- **Fixed.** `UserAvatar.tsx` (which contained the duplicate) has been deleted as dead code.

### ~~P1-4: Day.js global locale setup still duplicated in `ProjectOverview.tsx`~~
- **Fixed.** Removed the duplicate dayjs setup from `ProjectOverview.tsx`. Only `main.tsx` sets it globally now.

### ~~P1-5: `QueryClient` has no default options~~
- **Fixed.** Added `staleTime: 30_000`, `retry: 1`, `refetchOnWindowFocus: false` for queries and `retry: 0` for mutations.

### ~~P1-6: `boards.ts` — unsafe `id!` assertion~~
- **Fixed.** Replaced `id!` with `id as string` in all four entity files: `boards.ts`, `cards.ts`, `users.ts`, `comments.ts`.

### ~~P1-7: Obsolete `boardId !== "settings"` guard~~
- **Fixed.** Removed the guard. Route ordering in `App.tsx` already prevents `/boards/settings` from matching `:boardId`.

### P1-8: `eslint.config.js` missing `react` plugin rules
- **D: 2 | I: 3**
- Missing core rules: `react/jsx-key`, `react/no-danger`, `react/self-closing-comp`, `react/jsx-no-target-blank`.
- **Status**: Still missing. The config only has `react-hooks` and `react-refresh` plugins.
- **Action**: Add `eslint-plugin-react` as a dev dependency and extend its recommended flat config.

### P1-9: No error boundary at app root
- **D: 2 | I: 4**
- Any uncaught React error crashes the entire app to a white screen (no fallback UI).
- **Status**: Still missing.
- **Action**: Create `src/components/App/ErrorBoundary.tsx` (class component with `componentDidCatch` + `getDerivedStateFromError`) and wrap `<App />` in `main.tsx`.

### ~~P1-10: `cards.ts` — `useCardsByBoard` missing sort~~
- **Fixed.** Both `useCards` (line 73) and `useCardsByBoard` (line 85) now use `sort: "orderKey"`.

---

## P2 — Medium (Code Quality, Duplication, UI Polish)

### ~~P2-1: Duplicated "not implemented" notification~~
- **Fixed.** Extracted `showNotImplemented()` to `src/shared/notifications.ts`. Used in CardModal, Settings, and BoardSettings.

### P2-2: Duplicated `confirmDelete` pattern
- **Files**: `CardModal.tsx:45-68`, `BoardSettings.tsx:30-53`, `Settings.tsx:83-110`
- **D: 3 | I: 2**
- Nearly identical `modals.openConfirmModal` blocks with varying content.
- **Status**: Still present.
- **Action**: Extract `export function openDeleteConfirm({ title, itemName, onConfirm })` to `src/shared/confirmDialogs.ts`.

### ~~P2-3: Duplicated `PRIORITY_COLOR` mapping~~
- **Fixed.** Moved to `src/shared/priorityUtils.ts`. Imported by both `Card.tsx` and `Calendar.tsx`.

### ~~P2-4: Duplicated org sort logic~~
- **Fixed.** Extracted `sortOrganizations()` to `src/shared/organizationUtils.ts`. Used in `Home.tsx` and `Navbar.tsx`.

### P2-5: Duplicated layout constants in settings pages
- **Files**: `OrgSettings.tsx:26-28`, `ProjectSettings.tsx:26-28`, `BoardSettings.tsx:26-28`
- **D: 2 | I: 2**
- Magic number block (`descriptionSpan=4, inputSpan=6, offset=1`) repeated in three pages.
- **Note**: `Settings.tsx` uses the shared `SettingsRow` component (`descriptionSpan=4, inputSpan=8, offset=0`) — but the three settings pages don't.
- **Status**: Still present.
- **Action**: Either use the existing `SettingsRow` component in all settings pages, or extract a `SETTINGS_GRID` constant.

### P2-6: Duplicated inline-create pattern
- **Files**: `OrgOverview.tsx:120-170`, `ProjectOverview.tsx:151-201`, `List.tsx:130-172`, `ListView.tsx:85-127`
- **D: 4 | I: 3**
- All implement similar create UX (TextInput + Check/X) with separate local state, Enter/Escape handlers, refs, focus effects.
- **Status**: Still present.
- **Action**: Extract `<InlineCreate placeholder="..." onSubmit={...} />` component.

### ~~P2-7: Duplicated Date formatting in CardModal~~
- **Fixed.** Extracted `formatDateTime()` to `src/shared/dateUtils.ts`.

### ~~P2-8: Duplicated `.find()` lookups in `TableView.tsx`~~
- **Fixed.** Added `useMemo` lookup maps to `TableView.tsx`, matching the pattern already used in `Card.tsx`.

### ~~P2-9: CardModal repeated mutation calls~~
- **Fixed.** Extracted `updateCard` helper in CardModal, replacing all inline `updateCardMutation.mutate()` calls.

### ~~P2-10: Unused dead components~~
- **Fixed.** Deleted `UserAvatar.tsx`, `UI/Search.tsx`, and `FilterMenu.tsx`. None were imported anywhere.

### P2-11: Remaining magic number offsets
- **File**: `Navbar.tsx:205` — `mt={20} mb={12}` and `h={41}` on NavLinks in collapsed mode.
- **D: 1 | I: 1**
- **Status**: **Mostly fixed** — most old magic offsets now use Mantine spacing tokens (`pt="lg"`, `pt="md"`, `p="xs"`). A few remain.
- **Action**: Replace remaining `mt={20}`, `mb={12}`, `h={41}` with Mantine spacing tokens or constants.

### ~~P2-12: Navbar `rightSection={<></>}` and `!= 0`~~
- **Fixed.** The Navbar has been significantly refactored; these patterns no longer exist.

### ~~P2-13: Inconsistent language in placeholders~~
- **Fixed.** All four placeholders translated to German.

### ~~P2-14: Wrong locale casing in Calendar~~
- **Fixed.** Changed `"DE-de"` to `"de-DE"` in Calendar.tsx.

### ~~P2-15: `Board.tsx:259` — redundant `!!cardId`~~
- **Fixed.** Changed `open={!!cardId}` to `open={cardId}`.

### P2-16: Raw `<div>` with inline styles in `List.tsx`
- **File**: `List.tsx:84-93`
- **D: 2 | I: 2**
- `<div className="Column">` with inline `style` instead of Mantine layout primitives.
- **Status**: Still present.

### ~~P2-17: Hardcoded background color in `List.tsx`~~
- **Fixed.** Replaced `"#00000009"` with `var(--mantine-color-dark-0)`.

### ~~P2-18: Commented-out code / debug leftovers~~
- **Fixed.** Removed `console.log` from Calendar.tsx, cleaned up commented code in CardModal, DocumentEditor, TextEditor, BoardSettings, and ProjectOverview.

### ~~P2-19: `index.html` lang attribute mismatch~~
- **Fixed.** Changed `lang="en"` to `lang="de"`.

### ~~P2-20: `<FallbackLoader />` not centered~~
- **Fixed.** Wrapped in `<Center h="100%">` in `App.tsx`.

### ~~P2-21: Missing proper 404 page~~
- **Fixed.** Created `src/pages/NotFound.tsx` with proper Mantine layout. Wired in `App.tsx`.

### P2-22: No loading skeletons
- Everywhere uses bare `<Loader color="gray" />` with no skeleton placeholders.
- **D: 3 | I: 2**

---

## P3 — Lower Priority (Feature Completeness, Testing, i18n)

### P3-1: Search is non-functional
- **Files**: `pages/Search.tsx`, `UI/Search.tsx`
- **D: 4 | I: 3**
- Both are UI stubs. `pages/Search.tsx` has a title + TextInput with no `onChange`/`onSubmit`. `UI/Search.tsx` is a dead component (never imported).
- **Status**: Still present.
- **Action**: Implement search or remove the route until ready. Delete `UI/Search.tsx` (dead code).

### P3-2: FilterMenu is a static placeholder
- **File**: `FilterMenu.tsx` — checkboxes don't persist state; component is never imported or wired to any list.
- **D: 3 | I: 2**
- **Status**: Still present.
- **Action**: Implement filtering logic or delete the component.

### P3-3: Board settings form is non-functional
- **File**: `BoardSettings.tsx`
- **D: 3 | I: 3**
- Inputs don't read/write board state. Members use hardcoded `["Max", "Erika", "Jane", "John"]`. No save button. ColorPicker `onChange` only logs to console. Name `TextInput` has no mutation.
- **Status**: Still present.
- **Action**: Wire up `useBoard()` and `useUpdateBoard()` to the form. Replace hardcoded members with actual member data.

### P3-4: Language selector is non-functional
- **File**: `Settings.tsx:383-392`
- **D: 4 | I: 2**
- Select is hardcoded to `"de"` with no i18n integration.
- **Status**: Still present.
- **Action**: Either implement proper i18n or remove the selector. As an interim step, define a central `src/i18n/de.ts` dictionary.

### P3-5: Zero tests
- **D: 4 | I: 4**
- No `*.test.ts`, `*.test.tsx`, `*.spec.ts`, or `*.spec.tsx` files anywhere in the project.
- **Status**: Still present.
- **Action**: Start with unit tests for `getInitials()`, `getGreeting()`, priority utilities. Then integration tests for query hooks.

### ~~P3-6: Remove unused `index` prop~~
- **Fixed.** `Card.tsx` now consumes `index` via `useSortable({ id: card.id, index, ... })` (line 54).

### ~~P3-7: `verbatimModuleSyntax` compatibility with react-scan~~
- **Fixed.** Updated the commented-out import to use dynamic `import()` syntax.

### P3-8: Centralize all UI strings
- **D: 3 | I: 3**
- All strings are hardcoded in German across components. Before adding language support, extract all user-facing strings to a single dictionary.
- **Status**: Still relevant.

---

## Summary Table

| Priority | Count | Focus |
|----------|-------|-------|
| P0 | 3 | Security, type safety, error handling |
| P1 | 5 | Architecture, performance, config |
| P2 | 8 | Duplication, dead code, UI polish |
| P3 | 7 | Feature stubs, testing, i18n |
| **Total** | **23** | |

## Quick Wins (all completed ✅)

~~These give outsized impact for minimal effort — good candidates for a single focused session:~~

| Issue | Description | Status |
|-------|-------------|--------|
| P1-5 | `QueryClient` default options | ✅ Fixed |
| P0-3 | Remove `as any` casts | ✅ Fixed |
| P2-17 | Hardcoded bg color → theme token | ✅ Fixed |

## What was fixed in this pass (2026-06-05)

| Issue | Description |
|-------|-------------|
| P0-3 | All `as any` casts removed; `scheduleEvents` typed |
| P1-3 | Duplicated `getInitials` eliminated (UserAvatar.tsx deleted) |
| P1-4 | Day.js locale deduplicated (only `main.tsx` sets it) |
| P1-5 | `QueryClient` configured with sensible defaults |
| P1-6 | `id!` → `id as string` in all 4 entity API files |
| P1-7 | Obsolete `boardId !== "settings"` guard removed |
| P2-1 | `showNotImplemented()` extracted to shared utility |
| P2-3 | `PRIORITY_COLOR` moved to `src/shared/priorityUtils.ts` |
| P2-4 | `sortOrganizations()` extracted to shared utility |
| P2-7 | `formatDateTime()` extracted to shared utility |
| P2-8 | `useMemo` lookup maps added to TableView.tsx |
| P2-9 | `updateCard` helper extracted in CardModal |
| P2-10 | 3 dead components deleted (UserAvatar, UI/Search, FilterMenu) |
| P2-13 | 4 placeholder strings translated to German |
| P2-14 | `"DE-de"` → `"de-DE"` in Calendar |
| P2-15 | Redundant `!!cardId` removed from Board.tsx |
| P2-17 | Hardcoded `"#00000009"` → CSS variable |
| P2-18 | All commented-out code and `console.log` cleaned up |
| P2-19 | `index.html` `lang="en"` → `lang="de"` |
| P2-20 | `FallbackLoader` centered with `<Center h="100%">` |
| P2-21 | Proper `NotFound.tsx` 404 page created and wired |
| P3-7 | react-scan comment updated for `verbatimModuleSyntax` compat |

## Previously fixed (between original audit and this pass)

| Issue | Description |
|-------|-------------|
| P0-4 (partial) | `(card as any).list` removed from Board.tsx; `@ts-ignore` on SegmentedControl removed |
| P1-10 | Both `useCards` and `useCardsByBoard` now sort by `orderKey` |
| P2-12 | Navbar `rightSection={<></>}` and `!= 0` issues resolved |
| P3-6 | `index` prop now consumed by `useSortable` in Card.tsx |

## Suggested Work Order

1. **P0** — Error states (P0-2) and auth hook usage (P0-4) remain. The XSS issue (P0-1) is the most urgent security fix.
2. **P1** — Navbar over-fetch (P1-1), user scoping (P1-2), ESLint rules (P1-8), error boundary (P1-9).
3. **P2** — Remaining code quality items. Most are now isolated to single concerns (confirmDelete extract, InlineCreate, settings layout, raw div, skeletons).
4. **P3** — Feature completion and testing. These can be spread across sprints.
