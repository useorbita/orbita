---
date: 2026-07-01
type: brainstorming
status: draft
title: "PocketBase Schema Analyzer — Rule Visualizer & Schema Inspector"
tags: [tooling, api-rules, visualization, parser, pocketbase, security, schema]
---
# PocketBase Schema Analyzer — Rule Visualizer & Schema Inspector

## Summary

PocketBase API rules are strings evaluated at query time with no compiler, linter, or debugger. A typo or logic error silently becomes a security hole. Beyond rules, the schema also contains indexes, relations, field definitions, and auth configuration — all easy to misconfigure without tooling.

**PocketBase Schema Analyzer** is a standalone web app. Drop a `pb_schema.json` file and get a visual, validated view of your entire schema. The primary focus is **API rule analysis**: a permission matrix, an AST parser, a relation traversal graph, and an issue detector. Secondary features include index analysis, relation mapping, field validation, and auth configuration review. Everything runs client-side.

---

## Primary Feature: API Rule Analysis

### 1. Permission Matrix

A color-coded table of every collection × every operation (list, view, create, update, delete):

```
                   listRule    viewRule    createRule   updateRule   deleteRule
users              🔓 auth     🔓 auth     🔓 open      🔒 self      🔒 self
organizations      🔒 member   🔒 member   🔓 auth      🔒 owner      🔒 owner
projects           🔒 mixed    🔒 mixed    🔒 member    🔒 admin      🔒 admin
boards             🔒 mixed    🔒 mixed    🔒 no-viewer 🔒 no-viewer  🔒 admin
lists              🔒 mixed    🔒 mixed    🔒 no-viewer 🔒 no-viewer  🔒 admin
cards              🔒 mixed    🔒 mixed    🔒 no-viewer 🔒 no-viewer  🔒 admin
labels             🔒 mixed    🔒 mixed    🔒 no-viewer 🔒 admin      🔒 admin
documents          🔒 mixed    🔒 mixed    🔒 no-viewer 🔒 no-viewer  🔒 admin
card_comments      🔒 mixed    🔒 mixed    🔒 no-viewer 🔒 author     🔒 author/admin
card_events        🔒 member   🔒 member   🚫 super     🚫 super     🚫 super
document_events    🔒 member   🔒 member   🚫 super     🚫 super     🚫 super
```

| Icon | Meaning |
|------|---------|
| 🔓 | Open to authenticated users (or wider — `""` is also 🔓) |
| 🔒 | Restricted by role, ownership, or membership |
| 🚫 | Superuser only (`null`) |
| ⚠️ | Issue detected — click to investigate |

Hover a cell to see the raw filter expression. Click it to expand into a syntax-highlighted, collapsible tree view of the parsed AST.

### 2. Rule AST Parser

A hand-written recursive-descent parser for PocketBase filter expressions. The grammar is a subset of SQL-ish expressions plus PocketBase-specific operators (`?=`, `?!=`, `?~`, `?~!`) and the `@collection.*` join syntax.

**Grammar (subset):**

```
expression  → or_expr
or_expr     → and_expr ("||" and_expr)*
and_expr    → compare ("&&" compare)*
compare     → unary (("=" | "!=" | ">" | "<" | ">=" | "<=" | "?=" | "?!=" | "?~" | "?~!") unary)?
unary       → "!"? primary
primary     → literal | field_path | "(" expression ")"
literal     → STRING | NUMBER | BOOLEAN | "null"
field_path  → IDENTIFIER ("." IDENTIFIER)*
```

Special tokens: `@request.auth.id`, `@request.auth.collectionId`, `@collection.<name>.<field>`, `@request.data.<field>`, `@request.query.<param>`.

**Example** — `boards.listRule` parses to:

