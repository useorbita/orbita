# Orbita

A lightweight project management tool for small teams 

> **Status:** Work in progress. Core features are functional; several areas are still being built out. Not yet ready for use.

## Features & Goals

**Organize Tasks in Cards and Lists** Use kanban boards to manage your tasks, assign members, and track progress.

**Keep Your Knowledge in One Place** Manage your meeting notes, documentation, and thoughts for every project.

**Keep Track of the Timeline** See all your tasks and deadlines in a single calendar.

**Free & Open-Source** MIT licensed. Change what you want. No freemium model, no paywalled features.

**Built upon PocketBase** Easy to self-host, easy to extend, easy to migrate.

**Privacy First** No advertising, no tracking, no data sharing, GDPR compliant, deployable in air-gapped environments.

**AI Opt-In** Connect a local LLM via llama.cpp or Jan to enhance search and automate tasks.

---

### In Progress
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

### Planned / Work started
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
| Backend | PocketBase |
| Language | TypeScript |
| Framework | React |
| UI | Mantine |
| Build | Vite + SWC |
| Data fetching | TanStack React Query |
| Rich text | TipTap |
| Router | React Router |
| Icons | Tabler Icons |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) and a package manager (`pnpm` recommended)
- [PocketBase](https://pocketbase.io/) binary

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

## License

MIT License. See [LICENSE](LICENSE).
