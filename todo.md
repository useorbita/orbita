# Code Smells & TODO

## `src/components/Card/CardModal.tsx`

- [ ] **Line 55:** Remove `onCancel: () => console.log("Cancel")` — debug leftover
- [ ] **Lines 42–73:** `confirmDelete` and `linkToClipboard` both show the same "not implemented" notification — extract a shared `showNotImplemented()` helper
- [ ] **Line 126:** `dangerouslySetInnerHTML={{ __html: comment.content }}` — XSS risk; sanitize with DOMPurify or render via TipTap read-only mode
- [ ] **Lines 132–138:** Date formatting duplicated for `updated` and `created` — extract a `formatDate(d: string)` util to `src/shared/`
- [ ] **Lines 143–214:** Every `onChange` repeats `updateCardMutation.mutate({ id: activeCard.id, data: {...} })` — extract a local `updateCard = (data) => updateCardMutation.mutate({ id: activeCard.id, data })` helper
- [ ] Add error state handling for failed card/comments queries

## `src/components/Card/Card.tsx`

- [ ] **Lines 38–53:** `labels.find()` called twice for the same label (once for `color`, once for `title`) — find once, destructure both
- [ ] **Lines 62–69:** Same double-lookup for `users.find()`
- [ ] **Line 84:** Locale string `"DE-de"` has wrong casing — change to `"de-DE"`
- [ ] **Line 29:** Remove commented-out `// data-dragging={isDragging}` — dead code from removed DnD implementation

## `src/pages/Board.tsx`

- [ ] **Line 45:** `(card as any).list` — fix the `CardsResponse` type instead of casting to `any`
- [ ] **Line 28:** Remove `// Default view` comment — adds no information
- [ ] **Lines 79–85:** `{cardId && <CardModal open={!!cardId} ...>}` — `!!cardId` is always `true` inside the `&&` guard; simplify to `open`

## `src/components/App/Navbar.tsx`

- [ ] **Lines 136, 148, 158, 167:** Magic pixel offsets (`pt={19}`, `pt={18}`, `pt={5}`) compensating for layout — find a proper layout fix
- [ ] **Lines 250–253:** `rightSection={<></>}` — return `null` instead of an empty fragment
- [ ] **Line 251:** `!= 0` — change to `> 0`

## `src/pages/Home.tsx`

- [ ] **Lines 27–31:** Org sort logic (personal org first) duplicated from `Navbar.tsx:74-79` — extract to `src/shared/` (e.g. `sortOrganizations()`)

## `src/pages/OrgSettings.tsx`

- [ ] **Lines 24–26:** `descriptionSpan`, `inputSpan`, `offset` are vague local magic numbers for grid layout — remove or document them properly
- [ ] **Line 87:** `(member.expand as any)?.user?.name` — declare the expand type instead of casting to `any`

## `src/pages/Settings.tsx`

- [ ] **Line 64:** `// @ts-ignore` on `SegmentedControl` `onChange` — use a proper type assertion (`(value: "light" | "dark" | "auto") => setColorScheme(value)`) instead

## `src/pages/Authentication.tsx`

- [ ] **Lines 16–17:** Dev credentials pre-filled from env vars (`VITE_PB_USERNAME`, `VITE_PB_PASSWORD`) — guard so this only applies in development (`import.meta.env.DEV`)

## `src/components/Board/ListView.tsx`

- [ ] **Line 63:** Placeholder `"List title"` is English — change to German (`"Listentitel"`)

## `src/components/Board/List.tsx`

- [ ] **Line 79:** Placeholder `"Card title"` is English — change to German (`"Kartentitel"`)
- [ ] **Lines 38–46:** Raw `<div className="Column">` with inline styles — replace with Mantine layout primitives to match the rest of the codebase
- [ ] **Line 56:** Hardcoded `backgroundColor: "#00000009"` — replace with a Mantine theme token or CSS variable

## `src/api/cards.ts`

- [ ] **Line 37:** `boardId !== "settings"` guard — investigate whether this is still needed given the correct route definitions in `App.tsx`; remove if obsolete

## `src/App.tsx`

- [ ] **Line 54:** `<p>Seite nicht gefunden</p>` — replace bare `<p>` with a Mantine `<Text>` or a proper 404 component

## General / Cross-cutting

- [ ] `useUsers()` in `CardModal` fetches all users globally — scope to org/project members
- [ ] No skeleton loading states anywhere — add Mantine `<Skeleton>` placeholders while data loads
- [ ] All UI strings are hardcoded in German — introduce an i18n mechanism (or at least centralize strings) before adding more languages; the language selector in Settings is currently non-functional