```json
{
  "type": "And",
  "left": {
    "type": "Compare", "op": "!=",
    "left":  { "type": "Field", "path": ["@request","auth","id"] },
    "right": { "type": "StringLiteral", "value": "" }
  },
  "right": {
    "type": "Or",
    "left": {
      "type": "CollectionJoin", "collection": "organization_members",
      "conditions": [
        { "op": "?=", "left": { "type": "Field", "path": ["@collection","organization_members","user"] },         "right": { "type": "Field",         "path": ["@request","auth","id"] } },
        { "op": "?=", "left": { "type": "Field", "path": ["@collection","organization_members","organization"] },  "right": { "type": "Field",         "path": ["project","organization"] } },
        { "op": "?=", "left": { "type": "Field", "path": ["@collection","organization_members","role"] },          "right": { "type": "StringLiteral", "value": "owner" } }
      ]
    },
    "right": {
      "type": "CollectionJoin", "collection": "project_members",
      "conditions": [
        { "op": "?=", "left": { "type": "Field", "path": ["@collection","project_members","user"] },    "right": { "type": "Field", "path": ["@request","auth","id"] } },
        { "op": "?=", "left": { "type": "Field", "path": ["@collection","project_members","project"] }, "right": { "type": "Field", "path": ["project"] } }
      ]
    }
  }
}
```

### 3. Relation Traversal Graph

Each rule's `@collection.*` joins build a traversal path. The graph view renders these paths as a directed graph, grouped by collection:

```
cards ──→ board ──→ project ──→ organization
                  │            └──→ organization_members  [role check: "owner"]
                  └──→ project_members                    [no role check]
card_comments ──→ card ──→ board ──→ project ──→ organization
                                           │
                                           └──→ project_members
```

Edges approaching PocketBase's 6-level join limit are **yellow**. Edges exceeding it are **red**. Each edge is annotated with the rule that caused it and any role constraint applied.

### 4. Rule Issue Detection (Linter)

Every rule is checked against the following list. Issues are filterable by severity:

| # | Sev | Check | Example |
|---|-----|-------|---------|
| 1 | 🔴 | Empty rule (`""`) | `"createRule": ""` — anyone can create |
| 2 | 🔴 | Missing auth guard | `"listRule": "id = @request.auth.id"` — passes for anonymous users because `"" = id` is not guarded |
| 3 | 🔴 | `@collection.<name>` doesn't exist | `@collection.typo_collection` |
| 4 | 🔴 | `@collection.<name>.<field>` doesn't exist | `@collection.organization_members.typo_field` |
| 5 | 🔴 | Impossible join — no relation path from current collection to referenced collection | `shares.createRule` references `@collection.projects` but shares has no relation to projects |
| 6 | 🟡 | `listRule` differs from `viewRule` | Usually they should match |
| 7 | 🟡 | Deep traversal (≥5 levels) | `a.b.c.d.e.f` — approaching PocketBase's 6-level limit |
| 8 | 🟡 | References a PocketBase system collection (`_` prefix) | `@collection._authOrigins` |
| 9 | 🟡 | Self-referencing join | `@collection.organizations` inside `organizations.listRule` |
| 10 | 🟡 | `@request.data.*` used in list/view rule | No-op — `@request.data` is only populated for create/update |
| 11 | 🟡 | `null` rule | Superuser-only — intentional but confirm during audit |
| 12 | 🟡 | Rule is identical to another collection's rule | May indicate copy-paste without review |

---

## Secondary Feature: Schema Analysis

Beyond rules, the analyzer inspects the rest of `pb_schema.json`.

### 5. Index Analysis

PocketBase automatically indexes system fields (`id`, `created`, `updated`) but does **not** index custom relation fields. Joining on unindexed relation columns is fine at small scale but degrades at larger volumes.

| Check | Example |
|-------|---------|
| 🟡 Relation field without an index | `project_members.user` (relation to `users`) — queries filtering by user will table-scan without an index |
| 🟡 Missing unique index on junction table pairs | `project_members(user, project)` — should have a unique index to prevent duplicate memberships |
| 🟡 Index on a low-cardinality field | Indexing a `bool` field like `is_external` — rarely useful, wastes write performance |
| 🟢 Good: index present with appropriate columns | Detected and shown in green for confirmation |

