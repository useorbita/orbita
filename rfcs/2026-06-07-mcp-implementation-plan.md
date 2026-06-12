---
date: 2026-06-07
type: implementation-plan
status: draft
title: "MCP Server — Implementation Plan"
tags: [mcp, api, pocketbase, deno, integration]
---

# MCP Server — Implementation Plan

> Self-contained plan for adding an optional MCP (Model Context Protocol) server to Orbita.
> The MCP server is a standalone Deno process. It is **not** required for normal Orbita usage.
> When running, it lets users connect chatbots (Claude Desktop, etc.) to manage their Orbita cards and documents.

---

## 1. What the User Experience Looks Like

```
1. User starts PocketBase (as usual):     ./pocketbase serve
2. User starts Orbita React app (as usual): pnpm dev
3. User starts the MCP server (optional):   deno run --allow-net --allow-env mcp-server/main.ts

4. In Orbita Settings → "API Tokens" tab:
   - User clicks "Generate Token"
   - Names it "My Claude Desktop"
   - Chooses "Read" or "Read + Write"
   - Copies the one-time token: orb_mcp_a1b2c3...

5. In Claude Desktop config:
   {
     "mcpServers": {
       "orbita": {
         "url": "http://localhost:3100/sse",
         "headers": { "Authorization": "Bearer orb_mcp_a1b2c3..." }
       }
     }
   }

6. User asks Claude: "What cards are assigned to me this week?"
   → Claude calls the MCP server
   → MCP server talks to PocketBase
   → Returns only cards this user has access to
   → Claude displays them
```

---

## 2. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                         USER'S MACHINE                                │
│                                                                       │
│  ┌──────────────┐                           ┌──────────────────────┐ │
│  │  REACT APP   │ ─── direct PB requests ─→ │                      │ │
│  │  (Vite SPA)  │    (JWT from login)       │    POCKETBASE         │ │
│  └──────────────┘                           │    127.0.0.1:8090     │ │
│                                              │                      │ │
│  ┌──────────────┐    MCP protocol            │  ┌────────────────┐  │ │
│  │  CHATBOT     │ ── (SSE, Bearer token) ─→  │  │ pb_hooks/      │  │ │
│  │  (Claude)    │                            │  │ main.pb.js     │  │ │
│  └──────────────┘                            │  │ ← resolves     │  │ │
│         │                                     │  │   API tokens   │  │ │
│         │          ┌──────────────────────┐  │  │   to users     │  │ │
│         └────────→ │  MCP SERVER (Deno)   │  │  └────────────────┘  │ │
│                    │  localhost:3100       │──│── anonymous pb ──────│ │
│                    │                       │  │    requests          │ │
│                    │  Per-request pb       │  │                      │ │
│                    │  instance (factory)   │  │                      │ │
│                    └──────────────────────┘  │                      │ │
│                                              └──────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

Key points:
- The React app talks to PocketBase **directly**, as it always has. No change.
- The MCP server is a **separate process**. When not running, nothing breaks.
- The MCP server's PocketBase client is **anonymous** — it never logs in.
- Authorization is enforced by a **PocketBase hook** that reads the `X-Api-Token` header.

---

## 3. How Authorization Works (Step by Step)

This is the most important part. Here's a single request traced end-to-end:

```
CHATBOT                        MCP SERVER                      POCKETBASE
  │                               │                               │
  │  1. MCP request                │                               │
  │  Authorization: Bearer          │                               │
  │    orb_mcp_a1b2c3...           │                               │
  │ ─────────────────────────────→ │                               │
  │                               │                               │
  │                               │  2. Create fresh pb instance   │
  │                               │     pb = new PocketBase(url)   │
  │                               │     pb.beforeSend = inject     │
  │                               │       X-Api-Token header       │
  │                               │                               │
  │                               │  3. pb.collection("cards")     │
  │                               │     .getFullList()             │
  │                               │  X-Api-Token: orb_mcp_a1b2...  │
  │                               │ ─────────────────────────────→ │
  │                               │                               │
  │                               │              4. Hook runs:     │
  │                               │              routerUse((c) => {│
  │                               │                token = header  │
  │                               │                hash = sha256() │
  │                               │                lookup token    │
  │                               │                → user_id = 123 │
  │                               │                c.set(auth,user)│
  │                               │              })                │
  │                               │                               │
  │                               │              5. Collection     │
  │                               │              handler runs:     │
  │                               │              @request.auth.id  │
  │                               │              = "123" ✓         │
  │                               │              Returns cards     │
  │                               │ ←──────────────────────────── │
  │                               │                               │
  │  6. MCP response               │                               │
  │ ←───────────────────────────── │                               │
  │                               │                               │
```

