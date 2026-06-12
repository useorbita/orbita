# rfcs/

Design proposals, codebase audits, and implementation plans.

Files are named `YYYY-MM-DD-{slug}.md` so they sort chronologically. Each file includes YAML frontmatter with `date`, `type`, `status`, `title`, and `tags` fields for easy filtering (e.g., `grep "type: audit" rfcs/*.md`).

## Frontmatter fields

| Field | Required | Description |
|-------|----------|-------------|
| `date` | yes | Canonical date matching the filename prefix (`YYYY-MM-DD`) |
| `type` | yes | One of the types listed below |
| `status` | yes | One of the statuses listed below |
| `title` | yes | Human-readable title (should match the document's h1) |
| `tags` | no | List of keywords for discoverability |
| `depends_on` | no | List of RFC filenames this RFC builds on |

## Types

- **brainstorming** — Unfiltered observations, architecture evaluations, freeform ideas
- **implementation-plan** — Step-by-step guides for building a feature
- **audit** — Structured codebase quality reports (P0–P3 priority issues)

## Statuses

- **draft** — Work in progress, still being refined
- **updated** — Previously completed and revisited
- **accepted** — Reviewed and approved for implementation
- **implemented** — The plan has been carried out