### 6. Relation Map

A full entity-relationship diagram derived entirely from the schema's `relation` fields. Shows:

- Which collections relate to which others
- Cascade delete settings (`cascadeDelete: true/false`)
- Required vs optional relations (`minSelect`/`maxSelect`)
- Orphan detection — collections that have no inbound relations (possible dead data)

### 7. Field Validation

| Check | Example |
|-------|---------|
| 🔴 `select` field with no `values` array | A dropdown with nothing to select — will error at runtime |
| 🟡 `required: true` but no `min` > 0 | Text field marked required but allows empty string |
| 🟡 `number` field with `onlyInt: false` but integer-looking values | Might be accidental — `ticket_counter` storing floats |
| 🟡 Collection missing `created` / `updated` autodate fields | Inconsistent with the rest of the schema |
| 🟢 Collection has both `created` and `updated` autodate fields | Good practice — shown in green |

### 8. Auth Configuration Review

| Check | Example |
|-------|---------|
| 🔴 `authRule: ""` on the users collection | Any email+password combination can authenticate — no email verification required |
| 🟡 `passwordAuth.identityFields` missing `email` | Users can only log in with username — unusual for most apps |
| 🟡 `oauth2.enabled: false` with no `mfa.enabled` | Single-factor auth only — fine for development, flag for production |
| 🟢 `manageRule: null` | Admin management restricted to superusers — good default |

---

## Technical Design

### Stack

- **Vanilla TypeScript or Svelte 5** — small bundle, no framework tax
- **CodeMirror 6** — syntax-highlighted rule editor
- **D3.js** — traversal graph and ER diagram
- **100% client-side** — the schema never leaves the browser
- **Deploy to** GitHub Pages, Vercel, or Cloudflare Pages as a static site

### Parser Pipeline

```
pb_schema.json
    │
    ▼
Schema Parser ─── typed objects: collections, fields, relations, indexes, rules
    │
    ▼
Rule Tokenizer ─── filter string → token stream
    │
    ▼
Rule Parser ─── token stream → AST
    │
    ├──→ Matrix Renderer ─── permission matrix with color coding
    ├──→ Graph Renderer ─── relation traversal graph + ER diagram
    ├──→ Rule Linter ─── runs all rule checks against the AST
    └──→ Schema Linter ─── runs all index/field/auth checks
```

### Why Client-Side Matters

1. **Zero trust required.** The schema may contain sensitive collection names, field names, or rule patterns you don't want on a third-party server.
2. **Instant feedback.** No network latency — paste, parse, render all in the same frame.
3. **No backend to maintain.** The tool is a static HTML file. It never breaks because a server went down.

---

## Implementation Plan

### Phase 1 — MVP (schema parser + permission matrix)

- Parse `pb_schema.json` into typed TypeScript objects
- Render the permission matrix with color coding
- Show raw rule strings on hover
- Basic issue detection: empty rules, null rules, missing auth guards

### Phase 2 — Rule AST parser

- Tokenizer for PocketBase filter syntax
- Recursive-descent parser producing JSON AST
- Syntax error detection (unbalanced parens, invalid operators, unrecognized tokens)
- Syntax-highlighted AST tree view on click

### Phase 3 — Traversal graph + deep linting

- Extract `@collection.*` references from each rule's AST
- Build the relation graph
- Detect deep traversal, non-existent collections, and impossible joins
- Render graph with D3

### Phase 4 — Schema analysis

- Index analysis (missing indexes on relation fields, missing unique indexes on junction tables)
- Relation map (ER diagram with cascade delete indicators)
- Field validation (select values, required fields, type mismatches)
- Auth configuration review

---

## How It Looks