### Why this is secure:

1. **The MCP server has zero standing authority.** Its `pb` instance is anonymous. If the hook didn't exist, PocketBase would reject every request (because collection rules require `@request.auth.id != ''`).

2. **Each request gets a fresh pb instance.** Created in the auth middleware, used for that one request, then garbage collected. No shared state between requests. No race condition on tokens.

3. **The token is hashed in the database.** `api_tokens` stores `sha256(token)`, never the raw token. A database dump reveals nothing usable.

4. **The hook is the single choke point.** All PocketBase requests — whether from the React app (JWT) or MCP server (API token) — go through the same hook. The hook injects the resolved user identity before collection handlers run.

5. **The MCP server never sees user passwords.** It can't log in as the user because it doesn't have the password. It only forwards the API token.

6. **Tokens are revocable.** Delete the `api_tokens` record → hash stops matching → hook doesn't inject auth → requests fail.

---

## 4. Implementation Steps

### Step 1: Add the `api_tokens` Collection to PocketBase

Add this to `pocketbase/pb_schema.json` (or create via PocketBase Admin UI):

```json
{
  "id": "pbc_api_tokens",
  "name": "api_tokens",
  "type": "base",
  "listRule": "user = @request.auth.id",
  "viewRule": "user = @request.auth.id",
  "createRule": "@request.auth.id != ''",
  "updateRule": "user = @request.auth.id",
  "deleteRule": "user = @request.auth.id",
  "fields": [
    {
      "name": "name",
      "type": "text",
      "required": true,
      "presentable": true
    },
    {
      "name": "token_hash",
      "type": "text",
      "required": true,
      "hidden": true
    },
    {
      "name": "prefix",
      "type": "text",
      "required": true
    },
    {
      "name": "user",
      "type": "relation",
      "required": true,
      "collectionId": "_pb_users_auth_",
      "cascadeDelete": false,
      "maxSelect": 1
    },
    {
      "name": "scopes",
      "type": "select",
      "required": true,
      "values": ["read", "read_write"],
      "maxSelect": 1
    },
    {
      "name": "last_used",
      "type": "date",
      "required": false
    },
    {
      "name": "expires",
      "type": "date",
      "required": false
    }
  ]
}
```

**Why these rules:** `user = @request.auth.id` means a user can only see and manage their own tokens. The `createRule` allows any authenticated user to create one (token generation happens in the Settings page while logged in).

### Step 2: Create the PocketBase Hook

Create `pocketbase/pb_hooks/main.pb.js`:

```js
// pocketbase/pb_hooks/main.pb.js

// ── SHA-256 helper ──────────────────────────────────────────────
function sha256(input) {
    var msg = new TextEncoder().encode(input);
    return Array.from($security.sha256(msg))
        .map(function(b) { return b.toString(16).padStart(2, "0"); })
        .join("");
}

// ── Middleware: runs BEFORE every collection CRUD handler ───────
routerUse(function(c) {
    var apiToken = c.request().header.get("X-Api-Token");

    // No API token header → normal request (React app with JWT auth)
    // Let PocketBase's built-in auth handle it.
    if (!apiToken) {
        return c.next();
    }

    // Hash the token and look it up in the api_tokens collection
    var hash = sha256(apiToken);

    var records = $app.dao().findRecordsByFilter(
        "api_tokens",
        "token_hash = '" + hash + "'",
        "", 1, 0
    );

    if (records.length === 0) {
        // Token not found. Request stays anonymous.
        // Collection rules (which check @request.auth.id != '')
        // will reject it.
        return c.next();
    }

    var tokenRecord = records[0];

    // Check expiry
    var expires = tokenRecord.get("expires");
    if (expires) {
        var expiryDate = new Date(expires);
        if (expiryDate < new Date()) {
            return c.next(); // Expired → anonymous → rules reject
        }
    }

    // Resolve the user who owns this token
    var userId = tokenRecord.get("user");
    var user;
    try {
        user = $app.dao().findRecordById("users", userId);
    } catch (e) {
        return c.next(); // User not found → anonymous → rules reject
    }

    // ✨ THE KEY LINE ✨
    // Inject the user into the request context.
    // From this point on, PocketBase sees this request as coming
    // from the authenticated user. All collection rules evaluate
    // with @request.auth.id = userId.
    c.set("authRecord", user);

    // Update last_used timestamp (best-effort, don't block)
    try {
        var recordToUpdate = $app.dao().findRecordById("api_tokens", tokenRecord.get("id"));
        recordToUpdate.set("last_used", new Date().toISOString());
        $app.dao().saveRecord(recordToUpdate);
    } catch (e) {
        // Silently ignore — updating last_used is non-critical
    }

    return c.next();
});
```

