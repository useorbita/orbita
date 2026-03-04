# Orbita

A self-hosted project management and knowledge base tool — a kanban board combined with a lightweight wiki. Built as a personal/team workspace for organizing work across organizations, projects, boards, and documents.

> **Status:** Work in progress. Core features are functional; several areas are still being built out.

---

## Features

### Implemented
- **Organizations** — Create organizations, invite members, manage roles
- **Projects** — Group boards and documents under a project within an organization
- **Boards** — Kanban-style boards with lists (columns) and cards
- **Cards** — Tasks with title, rich-text description, labels, member assignment, due date, and priority
- **Comments / Activity** — Comment thread on each card
- **Knowledge Base** — Rich-text documents per project (powered by TipTap)
- **Views** — Switch between Kanban (list) and table view on a board
- **Calendar** — View all cards with due dates in a calendar
- **Authentication** — Sign up / sign in via PocketBase
- **Settings** — User account info, color scheme (light / dark / system)
- **Collapsible sidebar** — Navigation across orgs, projects, boards, docs

### Planned / In Progress
- Card deletion
- Board deletion
- Drag-and-drop card reordering
- Search (UI stub exists, not connected)
- Filter by member / label / due date
- Workflow editor (trigger-based automation with react-flow)
- Internationalization (currently German-only)
- Board settings (labels management)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript 5 (strict) |
| Build | Vite 7 + SWC |
| UI | Mantine 9 |
| Data fetching | TanStack React Query v5 |
| Rich text | TipTap 3 |
| Router | React Router v7 |
| Backend | PocketBase 0.26 (self-hosted) |
| Icons | Tabler Icons |
| Dates | dayjs |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+) and a package manager (`pnpm` recommended)
- [PocketBase](https://pocketbase.io/) binary (v0.26+)

### 1. Start PocketBase

```bash
cd pocketbase
./pocketbase serve
```

On first run, open the admin UI at `http://localhost:8090/_/` and create your superuser account. Then import the schema:

```bash
./pocketbase import pocketbase/pb_schema.json
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
VITE_PB_URL=http://localhost:8090
# Optional: pre-fill login form in development
VITE_PB_USERNAME=your@email.com
VITE_PB_PASSWORD=yourpassword
```

### 3. Install dependencies and start dev server

```bash
pnpm install
pnpm dev
```

App runs at `http://localhost:5173`.

### 4. Regenerate TypeScript types (after schema changes)

```bash
pnpm typegen
```

This generates `src/api/types.ts` from the live PocketBase schema.

---

## Project Structure

```
src/
├── api/              # React Query hooks + PocketBase calls
│   ├── pocketbase.ts # PocketBase client singleton
│   ├── types.ts      # Auto-generated types from schema
│   ├── auth.ts
│   ├── boards.ts
│   ├── cards.ts
│   ├── lists.ts
│   ├── organizations.ts
│   ├── projects.ts
│   ├── docs.ts
│   ├── labels.ts
│   ├── comments.ts
│   └── users.ts
├── components/
│   ├── App/          # App shell (Navbar)
│   ├── Board/        # ListView, List, TableView
│   ├── Card/         # Card, CardModal
│   └── UI/           # Shared components (TextEditor, UserAvatar, etc.)
├── pages/            # Route-level page components
├── shared/           # Utility functions (nameUtils, etc.)
├── App.tsx           # Route definitions
└── main.tsx          # Entry point

pocketbase/
├── pb_schema.json    # Database schema (import to PocketBase)
├── pb_hooks/         # Server-side PocketBase JS hooks
└── CHANGELOG.md

scripts/
├── addDummyData.ts   # Seed script for development
└── deleteDummyData.ts
```

---

## License

See [LICENSE](LICENSE).