```
┌──────────────────────────────────────────────────────────────────┐
│  PocketBase Schema Analyzer              [Drop pb_schema.json]   │
├──────────────────────────────────────────────────────────────────┤
│  [Rules] [Graph] [Indexes] [Relations] [Auth] [Issues (3)]       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Collection       listRule    viewRule   createRule   ...        │
│  ─────────        ────────    ────────   ──────────              │
│  users            🔓 auth     🔓 auth    🔓 open       ...        │
│  organizations    🔒 member   🔒 member  🔓 auth       ...        │
│  projects         🔒 mixed    🔒 mixed   🔒 member     ...        │
│  boards           🔒 mixed    🔒 mixed   🔒 no-viewer  ...        │
│  lists            🔒 mixed    🔒 mixed   🔒 no-viewer  ...        │
│  cards            🔒 mixed    🔒 mixed   🔒 no-viewer  ...        │
│  labels           🔒 mixed    🔒 mixed   🔒 no-viewer  ...        │
│  documents        🔒 mixed    🔒 mixed   🔒 no-viewer  ...        │
│  card_comments    🔒 mixed    🔒 mixed   🔒 no-viewer  ...        │
│  card_events      🔒 member   🔒 member  🚫 super      ...        │
│  document_events  🔒 member   🔒 member  🚫 super      ...        │
│                                                                  │
│  🔓 = auth'd+   🔒 = restricted   🚫 = superuser   ⚠️ = issue    │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  Issues                                                          │
│  ──────                                                          │
│  🔴 projects.listRule: missing @request.auth.id guard             │
│     → anonymous users can list projects if rule evaluates true   │
│  🟡 boards.listRule ≠ boards.viewRule: listRule has extra check  │
│  🟡 organization_members.user: relation field without index      │
│     → queries filtering by user may table-scan at scale          │
└──────────────────────────────────────────────────────────────────┘
```

---

## Future Ideas

These are deferred until the core rule + schema analysis is stable.

### What-If Simulator

Given a mock context (user with specific roles, org ownerships, project memberships), evaluate every rule to `true` or `false` and display a personalized permission matrix: "If you are Alice (org owner of Acme, project member of Project X), here is exactly what you can do."

### Schema Diff View

Paste two schemas (before/after) and see a side-by-side diff of every rule, field, index, and option that changed. Useful for code review of schema migrations. Color-coded: green for additions, red for removals, yellow for modifications.

### Shareable URLs

Encode the schema (or a schema diff) into the URL fragment hash so you can send a link to a teammate during code review. The schema is compressed and base64-encoded in the hash — it never touches a server.

### Rule Auto-Complete / Suggestion

As you type or edit a rule in the CodeMirror editor, suggest valid field paths from the schema. Type `@collection.` and get a dropdown of available collections. Type `@collection.organization_members.` and get the fields on that collection. Catches typos at input time rather than at lint time.

### CI Integration

A CLI wrapper (`npx pb-analyze --schema pb_schema.json`) that runs the linter and exits with a non-zero code if critical issues are found. Designed to run in GitHub Actions as a PR check: "This PR introduces 2 new 🔴 critical rule issues."

### PocketBase Admin UI Plugin

If PocketBase ever supports plugins in the Admin UI, embed the analyzer as a panel directly in the dashboard. Live-sync with the running schema rather than requiring a file upload.

---

## Relation to Existing RFCs

- **API Rules RFC** (`2026-06-12-api-rules.md`) — The analyzer parses and visualizes the rules defined there. Every rule in that document can be validated by this tool before deployment.
- **Testing RFC** (`2026-06-12-api-rule-testing.md`) — The test suite validates runtime behavior; the analyzer validates rule structure at design time. Both are needed: the analyzer catches typos and impossible joins before you ever start PocketBase; the test suite catches logic errors that only manifest at runtime.
- **Public Sharing RFC** (`2026-06-12-public-sharing.md`) — The analyzer would immediately flag the `shares.createRule` problem (referencing `@collection.projects` without a relation path) as a 🔴 critical issue — the exact kind of bug this tool is designed to catch.