**Important notes about PocketBase hooks:**

- `$security.sha256` returns a `Uint8Array`, not a hex string. The helper above converts it.
- `c.set("authRecord", user)` overrides the authentication context. After this call, `@request.auth.id` resolves to the user's ID.
- `$app.dao().findRecordsByFilter(collection, filter, sort, limit, offset)` is the server-side API for querying.
- The `routerUse` middleware runs on **every** request. For normal requests (React app), the `if (!apiToken)` branch triggers immediately — minimal overhead.

### Step 3: Regenerate PocketBase Types

After adding the `api_tokens` collection:

```bash
pnpm typegen
```

This updates `src/api/types.ts` to include the new `ApiTokensResponse` type.

### Step 4: Add Token CRUD to the React API Layer

Create `src/api/apiTokens.ts`:

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pb } from "./pocketbase";
import { Collections, type ApiTokensResponse } from "./types";

// ── Query Keys ──────────────────────────────────────────────────
export const tokenKeys = {
  all: [Collections.ApiTokens] as const,
  detail: (id: string) => [Collections.ApiTokens, id] as const,
};

// ── Queries ─────────────────────────────────────────────────────
export const useApiTokens = () =>
  useQuery({
    queryKey: tokenKeys.all,
    queryFn: () =>
      pb
        .collection(Collections.ApiTokens)
        .getFullList<ApiTokensResponse>({ sort: "-created" }),
  });

// ── Token Generation ────────────────────────────────────────────
// This happens entirely in the browser.
// The raw token is generated client-side, hashed, and the hash
// is sent to PocketBase. The raw token is returned to the user ONCE.

async function sha256(input: string): Promise<string> {
  const msg = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", msg);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateToken(): { raw: string; prefix: string } {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const random = Array.from(
    crypto.getRandomValues(new Uint8Array(48)),
    (b) => chars[b % chars.length]
  ).join("");
  const full = `orb_mcp_${random}`;
  return { raw: full, prefix: full.slice(0, 16) }; // "orb_mcp_a1b2c3d4"
}

export const useGenerateToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      scopes: "read" | "read_write";
      expires?: string;
    }) => {
      const { raw, prefix } = generateToken();
      const hash = await sha256(raw);

      await pb.collection(Collections.ApiTokens).create({
        name: params.name,
        token_hash: hash,
        prefix,
        scopes: params.scopes,
        expires: params.expires || null,
        user: pb.authStore.record!.id,
      });

      // Return the raw token — this is the ONLY time it's available.
      return { raw, prefix, name: params.name };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tokenKeys.all });
    },
  });
};

// ── Token Revocation ────────────────────────────────────────────
export const useDeleteToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      pb.collection(Collections.ApiTokens).delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tokenKeys.all });
    },
  });
};
```

**Why token generation works this way:**
- The raw token is generated in the browser using `crypto.getRandomValues()` (cryptographically secure).
- Only the hash is stored in PocketBase. Even with full DB access, you can't reconstruct the token.
- The raw token is returned to the UI and shown once. It's never stored server-side in plaintext.
- The prefix (first 16 chars: `orb_mcp_a1b2c3d4`) is stored so the user can identify tokens in the settings list.

### Step 5: Add Token Management UI to Settings

Add a new tab in `src/pages/Settings.tsx` (or a sub-component) that shows:

```tsx
function ApiTokensSettings() {
  const tokens = useApiTokens();
  const generateToken = useGenerateToken();
  const deleteToken = useDeleteToken();
  const [newToken, setNewToken] = useState<{ raw: string } | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<"read" | "read_write">("read");

  // ── Generate handler ──
  const handleGenerate = () => {
    if (!name.trim()) return;
    generateToken.mutate(
      { name: name.trim(), scopes },
      {
        onSuccess: (data) => {
          setNewToken({ raw: data.raw });
          setCreating(false);
          setName("");
        },
      }
    );
  };

  return (
    <>
      <Text size="sm" c="dimmed" mb="md">
        API Tokens erlauben externen Anwendungen (wie Chatbots) den Zugriff
        auf deine Orbita-Daten. Jeder Token ist an deinen Account gebunden.
      </Text>

      {/* ── One-time token display ── */}
      {newToken && (
        <Paper withBorder p="md" mb="md" bg="yellow.0">
          <Text fw={700} mb="xs">Token erstellt — jetzt kopieren!</Text>
          <Code block>{newToken.raw}</Code>
          <Text size="xs" c="red" mt="xs">
            Dieser Token wird nur einmal angezeigt. Kopiere ihn jetzt.
            Er kann nicht wiederhergestellt werden.
          </Text>
          <Button
            mt="sm"
            size="xs"
            onClick={() => {
              navigator.clipboard.writeText(newToken.raw);
              setNewToken(null);
            }}
          >
            In Zwischenablage kopieren
          </Button>
        </Paper>
      )}

      {/* ── Existing tokens ── */}
      <Stack gap="xs">
        {tokens.data?.map((token) => (
          <Group key={token.id} justify="space-between">
            <Stack gap={0}>
              <Text size="sm">{token.name}</Text>
              <Text size="xs" c="dimmed">
                {token.prefix}... · {token.scopes === "read_write" ? "Lesen & Schreiben" : "Nur Lesen"}
                {token.last_used && ` · Zuletzt: ${dayjs(token.last_used).fromNow()}`}
              </Text>
            </Stack>
            <ActionIcon
              color="red"
              variant="subtle"
              onClick={() => deleteToken.mutate(token.id)}
            >
              <IconTrash size="1em" />
            </ActionIcon>
          </Group>
        ))}
      </Stack>

      {/* ── Create form ── */}
      {creating ? (
        <Stack gap="xs" mt="md" maw={400}>
          <TextInput
            placeholder="Token-Name (z.B. Mein Claude Desktop)"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
          <Select
            value={scopes}
            onChange={(v) => setScopes(v as "read" | "read_write")}
            data={[
              { value: "read", label: "Nur Lesen" },
              { value: "read_write", label: "Lesen & Schreiben" },
            ]}
          />
          <Group gap="xs">
            <Button size="xs" onClick={handleGenerate} loading={generateToken.isPending}>
              Erstellen
            </Button>
            <Button size="xs" variant="subtle" color="gray" onClick={() => setCreating(false)}>
              Abbrechen
            </Button>
          </Group>
        </Stack>
      ) : (
        <Button
          variant="subtle"
          size="xs"
          leftSection={<IconPlus size="1em" />}
          onClick={() => setCreating(true)}
        >
          Neuen Token erstellen
        </Button>
      )}
    </>
  );
}
```

### Step 6: Create the MCP Server

#### 6a. Project structure

```
mcp-server/
├── deno.json           # Deno config
├── main.ts             # Entry point
├── lib/
│   └── pocketbase.ts   # Factory function for per-request pb instances
├── middleware/
│   └── auth.ts         # Token extraction, pb instance creation
└── tools/
    └── cards.tool.ts   # Card-related MCP tools (list, get, create, update)
```

#### 6b. `deno.json`

```json
{
  "tasks": {
    "start": "deno run --allow-net --allow-env main.ts"
  },
  "imports": {
    "hono": "npm:hono@^4",
    "@modelcontextprotocol/sdk": "npm:@modelcontextprotocol/sdk@^1",
    "pocketbase": "npm:pocketbase@^0.27"
  },
  "nodeModulesDir": "auto"
}
```

#### 6c. `lib/pocketbase.ts`

```ts
// mcp-server/lib/pocketbase.ts
import PocketBase from "pocketbase";

const PB_URL = Deno.env.get("PB_URL") || "http://127.0.0.1:8090";

/**
 * Create a PocketBase client scoped to a single API token.
 *
 * CRITICAL: This must be called once per request, never shared.
 * The `beforeSend` closure permanently binds the token for
 * this instance's lifetime. Concurrent requests get their own
 * instance — no shared state, no race conditions.
 *
 * The resulting client is ANONYMOUS (never logs in).
 * Authorization happens in pb_hooks/main.pb.js, which reads
 * the X-Api-Token header and injects the user's auth context.
 */
export function createClient(token: string): PocketBase {
  const pb = new PocketBase(PB_URL);

  // Prevent intra-request cancellation when multiple queries
  // are fired in sequence for the same request.
  pb.autoCancellation(false);

  // Inject the API token header on every request.
  // The closure captures `token` at creation time — it never changes.
  pb.beforeSend = (url, options) => {
    options.headers = Object.assign({}, options.headers, {
      "X-Api-Token": token,
    });
    return { url, options };
  };

  return pb;
}
```

#### 6d. `middleware/auth.ts`

```ts
// mcp-server/middleware/auth.ts
import type { Context, Next } from "hono";
import { createClient } from "../lib/pocketbase.ts";

export async function authMiddleware(c: Context, next: Next) {
  // Extract Bearer token from Authorization header
  const header = c.req.header("Authorization");
  const token = header?.startsWith("Bearer ")
    ? header.slice(7)
    : c.req.query("token"); // fallback: query param

  if (!token) {
    return c.json({ error: "Missing API token. Provide via Authorization: Bearer orb_mcp_..." }, 401);
  }

  if (!token.startsWith("orb_mcp_")) {
    return c.json({ error: "Invalid token format. Tokens must start with 'orb_mcp_'" }, 401);
  }

  // Create a fresh, isolated pb instance for this request.
  // The token is captured in the beforeSend closure — no shared state.
  const pb = createClient(token);

  // Attach to context for downstream handlers (tools)
  c.set("pb", pb);

  await next();
}
```

#### 6e. `main.ts`

```ts
// mcp-server/main.ts
import { Hono } from "hono";
import { authMiddleware } from "./middleware/auth.ts";

const app = new Hono();
const PORT = parseInt(Deno.env.get("MCP_PORT") || "3100");

// Health check — no auth required
app.get("/", (c) => c.text("Orbita MCP Server running"));

// All MCP endpoints require token auth
app.use("/sse", authMiddleware);

// SSE transport for MCP protocol
app.get("/sse", async (c) => {
  const pb = c.get("pb");
  
  // The MCP SDK handles the SSE handshake and tool registration.
  // Tools receive `c.get("pb")` to access the authenticated PocketBase client.
  //
  // (Full MCP SDK SSE setup omitted for brevity — the key point is
  //  that tools get the pb instance from context, not a global.)
  
  return c.text("MCP SSE endpoint (SDK integration placeholder)");
});

Deno.serve({ port: PORT }, app.fetch);
console.log(`MCP server running on http://localhost:${PORT}`);
```

### Step 7: Set Proper Collection Rules

Update `pb_schema.json` so every collection has at minimum:

```json
"listRule": "@request.auth.id != ''",
"viewRule": "@request.auth.id != ''",
"createRule": "@request.auth.id != ''",
"updateRule": "@request.auth.id != ''",
"deleteRule": "@request.auth.id != ''"
```

This means: **only authenticated users** can access these collections. It doesn't implement full row-level security (that needs hooks for multi-hop checks), but it blocks anonymous access entirely — which is the first and most critical line of defense.

---

## 5. Why This Is Secure — Summary

| Security Property | How It's Enforced |
|---|---|
| **MCP server has no privileged access** | pb instance is anonymous. No admin auth. No user impersonation via password. |
| **Token can't be used to access other users' data** | PocketBase hook resolves token → exactly one user. Hook injects that user's identity. |
| **Token theft is recoverable** | User deletes the token in Settings → hash no longer matches → hook rejects requests. |
| **Token can't be reconstructed from DB** | Only SHA-256 hash is stored. Raw token generated client-side, shown once. |
| **No race conditions on concurrent requests** | Factory function creates a fresh pb instance per request. `beforeSend` closure isolates tokens. |
| **MCP server being down doesn't affect the app** | It's a separate process. React app talks to PocketBase directly. |
| **Without MCP server, no attack surface** | The hook is dormant (no X-Api-Token headers). The api_tokens table is empty. |
| **React app auth is unaffected** | The hook checks for X-Api-Token header first. If absent, normal JWT auth proceeds unchanged. |

---

## 6. What's NOT in Scope (Yet)

For this first version, the MCP server exposes **card tools only**. In the future, add:

- Document tools (list, get, create, update)
- Board tools (list boards, get board)
- Calendar/date tools
- Search tool

But the auth foundation — the hook, the token system, the factory pattern — is the same regardless of how many tools are added.

---

## 7. Files You Need to Create or Modify

| File | Action | Purpose |
|------|--------|---------|
| `pocketbase/pb_schema.json` | Edit | Add `api_tokens` collection + set all collection rules to `@request.auth.id != ''` |
| `pocketbase/pb_hooks/main.pb.js` | Create | Token→user resolution middleware |
| `src/api/apiTokens.ts` | Create | React Query hooks for token CRUD + client-side token generation |
| `src/api/types.ts` | Regenerate | `pnpm typegen` to add ApiTokens types |
| `src/pages/Settings.tsx` | Edit | Add API Tokens tab |
| `mcp-server/` | Create | Entire Deno MCP server directory |
| `mcp-server/lib/pocketbase.ts` | Create | Factory function |
| `mcp-server/middleware/auth.ts` | Create | Token extraction middleware |
| `mcp-server/main.ts` | Create | Hono + MCP entry point |
