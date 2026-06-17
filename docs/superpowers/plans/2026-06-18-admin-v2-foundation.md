# Boopy Admin v2 — Foundation + Core CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Note from the user:** for this plan, implement directly using this doc + the spec as a guide — do not invoke subagent-driven-development or executing-plans for execution.

**Goal:** Stand up `apps/admin-v2`, a new Next.js + Refine + shadcn/ui admin dashboard that talks to Supabase directly (no more `BOOPY_ADMIN_SECRET` proxy), covering Users/Subscriptions/Workspaces/Notifications/Alerts plus the tracked-subscription pause/cancel action and the four Boopy Pro plan billing actions.

**Architecture:** Two `public`-schema SQL views (`admin_user_directory`, `admin_alerts`) join `auth.users` directly so the standard `@refinedev/supabase` data provider can read everything through the admin's own RLS-scoped session — no custom data provider needed. Writes that need to bypass per-workspace RLS (the billing actions, the subscription-status RPC) go through Next.js Route Handlers that re-verify `admin_users` membership via a cookie-based session, then use the Supabase service-role client.

**Tech Stack:** Next.js 16 (App Router), `@refinedev/core` 5.0.12, `@refinedev/nextjs-router` 7.0.5, `@refinedev/supabase` 6.0.2, `@supabase/ssr` 0.12.0, shadcn/ui (Tailwind v4, same tokens as the main app), Stripe SDK (already pinned to `^22.0.1` at the repo root), Vitest for pure-logic unit tests.

**Reference docs:** Design spec at `docs/superpowers/specs/2026-06-18-admin-v2-foundation-design.md` — read it before starting if anything below is ambiguous.

---

## Before you start

- Per `AGENTS.md`, this repo's Next.js has breaking changes from training data — check `node_modules/next/dist/docs/` for anything unfamiliar.
- Route Handler dynamic params are `Promise`-based in this codebase's Next version: `{ params }: { params: Promise<{ id: string }> }`, then `await params`. Every task below follows this.
- All SQL migrations are applied with `npm run db:push` (root `package.json` script, wraps `supabase db push`) from the repo root, **not** from `apps/admin-v2`.
- `apps/admin-v2` is its own npm workspace (root `package.json` has `"workspaces": ["apps/*"]` already) — install/run commands for it use `--workspace @boopy/admin-v2` from the repo root, or `cd apps/admin-v2` directly, matching how `apps/admin` (v1) and `apps/chat` are worked on today.

---

### Task 1: Scaffold `apps/admin-v2` — package, TS config, Next config

**Files:**

- Create: `apps/admin-v2/package.json`
- Create: `apps/admin-v2/tsconfig.json`
- Create: `apps/admin-v2/next.config.ts`
- Create: `apps/admin-v2/vercel.json`
- Create: `apps/admin-v2/postcss.config.mjs`
- Create: `apps/admin-v2/.env.example`
- Create: `apps/admin-v2/.gitignore`

- [ ] **Step 1: Create the directory and package.json**

```json
{
  "name": "@boopy/admin-v2",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3003",
    "build": "next build",
    "start": "next start --port 3003",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "16.2.3",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "@refinedev/core": "^5.0.12",
    "@refinedev/nextjs-router": "^7.0.5",
    "@refinedev/supabase": "^6.0.2",
    "@supabase/ssr": "^0.12.0",
    "@supabase/supabase-js": "^2.103.0",
    "stripe": "^22.0.1",
    "shadcn": "^4.2.0",
    "lucide-react": "^1.8.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.5.0",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4",
    "tw-animate-css": "^1.4.0",
    "typescript": "^5",
    "vitest": "^4.1.4"
  }
}
```

- [ ] **Step 2: Create tsconfig.json** (mirrors the main app's, path alias points at this app's own `src/`)

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create next.config.ts, vercel.json, postcss.config.mjs**

```ts
// apps/admin-v2/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

```json
// apps/admin-v2/vercel.json
{
  "framework": "nextjs",
  "installCommand": "npm install --legacy-peer-deps"
}
```

```js
// apps/admin-v2/postcss.config.mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

- [ ] **Step 4: Create .env.example and .gitignore**

```
# apps/admin-v2/.env.example
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
```

```
# apps/admin-v2/.gitignore
node_modules
.next
.env*.local
*.tsbuildinfo
```

- [ ] **Step 5: Install dependencies and verify the workspace resolves**

Run from repo root: `npm install --workspace @boopy/admin-v2`
Expected: installs succeed, `apps/admin-v2/node_modules` (or hoisted root `node_modules`) contains `@refinedev/core`, `next`, etc. No error output.

- [ ] **Step 6: Commit**

```bash
git add apps/admin-v2/package.json apps/admin-v2/tsconfig.json apps/admin-v2/next.config.ts apps/admin-v2/vercel.json apps/admin-v2/postcss.config.mjs apps/admin-v2/.env.example apps/admin-v2/.gitignore package-lock.json
git commit -m "Scaffold apps/admin-v2 package and base config"
```

---

### Task 2: Design tokens — globals.css, components.json, root layout fonts

**Files:**

- Create: `apps/admin-v2/components.json`
- Create: `apps/admin-v2/src/app/globals.css`
- Create: `apps/admin-v2/src/app/layout.tsx`
- Create: `apps/admin-v2/src/lib/utils.ts`

- [ ] **Step 1: Create components.json** (same shadcn config as the main app, paths adjusted for this app's own `src/`)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "rtl": false,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "menuColor": "default",
  "menuAccent": "subtle",
  "registries": {}
}
```

- [ ] **Step 2: Create globals.css** — copy the main app's design tokens verbatim from `src/app/globals.css:1-119` (Tailwind imports, `@theme inline`, `:root` and `.dark` CSS variables). Skip the `bpPop`/`bpFabBob`/`bpPanelIn` keyframes and their utility classes (lines 121-176) — those are mascot/marketing-page animations specific to the main app, not needed here.

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-manrope), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-geist-mono);
  --font-heading: var(--font-fredoka), system-ui, sans-serif;
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}

:root {
  --background: oklch(0.973 0.008 285);
  --foreground: oklch(0.138 0.028 287);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.138 0.028 287);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.138 0.028 287);
  --primary: oklch(0.549 0.231 281);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.956 0.015 285);
  --secondary-foreground: oklch(0.138 0.028 287);
  --muted: oklch(0.956 0.015 285);
  --muted-foreground: oklch(0.415 0.038 287);
  --accent: oklch(0.96 0.028 281);
  --accent-foreground: oklch(0.498 0.232 280);
  --destructive: oklch(0.609 0.214 21.5);
  --border: oklch(0.933 0.012 285);
  --input: oklch(0.933 0.012 285);
  --ring: oklch(0.765 0.11 279);
  --chart-1: oklch(0.549 0.231 281);
  --chart-2: oklch(0.634 0.164 154);
  --chart-3: oklch(0.685 0.166 52);
  --chart-4: oklch(0.498 0.232 280);
  --chart-5: oklch(0.609 0.214 21);
  --radius: 1.125rem;
  --sidebar: oklch(1 0 0);
  --sidebar-foreground: oklch(0.138 0.028 287);
  --sidebar-primary: oklch(0.549 0.231 281);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.96 0.028 281);
  --sidebar-accent-foreground: oklch(0.498 0.232 280);
  --sidebar-border: oklch(0.933 0.012 285);
  --sidebar-ring: oklch(0.765 0.11 279);
}

.dark {
  --background: oklch(0.16 0.022 285);
  --foreground: oklch(0.971 0.008 285);
  --card: oklch(0.21 0.022 285);
  --card-foreground: oklch(0.971 0.008 285);
  --popover: oklch(0.21 0.022 285);
  --popover-foreground: oklch(0.971 0.008 285);
  --primary: oklch(0.65 0.185 281);
  --primary-foreground: oklch(0.14 0.03 287);
  --secondary: oklch(0.27 0.025 285);
  --secondary-foreground: oklch(0.971 0.008 285);
  --muted: oklch(0.27 0.025 285);
  --muted-foreground: oklch(0.64 0.028 287);
  --accent: oklch(0.28 0.04 281);
  --accent-foreground: oklch(0.78 0.115 279);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.549 0.231 281);
  --chart-1: oklch(0.65 0.185 281);
  --chart-2: oklch(0.72 0.16 154);
  --chart-3: oklch(0.75 0.15 52);
  --chart-4: oklch(0.6 0.19 280);
  --chart-5: oklch(0.7 0.2 21);
  --sidebar: oklch(0.21 0.022 285);
  --sidebar-foreground: oklch(0.971 0.008 285);
  --sidebar-primary: oklch(0.65 0.185 281);
  --sidebar-primary-foreground: oklch(0.971 0.008 285);
  --sidebar-accent: oklch(0.28 0.04 281);
  --sidebar-accent-foreground: oklch(0.78 0.115 279);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.549 0.231 281);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
}
```

- [ ] **Step 3: Create the root layout with the same font loading as the main app**

```tsx
// apps/admin-v2/src/app/layout.tsx
import type { Metadata } from "next";
import { Fredoka, Geist_Mono, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Boopy Admin",
  description: "Internal admin dashboard for Boopy.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${fredoka.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-svh">{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Create lib/utils.ts** (the standard shadcn `cn` helper, required by every generated component)

```ts
// apps/admin-v2/src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 5: Verify the app boots with no page yet (expect 404 on `/`, not a crash)**

Run: `cd apps/admin-v2 && npm run dev`
Then in another terminal: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3003/`
Expected: `404` (no page defined yet — that's correct, confirms Next.js itself started cleanly). Stop the dev server after confirming.

- [ ] **Step 6: Commit**

```bash
git add apps/admin-v2/components.json apps/admin-v2/src/app/globals.css apps/admin-v2/src/app/layout.tsx apps/admin-v2/src/lib/utils.ts
git commit -m "Add admin-v2 design tokens, fonts, and base layout"
```

---

### Task 3: Supabase clients (browser, server, service-role) for admin-v2

**Files:**

- Create: `apps/admin-v2/src/lib/env.ts`
- Create: `apps/admin-v2/src/lib/supabase/client.ts`
- Create: `apps/admin-v2/src/lib/supabase/server.ts`
- Create: `apps/admin-v2/src/lib/supabase/service.ts`
- Test: `apps/admin-v2/src/lib/env.test.ts`
- Create: `apps/admin-v2/vitest.config.ts`

This app needs three different Supabase clients, matching three different trust levels:

1. **Browser client** (`client.ts`) — anon key, cookie session, used by Refine's data provider and the auth provider in the browser.
2. **Server client** (`server.ts`) — anon key, reads the same cookie session server-side (via `@supabase/ssr`), used by `requireAdmin()` (Task 6) to verify the caller without needing the service role.
3. **Service-role client** (`service.ts`) — bypasses RLS entirely, used only inside Route Handlers for the actual privileged writes (RPC calls, Stripe-related billing writes), never for reads that the admin's own session can already do.

- [ ] **Step 1: Write the failing test for env validation**

```ts
// apps/admin-v2/src/lib/env.test.ts
import { describe, expect, it } from "vitest";

import { parseAdminEnv } from "@/lib/env";

describe("parseAdminEnv", () => {
  it("throws when a required var is missing", () => {
    expect(() =>
      parseAdminEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
        SUPABASE_SERVICE_ROLE_KEY: "service-key",
        STRIPE_SECRET_KEY: "sk_test_123",
      })
    ).toThrow();
  });

  it("returns parsed values when all required vars are present", () => {
    const env = parseAdminEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-key",
      STRIPE_SECRET_KEY: "sk_test_123",
    });
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe("https://example.supabase.co");
    expect(env.STRIPE_SECRET_KEY).toBe("sk_test_123");
  });
});
```

- [ ] **Step 2: Create vitest.config.ts so this app's tests are runnable** (root `vitest.config.ts` only includes `src/**/*.test.ts` under the _root_ app — this app needs its own)

```ts
// apps/admin-v2/vitest.config.ts
import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd apps/admin-v2 && npx vitest run src/lib/env.test.ts`
Expected: FAIL with "Cannot find module '@/lib/env'" (file doesn't exist yet).

- [ ] **Step 4: Implement env.ts**

```ts
// apps/admin-v2/src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().trim().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().trim().min(1),
  STRIPE_SECRET_KEY: z.string().trim().min(1),
});

export type AdminEnv = z.infer<typeof envSchema>;

export function parseAdminEnv(source: Record<string, string | undefined>): AdminEnv {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    throw new Error(`Invalid admin-v2 environment variables:\n${result.error.toString()}`);
  }
  return result.data;
}

let cached: AdminEnv | undefined;

export function getEnv(): AdminEnv {
  if (!cached) {
    cached = parseAdminEnv(process.env);
  }
  return cached;
}
```

Note: `zod` isn't in this app's `package.json` dependencies yet from Task 1 — it is (added in Task 1's package.json). No extra install needed.

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd apps/admin-v2 && npx vitest run src/lib/env.test.ts`
Expected: PASS, 2 tests.

- [ ] **Step 6: Implement the three Supabase clients**

```ts
// apps/admin-v2/src/lib/supabase/client.ts
"use client";

import { createBrowserClient } from "@supabase/ssr";

let cached: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!cached) {
    cached = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return cached;
}
```

```ts
// apps/admin-v2/src/lib/supabase/server.ts
import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — session refresh happens in middleware.
          }
        },
      },
    }
  );
}
```

```ts
// apps/admin-v2/src/lib/supabase/service.ts
import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getEnv } from "@/lib/env";

let cached: ReturnType<typeof createClient> | null = null;

/** Bypasses RLS. Only call from Route Handlers, only for the specific writes that need it. */
export function supabaseService() {
  if (!cached) {
    const env = getEnv();
    cached = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
  }
  return cached;
}
```

- [ ] **Step 7: Commit**

```bash
git add apps/admin-v2/src/lib/env.ts apps/admin-v2/src/lib/env.test.ts apps/admin-v2/vitest.config.ts apps/admin-v2/src/lib/supabase/
git commit -m "Add admin-v2 env validation and Supabase client helpers"
```

---

### Task 4: Migration 0016 — admin_users allowlist + additive RLS read policies

**Files:**

- Create: `supabase/migrations/0016_admin_v2_allowlist.sql`

- [ ] **Step 1: Write the migration**

```sql
-- 0016_admin_v2_allowlist.sql
-- Allowlist of users who can access Boopy Admin v2, plus additive read
-- policies granting them select access across workspaces they don't own.
-- These policies are additive: they don't change any existing
-- owner-scoped policy, they just add a second way to qualify for `select`.

create table public.admin_users (
  user_id uuid primary key references auth.users(id),
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- A logged-in user can check whether THEY are an admin (used by the
-- client-side auth check). They cannot list other admins.
create policy "admin_users_can_read_own_row"
on public.admin_users
for select
using (user_id = auth.uid());

create policy "admin_users_can_read_all_workspaces"
on public.workspaces for select
using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

create policy "admin_users_can_read_all_workspace_billing"
on public.workspace_billing for select
using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

create policy "admin_users_can_read_all_groups"
on public.groups for select
using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

create policy "admin_users_can_read_all_subscriptions"
on public.subscriptions for select
using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

create policy "admin_users_can_read_all_notification_jobs"
on public.notification_jobs for select
using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

create policy "admin_users_can_read_all_notification_digest_runs"
on public.notification_digest_runs for select
using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

create policy "admin_users_can_read_all_audit_events"
on public.audit_events for select
using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));
```

- [ ] **Step 2: Apply the migration**

Run from repo root: `npm run db:push`
Expected: output confirms `0016_admin_v2_allowlist.sql` applied with no errors.

- [ ] **Step 3: Add yourself as the first admin** (manual, one-time, via Supabase SQL editor or `psql` — this is intentionally not a UI per the spec)

```sql
insert into public.admin_users (user_id, email)
values ('<your-auth-user-id>', '<your-email>');
```

Get your `user_id` from the Supabase dashboard's Authentication → Users list, or via `select id, email from auth.users where email = '<your-email>';`.

- [ ] **Step 4: Verify the policy works as expected** (run in the Supabase SQL editor as the `postgres` role, simulating both an admin and a non-admin)

```sql
-- Should return all workspaces when run as an admin's JWT (test via the Supabase
-- dashboard's "Run as user" feature, or defer this check to Task 6's manual test
-- once login is wired up).
select count(*) from public.workspaces;
```

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/0016_admin_v2_allowlist.sql
git commit -m "Add admin_users allowlist table and additive RLS read policies"
```

---

### Task 5: Migration 0017 — admin_user_directory and admin_alerts views

**Files:**

- Create: `supabase/migrations/0017_admin_views.sql`

These views join `auth.users` directly in SQL (something PostgREST can't do from the client side), gated by the same `exists (select 1 from admin_users where user_id = auth.uid())` check used in Task 4. A non-admin querying either view gets zero rows; an admin gets everything. This avoids needing a custom Refine data provider for the Users and Alerts resources — both work through the standard `@refinedev/supabase` provider like any other table.

- [ ] **Step 1: Write the migration**

```sql
-- 0017_admin_views.sql

-- One row per Boopy user, joining their workspace + billing state.
-- Read-gated to admin_users members only (exists() check below).
create view public.admin_user_directory as
select
  u.id as user_id,
  u.email,
  u.created_at as joined_at,
  w.id as workspace_id,
  w.name as workspace_name,
  coalesce(wb.plan, 'free') as plan,
  wb.status as billing_status,
  wb.stripe_customer_id,
  wb.stripe_subscription_id,
  wb.admin_paused
from auth.users u
left join public.workspaces w on w.owner_user_id = u.id
left join public.workspace_billing wb on wb.workspace_id = w.id
where exists (select 1 from public.admin_users au where au.user_id = auth.uid());

-- Faithful port of the v1 /api/admin/alerts logic (churned Pro + free workspaces
-- near the 3-subscription limit), as a single queryable view instead of Node-side
-- batched auth.admin.getUserById calls.
create view public.admin_alerts as
select
  'churned_pro' as alert_type,
  w.id as workspace_id,
  w.name as workspace_name,
  u.email,
  'Pro subscription canceled' as detail
from public.workspace_billing wb
join public.workspaces w on w.id = wb.workspace_id
join auth.users u on u.id = w.owner_user_id
where wb.plan = 'pro'
  and wb.status = 'canceled'
  and exists (select 1 from public.admin_users au where au.user_id = auth.uid())
union all
select
  'near_free_limit' as alert_type,
  w.id as workspace_id,
  w.name as workspace_name,
  u.email,
  concat(active_counts.active_count, '/3 active subscriptions (Free plan)') as detail
from (
  select g.workspace_id, count(*) as active_count
  from public.groups g
  join public.subscriptions s on s.group_id = g.id
  where s.status = 'active'
  group by g.workspace_id
  having count(*) >= 2
) active_counts
join public.workspaces w on w.id = active_counts.workspace_id
join auth.users u on u.id = w.owner_user_id
left join public.workspace_billing wb on wb.workspace_id = w.id
where coalesce(wb.plan, 'free') = 'free'
  and exists (select 1 from public.admin_users au where au.user_id = auth.uid());
```

Note: `admin_user_directory` references `wb.admin_paused`, a column added in Task 15. Since migrations apply in numeric order and 0017 runs before 0019, this view will fail to create if applied standalone before that column exists. **Apply migrations in order** (`npm run db:push` applies all pending migrations in sequence, so this is only a concern if you ever apply 0017 in isolation). To keep this task self-contained and runnable independently, add the column now instead of in Task 15:

- [ ] **Step 2: Add the `admin_paused` column here instead of later** (moving it up from where Task 15 originally would have added it, so this view is valid the moment it's created)

```sql
-- continued in the same 0017_admin_views.sql, before the views above
alter table public.workspace_billing
  add column if not exists admin_paused boolean not null default false;
```

Put this `alter table` statement at the **top** of `0017_admin_views.sql`, before the two `create view` statements. (Task 15 below will reference this column as already existing and will not re-add it — it only adds the webhook code change.)

- [ ] **Step 3: Apply the migration**

Run from repo root: `npm run db:push`
Expected: confirms `0017_admin_views.sql` applied, no errors.

- [ ] **Step 4: Manually verify both views return data**

In the Supabase SQL editor, run as the `postgres` role (which bypasses the `exists()` check since `auth.uid()` is null outside a real user session, so expect **zero rows** here — that's correct, it proves the gate works when there's no authenticated admin):

```sql
select count(*) from public.admin_user_directory;
select count(*) from public.admin_alerts;
```

Expected: both return `0` (no `auth.uid()` in the SQL editor's session context unless you explicitly impersonate a user). Re-verify with real row counts once login is wired up in Task 6.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/0017_admin_views.sql
git commit -m "Add admin_user_directory and admin_alerts views, add workspace_billing.admin_paused column"
```

---

### Task 6: Auth — proxy, login page, callback route, not-authorized page, server-side guard

**Files:**

- Create: `apps/admin-v2/src/proxy.ts` (this Next.js version renamed `middleware.ts` → `proxy.ts` with an exported `proxy` function, not `middleware` — confirmed against `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` per AGENTS.md. It must live inside `src/`, at the same level as `src/app/`, not at the project root, since this app uses a `src/` directory — the docs say "or inside `src` if applicable, so that it is located at the same level as `pages` or `app`".)
- Create: `apps/admin-v2/src/lib/admin-guard.ts`
- Create: `apps/admin-v2/src/app/login/page.tsx`
- Create: `apps/admin-v2/src/app/auth/callback/route.ts`
- Create: `apps/admin-v2/src/app/not-authorized/page.tsx`
- Test: `apps/admin-v2/src/lib/admin-guard.test.ts`

`proxy.ts` refreshes the Supabase session cookie on every request (the standard `@supabase/ssr` pattern) and redirects unauthenticated requests to `/login`. The actual "is this user an admin" check happens in two places: client-side in the Refine `authProvider` (Task 7, for UI redirects) and server-side in `requireAdmin()` here (used by every Route Handler that performs a write, Tasks 14/17/18/19/20).

Also note: `server-only` (used by `admin-guard.ts` and the Supabase server/service clients) throws when resolved outside Next.js's bundler, which breaks plain Vitest runs for any module that imports it. `apps/admin-v2/vitest.config.ts` (Task 3) needs a `resolve.alias` entry mapping `"server-only"` to a one-line stub module (`export {};`) at `apps/admin-v2/src/lib/test/server-only-stub.ts` — add both now if you haven't already, before writing the admin-guard test below.

- [ ] **Step 1: Write the failing test for the pure error-classification logic in admin-guard**

`requireAdmin()` itself talks to Supabase so it isn't unit-testable without a live DB — but the status-code mapping it produces is pure and worth locking down, since route handlers branch on it.

```ts
// apps/admin-v2/src/lib/admin-guard.test.ts
import { describe, expect, it } from "vitest";

import { AdminGuardError } from "@/lib/admin-guard";

describe("AdminGuardError", () => {
  it("carries the status code through to the error instance", () => {
    const err = new AdminGuardError("Unauthorized", 401);
    expect(err.message).toBe("Unauthorized");
    expect(err.status).toBe(401);
    expect(err).toBeInstanceOf(Error);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd apps/admin-v2 && npx vitest run src/lib/admin-guard.test.ts`
Expected: FAIL — "Cannot find module '@/lib/admin-guard'".

- [ ] **Step 3: Implement admin-guard.ts**

```ts
// apps/admin-v2/src/lib/admin-guard.ts
import "server-only";

import type { User } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export class AdminGuardError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Throws AdminGuardError(401|403) if the current request isn't from a logged-in admin. */
export async function requireAdmin(): Promise<User> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new AdminGuardError("Unauthorized", 401);
  }

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) {
    throw new AdminGuardError("Forbidden", 403);
  }

  return user;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd apps/admin-v2 && npx vitest run src/lib/admin-guard.test.ts`
Expected: PASS, 1 test.

- [ ] **Step 5: Create src/proxy.ts** (session refresh + redirect-to-login gate; same logic as `apps/chat/middleware.ts` but renamed per this Next.js version's convention — see the file note above)

```ts
// apps/admin-v2/src/proxy.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicPath =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/auth/callback") ||
    request.nextUrl.pathname.startsWith("/not-authorized");

  if (!user && !isPublicPath) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

- [ ] **Step 6: Create the login page** (magic link form, client component)

```tsx
// apps/admin-v2/src/app/login/page.tsx
"use client";

import { useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }
    setStatus("sent");
  }

  return (
    <div className="bg-background flex min-h-svh items-center justify-center">
      <div className="border-border bg-card w-full max-w-sm rounded-2xl border p-8 shadow-sm">
        <h1 className="font-heading text-foreground text-2xl font-semibold">Boopy Admin</h1>
        <p className="text-muted-foreground mt-1 text-sm">Sign in with a magic link.</p>

        {status === "sent" ? (
          <p className="text-foreground mt-6 text-sm">Check your email for a sign-in link.</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@useboopy.com"
              className="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="bg-primary text-primary-foreground w-full rounded-lg px-3 py-2 text-sm font-semibold"
            >
              Send magic link
            </button>
            {status === "error" && <p className="text-destructive text-sm">{errorMessage}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Create the auth callback route** (exchanges the magic-link code for a session, then checks `admin_users`)

```ts
// apps/admin-v2/src/app/auth/callback/route.ts
import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/not-authorized", url.origin));
  }

  return NextResponse.redirect(new URL("/dashboard", url.origin));
}
```

- [ ] **Step 8: Create the not-authorized page**

```tsx
// apps/admin-v2/src/app/not-authorized/page.tsx
export default function NotAuthorizedPage() {
  return (
    <div className="bg-background flex min-h-svh items-center justify-center">
      <div className="max-w-sm text-center">
        <h1 className="font-heading text-foreground text-xl font-semibold">Not authorized</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Your account isn&apos;t on the Boopy Admin allowlist. Ask an existing admin to add you.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Manual end-to-end check**

Run: `cd apps/admin-v2 && npm run dev`, visit `http://localhost:3003/login`, enter the email you added to `admin_users` in Task 4 Step 3, click the magic link from your inbox. Expected: redirected to `/dashboard` (404 for now — that page doesn't exist until Task 7 — but the redirect target proves the allowlist check passed). Try again with a different, non-allowlisted email: expected redirect to `/not-authorized`.

- [ ] **Step 10: Commit**

```bash
git add apps/admin-v2/src/proxy.ts apps/admin-v2/src/lib/admin-guard.ts apps/admin-v2/src/lib/admin-guard.test.ts apps/admin-v2/src/app/login apps/admin-v2/src/app/auth apps/admin-v2/src/app/not-authorized
git commit -m "Add admin-v2 magic-link auth: middleware, login, callback, allowlist gate"
```

---

### Task 7: Refine wiring + dashboard shell

**Files:**

- Create: `apps/admin-v2/src/providers/auth-provider.ts`
- Create: `apps/admin-v2/src/providers/refine-providers.tsx`
- Create: `apps/admin-v2/src/lib/resources.ts`
- Create: `apps/admin-v2/src/app/dashboard/layout.tsx`
- Create: `apps/admin-v2/src/app/dashboard/page.tsx`
- Modify: `apps/admin-v2/src/app/layout.tsx`

- [ ] **Step 1: Install shadcn's sidebar component and its dependencies**

Run: `cd apps/admin-v2 && npx shadcn@latest add sidebar button avatar separator`
Expected: creates `src/components/ui/sidebar.tsx`, `button.tsx`, `avatar.tsx`, `separator.tsx`, plus adds any peer deps (e.g. `@radix-ui/react-*`, `next-themes` if the sidebar block requires it — accept the CLI's prompts to add them) to `package.json`.

- [ ] **Step 2: Define the Refine resources array**

```ts
// apps/admin-v2/src/lib/resources.ts
import type { ResourceProps } from "@refinedev/core";

export const resources: ResourceProps[] = [
  {
    name: "admin_user_directory",
    list: "/dashboard/users",
    show: "/dashboard/users/show/:id",
    meta: { label: "Users" },
  },
  {
    name: "subscriptions",
    list: "/dashboard/subscriptions",
    show: "/dashboard/subscriptions/show/:id",
    meta: { label: "Subscriptions" },
  },
  {
    name: "workspaces",
    list: "/dashboard/workspaces",
    show: "/dashboard/workspaces/show/:id",
    meta: { label: "Workspaces" },
  },
  {
    name: "notification_jobs",
    list: "/dashboard/notifications",
    meta: { label: "Notifications" },
  },
  {
    name: "admin_alerts",
    list: "/dashboard/alerts",
    meta: { label: "Alerts" },
  },
];
```

- [ ] **Step 3: Implement the Refine authProvider**

```ts
// apps/admin-v2/src/providers/auth-provider.ts
"use client";

import type { AuthProvider } from "@refinedev/core";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const authProvider: AuthProvider = {
  login: async ({ email }: { email: string }) => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      return { success: false, error: { name: "LoginError", message: error.message } };
    }
    return { success: true, redirectTo: "/login" };
  },
  logout: async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    return { success: true, redirectTo: "/login" };
  },
  check: async () => {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return { authenticated: false, redirectTo: "/login" };
    }
    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (!adminRow) {
      await supabase.auth.signOut();
      return { authenticated: false, redirectTo: "/not-authorized" };
    }
    return { authenticated: true };
  },
  onError: async (error) => {
    return { error };
  },
  getIdentity: async () => {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    return { id: user.id, name: user.email ?? "" };
  },
};
```

- [ ] **Step 4: Implement the Refine providers wrapper (client component)**

```tsx
// apps/admin-v2/src/providers/refine-providers.tsx
"use client";

import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/nextjs-router";
import { dataProvider, liveProvider } from "@refinedev/supabase";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { resources } from "@/lib/resources";

import { authProvider } from "./auth-provider";

export function RefineProviders({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseBrowserClient();

  return (
    <Refine
      dataProvider={dataProvider(supabase)}
      liveProvider={liveProvider(supabase)}
      routerProvider={routerProvider}
      authProvider={authProvider}
      resources={resources}
      options={{ syncWithLocation: true, warnWhenUnsavedChanges: true }}
    >
      {children}
    </Refine>
  );
}
```

- [ ] **Step 5: Wrap the root layout in the providers**

```tsx
// apps/admin-v2/src/app/layout.tsx
import type { Metadata } from "next";
import { Fredoka, Geist_Mono, Manrope } from "next/font/google";

import { RefineProviders } from "@/providers/refine-providers";

import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Boopy Admin",
  description: "Internal admin dashboard for Boopy.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${fredoka.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-svh">
        <RefineProviders>{children}</RefineProviders>
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Build the dashboard shell using shadcn's Sidebar**

```tsx
// apps/admin-v2/src/app/dashboard/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { resources } from "@/lib/resources";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <span className="font-heading text-sidebar-foreground px-2 text-lg font-semibold">
            Boopy Admin
          </span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {resources.map((resource) => {
                  const href = resource.list as string;
                  return (
                    <SidebarMenuItem key={resource.name}>
                      <SidebarMenuButton asChild isActive={pathname?.startsWith(href)}>
                        <Link href={href}>{resource.meta?.label as string}</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <main className="flex-1 p-8">{children}</main>
    </SidebarProvider>
  );
}
```

```tsx
// apps/admin-v2/src/app/dashboard/page.tsx
export default function DashboardOverviewPage() {
  return (
    <div>
      <h1 className="font-heading text-foreground text-2xl font-semibold">Overview</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Pick a section from the sidebar to get started.
      </p>
    </div>
  );
}
```

- [ ] **Step 7: Manual verification**

Run: `cd apps/admin-v2 && npm run dev`, log in via `/login` with your allowlisted email. Expected: lands on `/dashboard`, sidebar shows Users / Subscriptions / Workspaces / Notifications / Alerts links (all 404 until later tasks build their pages — that's expected at this point).

- [ ] **Step 8: Commit**

```bash
git add apps/admin-v2/src/providers apps/admin-v2/src/lib/resources.ts apps/admin-v2/src/app/dashboard apps/admin-v2/src/app/layout.tsx apps/admin-v2/src/components apps/admin-v2/package.json
git commit -m "Wire up Refine providers, auth provider, and dashboard sidebar shell"
```

---

### Task 8: Users resource — list + show pages

**Files:**

- Create: `apps/admin-v2/src/app/dashboard/users/page.tsx`
- Create: `apps/admin-v2/src/app/dashboard/users/show/[id]/page.tsx`

Queries `admin_user_directory` (Task 5) through the standard data provider — no custom data-fetching code needed, Refine's `useTable`/`useShow` work against it exactly like a table.

- [ ] **Step 1: Install the shadcn table and badge components**

Run: `cd apps/admin-v2 && npx shadcn@latest add table badge card`

- [ ] **Step 2: Build the Users list page**

```tsx
// apps/admin-v2/src/app/dashboard/users/page.tsx
"use client";

import Link from "next/link";
import { useTable } from "@refinedev/core";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type UserRow = {
  user_id: string;
  email: string | null;
  joined_at: string | null;
  workspace_name: string | null;
  plan: "free" | "pro";
  billing_status: string | null;
  admin_paused: boolean;
};

export default function UsersListPage() {
  const { tableQuery } = useTable<UserRow>({
    resource: "admin_user_directory",
    sorters: { initial: [{ field: "joined_at", order: "desc" }] },
    pagination: { pageSize: 50 },
  });

  const rows = tableQuery.data?.data ?? [];

  return (
    <div>
      <h1 className="font-heading text-foreground text-2xl font-semibold">Users</h1>
      <div className="border-border mt-6 rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Workspace</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Billing status</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.user_id}>
                <TableCell>
                  <Link
                    href={`/dashboard/users/show/${row.user_id}`}
                    className="text-primary hover:underline"
                  >
                    {row.email ?? row.user_id}
                  </Link>
                </TableCell>
                <TableCell>{row.workspace_name ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={row.plan === "pro" ? "default" : "secondary"}>
                    {row.plan}
                    {row.admin_paused ? " (paused)" : ""}
                  </Badge>
                </TableCell>
                <TableCell>{row.billing_status ?? "—"}</TableCell>
                <TableCell>
                  {row.joined_at ? new Date(row.joined_at).toLocaleDateString() : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Build the Users show page** (detail view; the Billing panel with the four billing actions is added in Tasks 17-20 — this page just lays out the structure they'll attach to)

```tsx
// apps/admin-v2/src/app/dashboard/users/show/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useShow } from "@refinedev/core";

import { Card } from "@/components/ui/card";

type UserDetail = {
  user_id: string;
  email: string | null;
  joined_at: string | null;
  workspace_id: string | null;
  workspace_name: string | null;
  plan: "free" | "pro";
  billing_status: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  admin_paused: boolean;
};

export default function UserShowPage() {
  const { id } = useParams<{ id: string }>();
  const { query } = useShow<UserDetail>({
    resource: "admin_user_directory",
    id,
    meta: { idColumnName: "user_id" },
  });

  const user = query.data?.data;
  if (query.isLoading) return <p className="text-muted-foreground text-sm">Loading…</p>;
  if (!user) return <p className="text-muted-foreground text-sm">User not found.</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-heading text-foreground text-2xl font-semibold">{user.email}</h1>

      <Card className="p-6">
        <h2 className="text-muted-foreground text-sm font-semibold">Account</h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <dt className="text-muted-foreground">Workspace</dt>
          <dd className="text-foreground">{user.workspace_name ?? "—"}</dd>
          <dt className="text-muted-foreground">Plan</dt>
          <dd className="text-foreground">
            {user.plan}
            {user.admin_paused ? " (paused by admin)" : ""}
          </dd>
          <dt className="text-muted-foreground">Billing status</dt>
          <dd className="text-foreground">{user.billing_status ?? "—"}</dd>
          <dt className="text-muted-foreground">Joined</dt>
          <dd className="text-foreground">
            {user.joined_at ? new Date(user.joined_at).toLocaleDateString() : "—"}
          </dd>
        </dl>
      </Card>

      {/* Billing action panel (Pause/Resume, Cancel/Undo, Cancel & Refund) is added in Tasks 17-20 */}
      <div id="billing-actions-panel" data-workspace-id={user.workspace_id} />
    </div>
  );
}
```

- [ ] **Step 4: Manual verification**

Run: `cd apps/admin-v2 && npm run dev`, log in, visit `/dashboard/users`. Expected: table renders at least your own admin account's row (and any other real users in the database). Click into one: detail page renders.

- [ ] **Step 5: Commit**

```bash
git add apps/admin-v2/src/app/dashboard/users apps/admin-v2/src/components/ui
git commit -m "Add Users list and show pages backed by admin_user_directory view"
```

---

### Task 9: Subscriptions resource — list + show pages

**Files:**

- Create: `apps/admin-v2/src/app/dashboard/subscriptions/page.tsx`
- Create: `apps/admin-v2/src/app/dashboard/subscriptions/show/[id]/page.tsx`

Reads `subscriptions` with the `groups` relation embedded (PostgREST nested select), which works because `subscriptions.group_id` already has a foreign key to `groups.id`.

- [ ] **Step 1: Build the Subscriptions list page**

```tsx
// apps/admin-v2/src/app/dashboard/subscriptions/page.tsx
"use client";

import Link from "next/link";
import { useTable } from "@refinedev/core";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SubscriptionRow = {
  id: string;
  vendor_name: string;
  amount: number;
  currency: string;
  cadence: string;
  status: "active" | "paused" | "cancelled";
  renewal_date: string | null;
  groups: { name: string | null } | null;
};

export default function SubscriptionsListPage() {
  const { tableQuery } = useTable<SubscriptionRow>({
    resource: "subscriptions",
    meta: {
      select: "id, vendor_name, amount, currency, cadence, status, renewal_date, groups(name)",
    },
    sorters: { initial: [{ field: "renewal_date", order: "asc" }] },
    pagination: { pageSize: 50 },
  });

  const rows = tableQuery.data?.data ?? [];

  return (
    <div>
      <h1 className="font-heading text-foreground text-2xl font-semibold">Subscriptions</h1>
      <div className="border-border mt-6 rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Cadence</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Renews</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Link
                    href={`/dashboard/subscriptions/show/${row.id}`}
                    className="text-primary hover:underline"
                  >
                    {row.vendor_name}
                  </Link>
                </TableCell>
                <TableCell>{row.groups?.name ?? "—"}</TableCell>
                <TableCell>
                  {row.amount} {row.currency}
                </TableCell>
                <TableCell>{row.cadence}</TableCell>
                <TableCell>
                  <Badge variant={row.status === "active" ? "default" : "secondary"}>
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {row.renewal_date ? new Date(row.renewal_date).toLocaleDateString() : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build the Subscriptions show page** (the pause/cancel action UI itself is added in Task 14 — this lays out the structure)

```tsx
// apps/admin-v2/src/app/dashboard/subscriptions/show/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useShow } from "@refinedev/core";

import { Card } from "@/components/ui/card";

type SubscriptionDetail = {
  id: string;
  vendor_name: string;
  amount: number;
  currency: string;
  cadence: string;
  status: "active" | "paused" | "cancelled";
  renewal_date: string | null;
  category: string | null;
  notes: string | null;
};

export default function SubscriptionShowPage() {
  const { id } = useParams<{ id: string }>();
  const { query } = useShow<SubscriptionDetail>({ resource: "subscriptions", id });

  const sub = query.data?.data;
  if (query.isLoading) return <p className="text-muted-foreground text-sm">Loading…</p>;
  if (!sub) return <p className="text-muted-foreground text-sm">Subscription not found.</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-heading text-foreground text-2xl font-semibold">{sub.vendor_name}</h1>

      <Card className="p-6">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <dt className="text-muted-foreground">Amount</dt>
          <dd className="text-foreground">
            {sub.amount} {sub.currency} / {sub.cadence}
          </dd>
          <dt className="text-muted-foreground">Status</dt>
          <dd className="text-foreground">{sub.status}</dd>
          <dt className="text-muted-foreground">Renews</dt>
          <dd className="text-foreground">
            {sub.renewal_date ? new Date(sub.renewal_date).toLocaleDateString() : "—"}
          </dd>
        </dl>
      </Card>

      {/* Pause/Cancel action UI added in Task 14 */}
      <div id="subscription-status-actions" data-subscription-id={sub.id} />
    </div>
  );
}
```

- [ ] **Step 3: Manual verification**

Visit `/dashboard/subscriptions`, confirm the list renders with group names, click into one.

- [ ] **Step 4: Commit**

```bash
git add apps/admin-v2/src/app/dashboard/subscriptions
git commit -m "Add Subscriptions list and show pages"
```

---

### Task 10: Workspaces/Groups resource — list + show pages

**Files:**

- Create: `apps/admin-v2/src/app/dashboard/workspaces/page.tsx`
- Create: `apps/admin-v2/src/app/dashboard/workspaces/show/[id]/page.tsx`

- [ ] **Step 1: Build the Workspaces list page**

```tsx
// apps/admin-v2/src/app/dashboard/workspaces/page.tsx
"use client";

import Link from "next/link";
import { useTable } from "@refinedev/core";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type WorkspaceRow = {
  id: string;
  name: string;
  created_at: string;
};

export default function WorkspacesListPage() {
  const { tableQuery } = useTable<WorkspaceRow>({
    resource: "workspaces",
    sorters: { initial: [{ field: "created_at", order: "desc" }] },
    pagination: { pageSize: 50 },
  });

  const rows = tableQuery.data?.data ?? [];

  return (
    <div>
      <h1 className="font-heading text-foreground text-2xl font-semibold">Workspaces</h1>
      <div className="border-border mt-6 rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Link
                    href={`/dashboard/workspaces/show/${row.id}`}
                    className="text-primary hover:underline"
                  >
                    {row.name}
                  </Link>
                </TableCell>
                <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build the Workspaces show page** (lists the workspace's groups inline)

```tsx
// apps/admin-v2/src/app/dashboard/workspaces/show/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useList, useShow } from "@refinedev/core";

import { Card } from "@/components/ui/card";

type WorkspaceDetail = { id: string; name: string; created_at: string };
type GroupRow = { id: string; name: string };

export default function WorkspaceShowPage() {
  const { id } = useParams<{ id: string }>();
  const { query } = useShow<WorkspaceDetail>({ resource: "workspaces", id });
  const { result: groupsResult } = useList<GroupRow>({
    resource: "groups",
    filters: [{ field: "workspace_id", operator: "eq", value: id }],
  });

  const workspace = query.data?.data;
  if (query.isLoading) return <p className="text-muted-foreground text-sm">Loading…</p>;
  if (!workspace) return <p className="text-muted-foreground text-sm">Workspace not found.</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-heading text-foreground text-2xl font-semibold">{workspace.name}</h1>

      <Card className="p-6">
        <h2 className="text-muted-foreground text-sm font-semibold">Groups</h2>
        <ul className="text-foreground mt-3 space-y-1 text-sm">
          {(groupsResult?.data ?? []).map((group) => (
            <li key={group.id}>{group.name}</li>
          ))}
          {(groupsResult?.data ?? []).length === 0 && (
            <li className="text-muted-foreground">No groups yet.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Manual verification**

Visit `/dashboard/workspaces`, click into one, confirm its groups list renders.

- [ ] **Step 4: Commit**

```bash
git add apps/admin-v2/src/app/dashboard/workspaces
git commit -m "Add Workspaces list and show pages"
```

---

### Task 11: Notifications resource — list page

**Files:**

- Create: `apps/admin-v2/src/app/dashboard/notifications/page.tsx`

- [ ] **Step 1: Install the shadcn tabs component** (for filtering by status)

Run: `cd apps/admin-v2 && npx shadcn@latest add tabs`

- [ ] **Step 2: Build the Notifications list page**

```tsx
// apps/admin-v2/src/app/dashboard/notifications/page.tsx
"use client";

import { useState } from "react";
import { useTable } from "@refinedev/core";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type NotificationJobRow = {
  id: string;
  channel: string;
  status: "pending" | "sent" | "failed";
  error: string | null;
  attempt_count: number;
  scheduled_for: string | null;
  workspaces: { name: string | null } | null;
};

const STATUSES = ["pending", "sent", "failed"] as const;

export default function NotificationsListPage() {
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("failed");

  const { tableQuery } = useTable<NotificationJobRow>({
    resource: "notification_jobs",
    meta: { select: "id, channel, status, error, attempt_count, scheduled_for, workspaces(name)" },
    filters: { permanent: [{ field: "status", operator: "eq", value: status }] },
    sorters: { initial: [{ field: "scheduled_for", order: "desc" }] },
    pagination: { pageSize: 50 },
  });

  const rows = tableQuery.data?.data ?? [];

  return (
    <div>
      <h1 className="font-heading text-foreground text-2xl font-semibold">Notifications</h1>

      <Tabs value={status} onValueChange={(v) => setStatus(v as typeof status)} className="mt-4">
        <TabsList>
          {STATUSES.map((s) => (
            <TabsTrigger key={s} value={s}>
              {s}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="border-border mt-6 rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workspace</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Attempts</TableHead>
              <TableHead>Error</TableHead>
              <TableHead>Scheduled for</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.workspaces?.name ?? "—"}</TableCell>
                <TableCell>{row.channel}</TableCell>
                <TableCell>
                  <Badge variant={row.status === "failed" ? "destructive" : "secondary"}>
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell>{row.attempt_count}</TableCell>
                <TableCell className="max-w-xs truncate">{row.error ?? "—"}</TableCell>
                <TableCell>
                  {row.scheduled_for ? new Date(row.scheduled_for).toLocaleString() : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Manual verification**

Visit `/dashboard/notifications`, confirm the "failed" tab is selected by default and the table updates when switching tabs.

- [ ] **Step 4: Commit**

```bash
git add apps/admin-v2/src/app/dashboard/notifications apps/admin-v2/src/components/ui/tabs.tsx
git commit -m "Add Notifications list page with status filter tabs"
```

---

### Task 12: Alerts resource — list page

**Files:**

- Create: `apps/admin-v2/src/app/dashboard/alerts/page.tsx`

Reads the `admin_alerts` view from Task 5 — no joins needed client-side, the view already did them in SQL.

- [ ] **Step 1: Build the Alerts list page**

```tsx
// apps/admin-v2/src/app/dashboard/alerts/page.tsx
"use client";

import { useTable } from "@refinedev/core";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AlertRow = {
  alert_type: "churned_pro" | "near_free_limit";
  workspace_id: string;
  workspace_name: string | null;
  email: string | null;
  detail: string;
};

export default function AlertsListPage() {
  const { tableQuery } = useTable<AlertRow>({
    resource: "admin_alerts",
    pagination: { pageSize: 100 },
  });

  const rows = tableQuery.data?.data ?? [];

  return (
    <div>
      <h1 className="font-heading text-foreground text-2xl font-semibold">Alerts</h1>
      <div className="border-border mt-6 rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Workspace</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={`${row.alert_type}-${row.workspace_id}`}>
                <TableCell>
                  <Badge variant={row.alert_type === "churned_pro" ? "destructive" : "secondary"}>
                    {row.alert_type === "churned_pro" ? "Churned Pro" : "Near free limit"}
                  </Badge>
                </TableCell>
                <TableCell>{row.workspace_name ?? "—"}</TableCell>
                <TableCell>{row.email ?? "—"}</TableCell>
                <TableCell>{row.detail}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Manual verification**

Visit `/dashboard/alerts`, confirm rows render (or an empty table if there's no churn/near-limit data yet — that's a valid empty state, not a bug).

- [ ] **Step 3: Commit**

```bash
git add apps/admin-v2/src/app/dashboard/alerts
git commit -m "Add Alerts list page backed by admin_alerts view"
```

---

**Checkpoint: Tasks 1-12 form a complete, independently testable foundation.** At this point, Admin v2 is a deployable app where an allowlisted admin can log in and view (read-only) every core resource. Tasks 13 onward add the write actions.

---

### Task 13: Migration 0018 — admin_set_subscription_status RPC

**Files:**

- Create: `supabase/migrations/0018_admin_subscription_status_rpc.sql`

This is the one piece of business logic in this plan that lives entirely in SQL (atomicity across three tables — `subscriptions`, `notification_jobs`, `audit_events` — is much simpler as a single transaction inside a Postgres function than as multiple round trips from Node). There's no existing SQL test harness in this repo (no `.sql` test files anywhere in `supabase/migrations`), so this task is verified manually per the spec's testing plan rather than with Vitest — Task 14 extracts the _request validation_ logic (which status values are acceptable) into a pure, unit-tested TypeScript function instead, since that's the part of this feature that can break without touching the database.

- [ ] **Step 1: Write the migration**

```sql
-- 0018_admin_subscription_status_rpc.sql
-- Atomically pauses/cancels a user's tracked vendor subscription on an admin's
-- behalf: updates the subscription's status, cancels any orphaned pending
-- notification_jobs for it (nothing else in the codebase does this today — see
-- the design spec's rationale), and writes an audit_events row.
create or replace function public.admin_set_subscription_status(
  p_subscription_id uuid,
  p_new_status public.subscription_status,
  p_admin_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace_id uuid;
  v_old_status public.subscription_status;
  v_jobs_cancelled integer;
begin
  if p_new_status not in ('paused', 'cancelled') then
    raise exception 'admin_set_subscription_status only supports paused or cancelled, got %', p_new_status;
  end if;

  select g.workspace_id, s.status
    into v_workspace_id, v_old_status
  from public.subscriptions s
  join public.groups g on g.id = s.group_id
  where s.id = p_subscription_id
  for update of s;

  if v_workspace_id is null then
    raise exception 'Subscription % not found or has no workspace', p_subscription_id;
  end if;

  update public.subscriptions
  set status = p_new_status
  where id = p_subscription_id;

  with cancelled as (
    update public.notification_jobs
    set status = 'failed',
        error = format('Subscription %s by admin', p_new_status)
    where subscription_id = p_subscription_id
      and status = 'pending'
    returning 1
  )
  select count(*) into v_jobs_cancelled from cancelled;

  insert into public.audit_events (workspace_id, actor_user_id, action, entity_type, entity_id, metadata)
  values (
    v_workspace_id,
    p_admin_user_id,
    'admin_set_subscription_status',
    'subscription',
    p_subscription_id,
    jsonb_build_object(
      'old_status', v_old_status,
      'new_status', p_new_status,
      'jobs_cancelled_count', v_jobs_cancelled
    )
  );

  return jsonb_build_object(
    'old_status', v_old_status,
    'new_status', p_new_status,
    'jobs_cancelled_count', v_jobs_cancelled
  );
end;
$$;
```

- [ ] **Step 2: Apply the migration**

Run from repo root: `npm run db:push`
Expected: confirms `0018_admin_subscription_status_rpc.sql` applied, no errors.

- [ ] **Step 3: Manually verify the RPC end-to-end in the Supabase SQL editor**

```sql
-- Find a real subscription id and a pending notification_job tied to it first, e.g.:
select id from public.subscriptions where status = 'active' limit 1;

-- Then call the RPC (replace the uuids):
select public.admin_set_subscription_status(
  '<subscription-id>',
  'paused',
  '<your-admin-user-id>'
);

-- Verify: subscription status flipped, any pending job for it is now 'failed',
-- and a new audit_events row exists.
select status from public.subscriptions where id = '<subscription-id>';
select status, error from public.notification_jobs where subscription_id = '<subscription-id>';
select * from public.audit_events where entity_id = '<subscription-id>' order by created_at desc limit 1;
```

Expected: subscription status is `paused`, any previously-pending job for it is now `failed` with the expected error message, and exactly one new `audit_events` row exists with the correct `old_status`/`new_status`/`jobs_cancelled_count` in `metadata`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0018_admin_subscription_status_rpc.sql
git commit -m "Add admin_set_subscription_status RPC for tracked-subscription pause/cancel"
```

---

### Task 14: Tracked-subscription pause/cancel — route handler + UI

**Files:**

- Create: `apps/admin-v2/src/lib/subscription-actions.ts`
- Create: `apps/admin-v2/src/app/api/admin/subscriptions/[id]/status/route.ts`
- Modify: `apps/admin-v2/src/app/dashboard/subscriptions/show/[id]/page.tsx`
- Test: `apps/admin-v2/src/lib/subscription-actions.test.ts`

- [ ] **Step 1: Write the failing test for the pure request-validation logic**

```ts
// apps/admin-v2/src/lib/subscription-actions.test.ts
import { describe, expect, it } from "vitest";

import { validateStatusChangeRequest } from "@/lib/subscription-actions";

describe("validateStatusChangeRequest", () => {
  it("accepts paused and cancelled", () => {
    expect(validateStatusChangeRequest({ status: "paused" })).toEqual({
      valid: true,
      status: "paused",
    });
    expect(validateStatusChangeRequest({ status: "cancelled" })).toEqual({
      valid: true,
      status: "cancelled",
    });
  });

  it("rejects active (this action only pauses/cancels, never reactivates)", () => {
    expect(validateStatusChangeRequest({ status: "active" })).toEqual({
      valid: false,
      error: "status must be 'paused' or 'cancelled'",
    });
  });

  it("rejects missing or malformed input", () => {
    expect(validateStatusChangeRequest({})).toEqual({
      valid: false,
      error: "status must be 'paused' or 'cancelled'",
    });
    expect(validateStatusChangeRequest(null)).toEqual({
      valid: false,
      error: "status must be 'paused' or 'cancelled'",
    });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd apps/admin-v2 && npx vitest run src/lib/subscription-actions.test.ts`
Expected: FAIL — "Cannot find module '@/lib/subscription-actions'".

- [ ] **Step 3: Implement the pure validation function**

```ts
// apps/admin-v2/src/lib/subscription-actions.ts
export type StatusChangeResult =
  | { valid: true; status: "paused" | "cancelled" }
  | { valid: false; error: string };

export function validateStatusChangeRequest(body: unknown): StatusChangeResult {
  const status = (body as { status?: unknown } | null)?.status;
  if (status === "paused" || status === "cancelled") {
    return { valid: true, status };
  }
  return { valid: false, error: "status must be 'paused' or 'cancelled'" };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd apps/admin-v2 && npx vitest run src/lib/subscription-actions.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Implement the route handler**

```ts
// apps/admin-v2/src/app/api/admin/subscriptions/[id]/status/route.ts
import { NextResponse } from "next/server";

import { AdminGuardError, requireAdmin } from "@/lib/admin-guard";
import { validateStatusChangeRequest } from "@/lib/subscription-actions";
import { supabaseService } from "@/lib/supabase/service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (err) {
    if (err instanceof AdminGuardError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const validation = validateStatusChangeRequest(body);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const supabase = supabaseService();
  const { data, error } = await supabase.rpc("admin_set_subscription_status", {
    p_subscription_id: id,
    p_new_status: validation.status,
    p_admin_user_id: admin.id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, result: data });
}
```

- [ ] **Step 6: Add the pause/cancel buttons to the Subscription show page**

```tsx
// apps/admin-v2/src/app/dashboard/subscriptions/show/[id]/page.tsx
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useInvalidate, useShow } from "@refinedev/core";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SubscriptionDetail = {
  id: string;
  vendor_name: string;
  amount: number;
  currency: string;
  cadence: string;
  status: "active" | "paused" | "cancelled";
  renewal_date: string | null;
  category: string | null;
  notes: string | null;
};

export default function SubscriptionShowPage() {
  const { id } = useParams<{ id: string }>();
  const { query } = useShow<SubscriptionDetail>({ resource: "subscriptions", id });
  const invalidate = useInvalidate();
  const [pending, setPending] = useState<"paused" | "cancelled" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const sub = query.data?.data;

  async function changeStatus(newStatus: "paused" | "cancelled") {
    if (!sub) return;
    const confirmed = window.confirm(
      `${newStatus === "paused" ? "Pause" : "Cancel"} this subscription? Any pending reminders for it will also be cancelled.`
    );
    if (!confirmed) return;

    setPending(newStatus);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/subscriptions/${sub.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) {
        setActionError(json.error ?? "Action failed");
        return;
      }
      await invalidate({ resource: "subscriptions", invalidates: ["detail", "list"], id: sub.id });
    } finally {
      setPending(null);
    }
  }

  if (query.isLoading) return <p className="text-muted-foreground text-sm">Loading…</p>;
  if (!sub) return <p className="text-muted-foreground text-sm">Subscription not found.</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-heading text-foreground text-2xl font-semibold">{sub.vendor_name}</h1>

      <Card className="p-6">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <dt className="text-muted-foreground">Amount</dt>
          <dd className="text-foreground">
            {sub.amount} {sub.currency} / {sub.cadence}
          </dd>
          <dt className="text-muted-foreground">Status</dt>
          <dd className="text-foreground">{sub.status}</dd>
          <dt className="text-muted-foreground">Renews</dt>
          <dd className="text-foreground">
            {sub.renewal_date ? new Date(sub.renewal_date).toLocaleDateString() : "—"}
          </dd>
        </dl>
      </Card>

      {sub.status !== "cancelled" && (
        <Card className="p-6">
          <h2 className="text-muted-foreground text-sm font-semibold">Admin actions</h2>
          <p className="text-muted-foreground mt-1 text-xs">
            Acts on this tracked subscription only — not the user&apos;s Boopy Pro plan.
          </p>
          <div className="mt-4 flex gap-3">
            {sub.status !== "paused" && (
              <Button
                variant="secondary"
                disabled={pending !== null}
                onClick={() => changeStatus("paused")}
              >
                {pending === "paused" ? "Pausing…" : "Pause"}
              </Button>
            )}
            <Button
              variant="destructive"
              disabled={pending !== null}
              onClick={() => changeStatus("cancelled")}
            >
              {pending === "cancelled" ? "Cancelling…" : "Cancel"}
            </Button>
          </div>
          {actionError && <p className="text-destructive mt-3 text-sm">{actionError}</p>}
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Manual verification**

Visit a subscription's show page, click Pause, confirm the dialog, confirm the status updates in the UI without a full page reload (via `invalidate`). Check the `notification_jobs` and `audit_events` tables directly to confirm Task 13's RPC ran correctly end-to-end through the HTTP layer this time, not just the SQL editor.

- [ ] **Step 8: Commit**

```bash
git add apps/admin-v2/src/lib/subscription-actions.ts apps/admin-v2/src/lib/subscription-actions.test.ts apps/admin-v2/src/app/api/admin/subscriptions apps/admin-v2/src/app/dashboard/subscriptions/show
git commit -m "Add tracked-subscription pause/cancel action: route handler and UI"
```

---

### Task 15: Webhook change (main app) — respect `admin_paused`

**Files:**

- Modify: `src/lib/billing/plan.ts` (repo root, main app — not `apps/admin-v2`)
- Modify: `src/lib/billing/plan.test.ts`
- Modify: `src/app/api/stripe/webhook/route.ts`

This is the one required change to existing app code (per the spec). Extracted into the existing `src/lib/billing/plan.ts` module as a pure function rather than left inline in the webhook handler, so it's unit-testable without mocking Stripe — same pattern already used by `resolvePlan` in that file.

- [ ] **Step 1: Write the failing test, appended to the existing plan.test.ts**

```ts
// src/lib/billing/plan.test.ts — add this describe block at the end of the file
describe("derivePlanFromSubscriptionStatus", () => {
  it("grants pro for active or trialing status when not admin-paused", () => {
    expect(derivePlanFromSubscriptionStatus("active", false)).toBe("pro");
    expect(derivePlanFromSubscriptionStatus("trialing", false)).toBe("pro");
  });

  it("falls back to free for any other status", () => {
    expect(derivePlanFromSubscriptionStatus("canceled", false)).toBe("free");
    expect(derivePlanFromSubscriptionStatus("past_due", false)).toBe("free");
  });

  it("forces free when admin_paused is true, regardless of Stripe's reported status", () => {
    expect(derivePlanFromSubscriptionStatus("active", true)).toBe("free");
    expect(derivePlanFromSubscriptionStatus("trialing", true)).toBe("free");
  });
});
```

Also add `derivePlanFromSubscriptionStatus` to the existing `import { ... } from "@/lib/billing/plan"` line at the top of the test file.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/billing/plan.test.ts`
Expected: FAIL — `derivePlanFromSubscriptionStatus is not a function`.

- [ ] **Step 3: Implement the function in plan.ts**

```ts
// src/lib/billing/plan.ts — add this export
/**
 * Stripe's pause_collection stops invoicing but does NOT change
 * subscription.status, so webhook events during an admin-initiated pause
 * would otherwise silently re-derive plan: 'pro'. adminPaused overrides that.
 */
export function derivePlanFromSubscriptionStatus(
  stripeStatus: string,
  adminPaused: boolean
): WorkspacePlan {
  if (adminPaused) return "free";
  const isActive = stripeStatus === "active" || stripeStatus === "trialing";
  return isActive ? "pro" : "free";
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/lib/billing/plan.test.ts`
Expected: PASS, all tests including the 3 new ones.

- [ ] **Step 5: Use the new function in the webhook handler**

```ts
// src/app/api/stripe/webhook/route.ts
// Replace the import line:
import { getEnv } from "@/lib/env";
import { derivePlanFromSubscriptionStatus } from "@/lib/billing/plan";
import { log } from "@/lib/log";
import { getStripe } from "@/lib/stripe";
import { supabaseService } from "@/lib/supabase/server";
```

```ts
// src/app/api/stripe/webhook/route.ts
// Replace the body of the `customer.subscription.updated`/`deleted` block:
if (
  event.type === "customer.subscription.updated" ||
  event.type === "customer.subscription.deleted"
) {
  const subscription = event.data.object as Stripe.Subscription;
  const workspaceId = subscription.metadata?.workspace_id;
  if (workspaceId) {
    const { data: existing } = await supabase
      .from("workspace_billing")
      .select("admin_paused")
      .eq("workspace_id", workspaceId)
      .maybeSingle();

    const plan = derivePlanFromSubscriptionStatus(
      subscription.status,
      existing?.admin_paused ?? false
    );
    await supabase.from("workspace_billing").upsert({
      workspace_id: workspaceId,
      stripe_customer_id:
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id,
      stripe_subscription_id: subscription.id,
      stripe_price_id: subscription.items.data[0]?.price.id ?? null,
      plan,
      status: subscription.status,
    });
  }
}
```

- [ ] **Step 6: Run the full root test suite to confirm nothing else broke**

Run: `npx vitest run`
Expected: all existing tests still pass, plus the 3 new ones.

- [ ] **Step 7: Commit**

```bash
git add src/lib/billing/plan.ts src/lib/billing/plan.test.ts src/app/api/stripe/webhook/route.ts
git commit -m "Make Stripe webhook respect admin_paused when deriving plan"
```

---

### Task 16: Pro plan Pause/Resume — route handlers + UI

**Files:**

- Create: `apps/admin-v2/src/lib/stripe.ts`
- Create: `apps/admin-v2/src/lib/billing-actions.ts`
- Create: `apps/admin-v2/src/app/api/admin/billing/[workspaceId]/pause/route.ts`
- Create: `apps/admin-v2/src/app/api/admin/billing/[workspaceId]/resume/route.ts`
- Create: `apps/admin-v2/src/components/billing-panel.tsx`
- Modify: `apps/admin-v2/src/app/dashboard/users/show/[id]/page.tsx`
- Test: `apps/admin-v2/src/lib/billing-actions.test.ts`

`apps/admin-v2` is a separate deployment from the root app and can't import `src/lib/billing/plan.ts` across the app boundary, so the small plan-derivation rule is intentionally duplicated here as its own pure, tested function — same pattern as `apps/chat` already duplicating its own Supabase client setup rather than reaching into the root app's `src/lib`.

- [ ] **Step 1: Write the failing test**

```ts
// apps/admin-v2/src/lib/billing-actions.test.ts
import { describe, expect, it } from "vitest";

import { computeResumePlan } from "@/lib/billing-actions";

describe("computeResumePlan", () => {
  it("grants pro for active or trialing", () => {
    expect(computeResumePlan("active")).toBe("pro");
    expect(computeResumePlan("trialing")).toBe("pro");
  });

  it("falls back to free for any other status", () => {
    expect(computeResumePlan("canceled")).toBe("free");
    expect(computeResumePlan("past_due")).toBe("free");
    expect(computeResumePlan("incomplete_expired")).toBe("free");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd apps/admin-v2 && npx vitest run src/lib/billing-actions.test.ts`
Expected: FAIL — "Cannot find module '@/lib/billing-actions'".

- [ ] **Step 3: Implement the Stripe client helper**

```ts
// apps/admin-v2/src/lib/stripe.ts
import "server-only";

import Stripe from "stripe";

import { getEnv } from "@/lib/env";

let cached: Stripe | null = null;

export function getStripe() {
  if (!cached) {
    const env = getEnv();
    cached = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2026-03-25.dahlia" });
  }
  return cached;
}
```

- [ ] **Step 4: Implement computeResumePlan in billing-actions.ts**

```ts
// apps/admin-v2/src/lib/billing-actions.ts
export function computeResumePlan(stripeStatus: string): "free" | "pro" {
  const isActive = stripeStatus === "active" || stripeStatus === "trialing";
  return isActive ? "pro" : "free";
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd apps/admin-v2 && npx vitest run src/lib/billing-actions.test.ts`
Expected: PASS, 2 tests.

- [ ] **Step 6: Implement the Pause route handler**

```ts
// apps/admin-v2/src/app/api/admin/billing/[workspaceId]/pause/route.ts
import { NextResponse } from "next/server";

import { AdminGuardError, requireAdmin } from "@/lib/admin-guard";
import { getStripe } from "@/lib/stripe";
import { supabaseService } from "@/lib/supabase/service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (err) {
    if (err instanceof AdminGuardError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  const { workspaceId } = await params;
  const supabase = supabaseService();

  const { data: billing, error: billingError } = await supabase
    .from("workspace_billing")
    .select("stripe_subscription_id, plan")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (billingError || !billing?.stripe_subscription_id) {
    return NextResponse.json(
      { error: "No Stripe subscription found for this workspace" },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  await stripe.subscriptions.update(billing.stripe_subscription_id, {
    pause_collection: { behavior: "void" },
  });

  await supabase
    .from("workspace_billing")
    .update({ admin_paused: true, plan: "free" })
    .eq("workspace_id", workspaceId);

  await supabase.from("audit_events").insert({
    workspace_id: workspaceId,
    actor_user_id: admin.id,
    action: "admin_pause_pro_plan",
    entity_type: "workspace_billing",
    entity_id: workspaceId,
    metadata: {
      old_plan: billing.plan,
      new_plan: "free",
      stripe_subscription_id: billing.stripe_subscription_id,
    },
  });

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 7: Implement the Resume route handler**

```ts
// apps/admin-v2/src/app/api/admin/billing/[workspaceId]/resume/route.ts
import { NextResponse } from "next/server";

import { AdminGuardError, requireAdmin } from "@/lib/admin-guard";
import { computeResumePlan } from "@/lib/billing-actions";
import { getStripe } from "@/lib/stripe";
import { supabaseService } from "@/lib/supabase/service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (err) {
    if (err instanceof AdminGuardError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  const { workspaceId } = await params;
  const supabase = supabaseService();

  const { data: billing, error: billingError } = await supabase
    .from("workspace_billing")
    .select("stripe_subscription_id, plan")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (billingError || !billing?.stripe_subscription_id) {
    return NextResponse.json(
      { error: "No Stripe subscription found for this workspace" },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.update(billing.stripe_subscription_id, {
    pause_collection: null,
  });

  const newPlan = computeResumePlan(subscription.status);

  await supabase
    .from("workspace_billing")
    .update({ admin_paused: false, plan: newPlan, status: subscription.status })
    .eq("workspace_id", workspaceId);

  await supabase.from("audit_events").insert({
    workspace_id: workspaceId,
    actor_user_id: admin.id,
    action: "admin_resume_pro_plan",
    entity_type: "workspace_billing",
    entity_id: workspaceId,
    metadata: {
      old_plan: billing.plan,
      new_plan: newPlan,
      stripe_subscription_id: billing.stripe_subscription_id,
    },
  });

  return NextResponse.json({ ok: true, plan: newPlan });
}
```

- [ ] **Step 8: Create the billing panel component** (this is the panel that Tasks 17-19 will keep extending with more buttons)

```tsx
// apps/admin-v2/src/components/billing-panel.tsx
"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type BillingPanelProps = {
  workspaceId: string;
  plan: "free" | "pro";
  adminPaused: boolean;
  onChanged: () => void;
};

export function BillingPanel({ workspaceId, plan, adminPaused, onChanged }: BillingPanelProps) {
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function call(action: "pause" | "resume") {
    setPending(action);
    setError(null);
    try {
      const res = await fetch(`/api/admin/billing/${workspaceId}/${action}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Action failed");
        return;
      }
      onChanged();
    } finally {
      setPending(null);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-muted-foreground text-sm font-semibold">Billing</h2>
      <p className="text-muted-foreground mt-1 text-xs">
        Acts on this user&apos;s Boopy Pro plan (Stripe), not their tracked subscriptions.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        {adminPaused ? (
          <Button disabled={pending !== null} onClick={() => call("resume")}>
            {pending === "resume" ? "Resuming…" : "Resume Pro plan"}
          </Button>
        ) : (
          plan === "pro" && (
            <Button
              variant="secondary"
              disabled={pending !== null}
              onClick={() => {
                if (window.confirm("Pause billing and drop this user to Free immediately?")) {
                  call("pause");
                }
              }}
            >
              {pending === "pause" ? "Pausing…" : "Pause Pro plan"}
            </Button>
          )
        )}
      </div>

      {error && <p className="text-destructive mt-3 text-sm">{error}</p>}
    </Card>
  );
}
```

- [ ] **Step 9: Attach the panel to the Users show page**

```tsx
// apps/admin-v2/src/app/dashboard/users/show/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useShow } from "@refinedev/core";

import { BillingPanel } from "@/components/billing-panel";
import { Card } from "@/components/ui/card";

type UserDetail = {
  user_id: string;
  email: string | null;
  joined_at: string | null;
  workspace_id: string | null;
  workspace_name: string | null;
  plan: "free" | "pro";
  billing_status: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  admin_paused: boolean;
};

export default function UserShowPage() {
  const { id } = useParams<{ id: string }>();
  const { query } = useShow<UserDetail>({
    resource: "admin_user_directory",
    id,
    meta: { idColumnName: "user_id" },
  });

  const user = query.data?.data;
  if (query.isLoading) return <p className="text-muted-foreground text-sm">Loading…</p>;
  if (!user) return <p className="text-muted-foreground text-sm">User not found.</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-heading text-foreground text-2xl font-semibold">{user.email}</h1>

      <Card className="p-6">
        <h2 className="text-muted-foreground text-sm font-semibold">Account</h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <dt className="text-muted-foreground">Workspace</dt>
          <dd className="text-foreground">{user.workspace_name ?? "—"}</dd>
          <dt className="text-muted-foreground">Plan</dt>
          <dd className="text-foreground">
            {user.plan}
            {user.admin_paused ? " (paused by admin)" : ""}
          </dd>
          <dt className="text-muted-foreground">Billing status</dt>
          <dd className="text-foreground">{user.billing_status ?? "—"}</dd>
          <dt className="text-muted-foreground">Joined</dt>
          <dd className="text-foreground">
            {user.joined_at ? new Date(user.joined_at).toLocaleDateString() : "—"}
          </dd>
        </dl>
      </Card>

      {user.workspace_id && (
        <BillingPanel
          workspaceId={user.workspace_id}
          plan={user.plan}
          adminPaused={user.admin_paused}
          onChanged={() => query.refetch()}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 10: Manual verification**

On a test workspace with an active Stripe Pro subscription (use Stripe test mode), click "Pause Pro plan", confirm `workspace_billing.admin_paused = true` and `plan = 'free'` immediately, and that the badge on the Users list page (Task 8) now shows "(paused)". Click "Resume Pro plan", confirm it flips back.

- [ ] **Step 11: Commit**

```bash
git add apps/admin-v2/src/lib/stripe.ts apps/admin-v2/src/lib/billing-actions.ts apps/admin-v2/src/lib/billing-actions.test.ts apps/admin-v2/src/app/api/admin/billing apps/admin-v2/src/components/billing-panel.tsx apps/admin-v2/src/app/dashboard/users/show
git commit -m "Add Pro plan Pause/Resume billing actions"
```

---

### Task 17: Pro plan Cancel/Undo cancellation — route handlers + UI

**Files:**

- Create: `apps/admin-v2/src/app/api/admin/billing/[workspaceId]/cancel/route.ts`
- Create: `apps/admin-v2/src/app/api/admin/billing/[workspaceId]/undo-cancel/route.ts`
- Modify: `apps/admin-v2/src/components/billing-panel.tsx`

Both actions only ever toggle `cancel_at_period_end` — they don't touch `plan`/`status` directly. The existing webhook (now updated in Task 15) handles the eventual `customer.subscription.deleted` event at period end automatically, so these route handlers don't write to `workspace_billing` themselves beyond the audit log.

- [ ] **Step 1: Implement the Cancel route handler**

```ts
// apps/admin-v2/src/app/api/admin/billing/[workspaceId]/cancel/route.ts
import { NextResponse } from "next/server";

import { AdminGuardError, requireAdmin } from "@/lib/admin-guard";
import { getStripe } from "@/lib/stripe";
import { supabaseService } from "@/lib/supabase/service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (err) {
    if (err instanceof AdminGuardError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  const { workspaceId } = await params;
  const supabase = supabaseService();

  const { data: billing, error: billingError } = await supabase
    .from("workspace_billing")
    .select("stripe_subscription_id, plan")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (billingError || !billing?.stripe_subscription_id) {
    return NextResponse.json(
      { error: "No Stripe subscription found for this workspace" },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  await stripe.subscriptions.update(billing.stripe_subscription_id, {
    cancel_at_period_end: true,
  });

  await supabase.from("audit_events").insert({
    workspace_id: workspaceId,
    actor_user_id: admin.id,
    action: "admin_cancel_pro_plan_at_period_end",
    entity_type: "workspace_billing",
    entity_id: workspaceId,
    metadata: { stripe_subscription_id: billing.stripe_subscription_id },
  });

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Implement the Undo cancellation route handler**

```ts
// apps/admin-v2/src/app/api/admin/billing/[workspaceId]/undo-cancel/route.ts
import { NextResponse } from "next/server";

import { AdminGuardError, requireAdmin } from "@/lib/admin-guard";
import { getStripe } from "@/lib/stripe";
import { supabaseService } from "@/lib/supabase/service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (err) {
    if (err instanceof AdminGuardError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  const { workspaceId } = await params;
  const supabase = supabaseService();

  const { data: billing, error: billingError } = await supabase
    .from("workspace_billing")
    .select("stripe_subscription_id")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (billingError || !billing?.stripe_subscription_id) {
    return NextResponse.json(
      { error: "No Stripe subscription found for this workspace" },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  await stripe.subscriptions.update(billing.stripe_subscription_id, {
    cancel_at_period_end: false,
  });

  await supabase.from("audit_events").insert({
    workspace_id: workspaceId,
    actor_user_id: admin.id,
    action: "admin_undo_cancel_pro_plan",
    entity_type: "workspace_billing",
    entity_id: workspaceId,
    metadata: { stripe_subscription_id: billing.stripe_subscription_id },
  });

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Add Cancel/Undo buttons to the billing panel**

The panel needs to know whether a cancellation is already scheduled, which means fetching the live Stripe subscription rather than relying on `workspace_billing` (which has no `cancel_at_period_end` column — that's intentional per the spec, this state lives in Stripe only). Add a small client-side fetch on mount.

```tsx
// apps/admin-v2/src/components/billing-panel.tsx
"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type BillingPanelProps = {
  workspaceId: string;
  plan: "free" | "pro";
  adminPaused: boolean;
  onChanged: () => void;
};

export function BillingPanel({ workspaceId, plan, adminPaused, onChanged }: BillingPanelProps) {
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/billing/${workspaceId}/status`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setCancelAtPeriodEnd(json.cancelAtPeriodEnd ?? false);
      })
      .catch(() => {
        if (!cancelled) setCancelAtPeriodEnd(false);
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  async function call(action: "pause" | "resume" | "cancel" | "undo-cancel") {
    setPending(action);
    setError(null);
    try {
      const res = await fetch(`/api/admin/billing/${workspaceId}/${action}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Action failed");
        return;
      }
      if (action === "cancel") setCancelAtPeriodEnd(true);
      if (action === "undo-cancel") setCancelAtPeriodEnd(false);
      onChanged();
    } finally {
      setPending(null);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-muted-foreground text-sm font-semibold">Billing</h2>
      <p className="text-muted-foreground mt-1 text-xs">
        Acts on this user&apos;s Boopy Pro plan (Stripe), not their tracked subscriptions.
      </p>

      {cancelAtPeriodEnd && (
        <p className="text-foreground mt-3 text-sm">
          Scheduled to cancel at the end of the current billing period.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        {adminPaused ? (
          <Button disabled={pending !== null} onClick={() => call("resume")}>
            {pending === "resume" ? "Resuming…" : "Resume Pro plan"}
          </Button>
        ) : (
          plan === "pro" && (
            <>
              <Button
                variant="secondary"
                disabled={pending !== null}
                onClick={() => {
                  if (window.confirm("Pause billing and drop this user to Free immediately?")) {
                    call("pause");
                  }
                }}
              >
                {pending === "pause" ? "Pausing…" : "Pause Pro plan"}
              </Button>

              {cancelAtPeriodEnd ? (
                <Button
                  variant="secondary"
                  disabled={pending !== null}
                  onClick={() => call("undo-cancel")}
                >
                  {pending === "undo-cancel" ? "Undoing…" : "Undo cancellation"}
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  disabled={pending !== null}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Cancel at the end of the current billing period? The user keeps Pro access until then."
                      )
                    ) {
                      call("cancel");
                    }
                  }}
                >
                  {pending === "cancel" ? "Cancelling…" : "Cancel (end of period)"}
                </Button>
              )}
            </>
          )
        )}
      </div>

      {error && <p className="text-destructive mt-3 text-sm">{error}</p>}
    </Card>
  );
}
```

- [ ] **Step 4: Add the small status route handler the panel just started calling**

```ts
// apps/admin-v2/src/app/api/admin/billing/[workspaceId]/status/route.ts
import { NextResponse } from "next/server";

import { AdminGuardError, requireAdmin } from "@/lib/admin-guard";
import { getStripe } from "@/lib/stripe";
import { supabaseService } from "@/lib/supabase/service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof AdminGuardError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  const { workspaceId } = await params;
  const supabase = supabaseService();

  const { data: billing } = await supabase
    .from("workspace_billing")
    .select("stripe_subscription_id")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (!billing?.stripe_subscription_id) {
    return NextResponse.json({ cancelAtPeriodEnd: false });
  }

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(billing.stripe_subscription_id);

  return NextResponse.json({ cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false });
}
```

(File note: this `status/route.ts` was referenced by Step 3's `fetch` before being defined — that's expected ordering for this step-by-step format; create this file as part of this same step so the panel's fetch has somewhere to land before you move on to manual verification.)

- [ ] **Step 5: Manual verification**

On a test workspace with an active Pro subscription, click "Cancel (end of period)", confirm the panel shows "Scheduled to cancel..." and the button changes to "Undo cancellation". Click it, confirm the schedule clears. Check Stripe's dashboard directly to confirm `cancel_at_period_end` toggled correctly both ways.

- [ ] **Step 6: Commit**

```bash
git add apps/admin-v2/src/app/api/admin/billing apps/admin-v2/src/components/billing-panel.tsx
git commit -m "Add Pro plan Cancel/Undo cancellation billing actions"
```

---

### Task 18: Pro plan Cancel & Refund (standard, 15-day window) — preview + commit

**Files:**

- Create: `apps/admin-v2/src/lib/refund.ts`
- Create: `apps/admin-v2/src/app/api/admin/billing/[workspaceId]/refund/route.ts`
- Create: `apps/admin-v2/src/components/refund-dialog.tsx`
- Modify: `apps/admin-v2/src/components/billing-panel.tsx`
- Test: `apps/admin-v2/src/lib/refund.test.ts`

The eligibility window and the invoice-to-refund-target mapping are both pure and exactly the kind of logic that's easy to get subtly wrong (off-by-one on the day boundary, or refunding against the wrong Stripe field) — both get unit tests before any Stripe wiring.

- [ ] **Step 1: Write the failing tests**

```ts
// apps/admin-v2/src/lib/refund.test.ts
import { describe, expect, it } from "vitest";

import { extractRefundTarget, isWithinRefundWindow, sumRefundableAmount } from "@/lib/refund";

describe("isWithinRefundWindow", () => {
  const FIFTEEN_DAYS_SECONDS = 15 * 24 * 60 * 60;

  it("is eligible exactly at the boundary", () => {
    const start = 1_000_000;
    const now = start + FIFTEEN_DAYS_SECONDS;
    expect(isWithinRefundWindow(start, now)).toBe(true);
  });

  it("is eligible well within the window", () => {
    expect(isWithinRefundWindow(1_000_000, 1_000_000 + 60 * 60)).toBe(true);
  });

  it("is not eligible one second past the boundary", () => {
    const start = 1_000_000;
    const now = start + FIFTEEN_DAYS_SECONDS + 1;
    expect(isWithinRefundWindow(start, now)).toBe(false);
  });
});

describe("sumRefundableAmount", () => {
  it("sums amount_paid across invoices", () => {
    expect(sumRefundableAmount([{ amount_paid: 1900 }, { amount_paid: 1900 }])).toBe(3800);
  });

  it("returns 0 for no invoices", () => {
    expect(sumRefundableAmount([])).toBe(0);
  });
});

describe("extractRefundTarget", () => {
  it("prefers payment_intent when present", () => {
    expect(extractRefundTarget({ payment_intent: "pi_123", charge: "ch_456" })).toEqual({
      type: "payment_intent",
      id: "pi_123",
    });
  });

  it("falls back to charge when payment_intent is absent", () => {
    expect(extractRefundTarget({ payment_intent: null, charge: "ch_456" })).toEqual({
      type: "charge",
      id: "ch_456",
    });
  });

  it("returns null when neither is present", () => {
    expect(extractRefundTarget({ payment_intent: null, charge: null })).toBeNull();
  });

  it("handles expanded object references by extracting their id", () => {
    expect(extractRefundTarget({ payment_intent: { id: "pi_789" }, charge: null })).toEqual({
      type: "payment_intent",
      id: "pi_789",
    });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd apps/admin-v2 && npx vitest run src/lib/refund.test.ts`
Expected: FAIL — "Cannot find module '@/lib/refund'".

- [ ] **Step 3: Implement refund.ts**

```ts
// apps/admin-v2/src/lib/refund.ts
const REFUND_WINDOW_DAYS = 15;
const REFUND_WINDOW_SECONDS = REFUND_WINDOW_DAYS * 24 * 60 * 60;

/** Both timestamps are Unix seconds, matching Stripe's wire format. */
export function isWithinRefundWindow(
  subscriptionStartUnixSeconds: number,
  nowUnixSeconds: number
): boolean {
  return nowUnixSeconds - subscriptionStartUnixSeconds <= REFUND_WINDOW_SECONDS;
}

export function sumRefundableAmount(invoices: Array<{ amount_paid: number }>): number {
  return invoices.reduce((total, invoice) => total + invoice.amount_paid, 0);
}

type StripeIdRef = string | { id: string } | null | undefined;

export type RefundTarget = { type: "payment_intent" | "charge"; id: string } | null;

function resolveId(ref: StripeIdRef): string | null {
  if (!ref) return null;
  return typeof ref === "string" ? ref : ref.id;
}

/** Modern Stripe accounts refund via payment_intent; charge is kept as a fallback for older invoices. */
export function extractRefundTarget(invoice: {
  payment_intent?: StripeIdRef;
  charge?: StripeIdRef;
}): RefundTarget {
  const paymentIntentId = resolveId(invoice.payment_intent);
  if (paymentIntentId) return { type: "payment_intent", id: paymentIntentId };

  const chargeId = resolveId(invoice.charge);
  if (chargeId) return { type: "charge", id: chargeId };

  return null;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd apps/admin-v2 && npx vitest run src/lib/refund.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 5: Implement the GET (preview) / POST (commit) route handler**

```ts
// apps/admin-v2/src/app/api/admin/billing/[workspaceId]/refund/route.ts
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { AdminGuardError, requireAdmin } from "@/lib/admin-guard";
import { extractRefundTarget, isWithinRefundWindow, sumRefundableAmount } from "@/lib/refund";
import { getStripe } from "@/lib/stripe";
import { supabaseService } from "@/lib/supabase/service";

async function loadEligibility(workspaceId: string) {
  const supabase = supabaseService();
  const { data: billing } = await supabase
    .from("workspace_billing")
    .select("stripe_subscription_id, plan")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (!billing?.stripe_subscription_id || billing.plan !== "pro") {
    return { eligible: false as const, reason: "No active Pro subscription found" };
  }

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(billing.stripe_subscription_id);
  const eligible = isWithinRefundWindow(subscription.start_date, Math.floor(Date.now() / 1000));

  const invoices = await stripe.invoices.list({
    subscription: billing.stripe_subscription_id,
    status: "paid",
    limit: 100,
  });

  return {
    eligible,
    stripeSubscriptionId: billing.stripe_subscription_id,
    invoices: invoices.data,
    totalRefundable: sumRefundableAmount(invoices.data),
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof AdminGuardError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  const { workspaceId } = await params;
  const result = await loadEligibility(workspaceId);

  if (!result.eligible) {
    return NextResponse.json({
      eligible: false,
      reason: "reason" in result ? result.reason : "Outside the 15-day refund window",
    });
  }

  return NextResponse.json({
    eligible: true,
    totalRefundable: result.totalRefundable,
    invoiceCount: result.invoices?.length ?? 0,
  });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (err) {
    if (err instanceof AdminGuardError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  const { workspaceId } = await params;
  const result = await loadEligibility(workspaceId);

  if (!result.eligible || !result.invoices || !result.stripeSubscriptionId) {
    return NextResponse.json(
      { error: "reason" in result ? result.reason : "Outside the 15-day refund window" },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  const refunded: Array<{ invoiceId: string; refundId: string; amount: number }> = [];
  const failed: Array<{ invoiceId: string; error: string }> = [];

  for (const invoice of result.invoices as Stripe.Invoice[]) {
    const target = extractRefundTarget(invoice);
    if (!target) {
      failed.push({
        invoiceId: invoice.id ?? "unknown",
        error: "No payment_intent or charge on invoice",
      });
      break;
    }
    try {
      const refund = await stripe.refunds.create({ [target.type]: target.id });
      refunded.push({
        invoiceId: invoice.id ?? "unknown",
        refundId: refund.id,
        amount: invoice.amount_paid,
      });
    } catch (err) {
      failed.push({
        invoiceId: invoice.id ?? "unknown",
        error: err instanceof Error ? err.message : "Refund failed",
      });
      break;
    }
  }

  if (failed.length > 0) {
    return NextResponse.json(
      { error: "One or more refunds failed; subscription was NOT cancelled.", refunded, failed },
      { status: 502 }
    );
  }

  await stripe.subscriptions.cancel(result.stripeSubscriptionId);

  const totalRefunded = refunded.reduce((sum, r) => sum + r.amount, 0);
  const supabase = supabaseService();
  await supabase.from("audit_events").insert({
    workspace_id: workspaceId,
    actor_user_id: admin.id,
    action: "admin_cancel_and_refund",
    entity_type: "workspace_billing",
    entity_id: workspaceId,
    metadata: {
      stripe_subscription_id: result.stripeSubscriptionId,
      refunded_charges: refunded,
      refunded_total_amount: totalRefunded,
    },
  });

  return NextResponse.json({ ok: true, refundedTotal: totalRefunded });
}
```

- [ ] **Step 6: Build the confirmation dialog component**

```tsx
// apps/admin-v2/src/components/refund-dialog.tsx
"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type RefundDialogProps = {
  workspaceId: string;
  onClose: () => void;
  onDone: () => void;
};

type Preview =
  | { eligible: true; totalRefundable: number; invoiceCount: number }
  | { eligible: false; reason: string };

export function RefundDialog({ workspaceId, onClose, onDone }: RefundDialogProps) {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/billing/${workspaceId}/refund`)
      .then((res) => res.json())
      .then(setPreview);
  }, [workspaceId]);

  async function confirm() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/billing/${workspaceId}/refund`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Refund failed");
        return;
      }
      onDone();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="border-border bg-card w-full max-w-sm rounded-2xl border p-6">
        <h2 className="font-heading text-foreground text-lg font-semibold">Cancel &amp; Refund</h2>

        {!preview && <p className="text-muted-foreground mt-4 text-sm">Checking eligibility…</p>}

        {preview && !preview.eligible && (
          <p className="text-destructive mt-4 text-sm">Not eligible: {preview.reason}</p>
        )}

        {preview && preview.eligible && (
          <p className="text-foreground mt-4 text-sm">
            This will refund {(preview.totalRefundable / 100).toFixed(2)} across{" "}
            {preview.invoiceCount} invoice(s) and cancel the subscription immediately.
          </p>
        )}

        {error && <p className="text-destructive mt-3 text-sm">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Close
          </Button>
          {preview?.eligible && (
            <Button variant="destructive" onClick={confirm} disabled={submitting}>
              {submitting ? "Refunding…" : "Confirm refund & cancel"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Wire the dialog into the billing panel**

```tsx
// apps/admin-v2/src/components/billing-panel.tsx
// Add to the imports:
import { RefundDialog } from "@/components/refund-dialog";

// Add state inside the component body:
const [refundDialogOpen, setRefundDialogOpen] = useState(false);

// Add a button alongside the Cancel/Undo buttons (inside the `plan === "pro"` branch,
// after the cancel/undo-cancel block):
<Button variant="destructive" disabled={pending !== null} onClick={() => setRefundDialogOpen(true)}>
  Cancel & Refund
</Button>;

// Add at the end of the returned JSX, just before the closing </Card>:
{
  refundDialogOpen && (
    <RefundDialog
      workspaceId={workspaceId}
      onClose={() => setRefundDialogOpen(false)}
      onDone={() => {
        setRefundDialogOpen(false);
        onChanged();
      }}
    />
  );
}
```

- [ ] **Step 8: Manual verification**

In Stripe test mode, create a subscription that started less than 15 days ago, confirm the dialog shows it as eligible with the correct total. Confirm it, verify the subscription is cancelled in Stripe and a refund appears for each invoice. Separately, test against a subscription older than 15 days and confirm the dialog shows "Not eligible".

- [ ] **Step 9: Commit**

```bash
git add apps/admin-v2/src/lib/refund.ts apps/admin-v2/src/lib/refund.test.ts apps/admin-v2/src/app/api/admin/billing apps/admin-v2/src/components/refund-dialog.tsx apps/admin-v2/src/components/billing-panel.tsx
git commit -m "Add standard Cancel & Refund billing action (15-day window)"
```

---

### Task 19: Pro plan Cancel & Refund — manual override

**Files:**

- Modify: `apps/admin-v2/src/lib/refund.ts`
- Modify: `apps/admin-v2/src/lib/refund.test.ts`
- Create: `apps/admin-v2/src/app/api/admin/billing/[workspaceId]/refund-override/route.ts`
- Create: `apps/admin-v2/src/components/refund-override-dialog.tsx`
- Modify: `apps/admin-v2/src/components/billing-panel.tsx`

- [ ] **Step 1: Write the failing tests for the override's validation logic**

```ts
// apps/admin-v2/src/lib/refund.test.ts — add at the end of the file
import { validateOverrideRequest } from "@/lib/refund";

describe("validateOverrideRequest", () => {
  const chargeLookup = {
    ch_1: { amountRefundable: 1900 },
    ch_2: { amountRefundable: 1500 },
  };

  it("requires a non-empty reason", () => {
    expect(
      validateOverrideRequest(
        { reason: "", selections: [{ chargeId: "ch_1", amount: 1900 }] },
        chargeLookup
      )
    ).toEqual({ valid: false, error: "A reason is required for manual override refunds" });

    expect(
      validateOverrideRequest(
        { reason: "   ", selections: [{ chargeId: "ch_1", amount: 1900 }] },
        chargeLookup
      )
    ).toEqual({ valid: false, error: "A reason is required for manual override refunds" });
  });

  it("requires at least one selected charge", () => {
    expect(validateOverrideRequest({ reason: "Goodwill", selections: [] }, chargeLookup)).toEqual({
      valid: false,
      error: "Select at least one charge to refund",
    });
  });

  it("rejects an amount exceeding what's left refundable on a charge", () => {
    expect(
      validateOverrideRequest(
        { reason: "Goodwill", selections: [{ chargeId: "ch_1", amount: 2000 }] },
        chargeLookup
      )
    ).toEqual({ valid: false, error: "Amount for ch_1 exceeds what's refundable (1900)" });
  });

  it("rejects a non-positive amount", () => {
    expect(
      validateOverrideRequest(
        { reason: "Goodwill", selections: [{ chargeId: "ch_1", amount: 0 }] },
        chargeLookup
      )
    ).toEqual({ valid: false, error: "Amount for ch_1 must be greater than 0" });
  });

  it("rejects a charge id not found in the lookup", () => {
    expect(
      validateOverrideRequest(
        { reason: "Goodwill", selections: [{ chargeId: "ch_unknown", amount: 100 }] },
        chargeLookup
      )
    ).toEqual({ valid: false, error: "Unknown charge: ch_unknown" });
  });

  it("accepts a valid multi-charge request", () => {
    expect(
      validateOverrideRequest(
        {
          reason: "Goodwill gesture per support escalation #4821",
          selections: [
            { chargeId: "ch_1", amount: 1900 },
            { chargeId: "ch_2", amount: 500 },
          ],
        },
        chargeLookup
      )
    ).toEqual({ valid: true });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd apps/admin-v2 && npx vitest run src/lib/refund.test.ts`
Expected: FAIL — `validateOverrideRequest is not a function`.

- [ ] **Step 3: Implement validateOverrideRequest in refund.ts**

```ts
// apps/admin-v2/src/lib/refund.ts — add at the end of the file
export type OverrideSelection = { chargeId: string; amount: number };
export type OverrideRequest = { reason: string; selections: OverrideSelection[] };
export type ChargeLookup = Record<string, { amountRefundable: number }>;

export type OverrideValidation = { valid: true } | { valid: false; error: string };

export function validateOverrideRequest(
  request: OverrideRequest,
  chargeLookup: ChargeLookup
): OverrideValidation {
  if (request.reason.trim().length === 0) {
    return { valid: false, error: "A reason is required for manual override refunds" };
  }
  if (request.selections.length === 0) {
    return { valid: false, error: "Select at least one charge to refund" };
  }
  for (const selection of request.selections) {
    const charge = chargeLookup[selection.chargeId];
    if (!charge) {
      return { valid: false, error: `Unknown charge: ${selection.chargeId}` };
    }
    if (selection.amount <= 0) {
      return { valid: false, error: `Amount for ${selection.chargeId} must be greater than 0` };
    }
    if (selection.amount > charge.amountRefundable) {
      return {
        valid: false,
        error: `Amount for ${selection.chargeId} exceeds what's refundable (${charge.amountRefundable})`,
      };
    }
  }
  return { valid: true };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd apps/admin-v2 && npx vitest run src/lib/refund.test.ts`
Expected: PASS, all tests including the 6 new ones.

- [ ] **Step 5: Implement the GET (preview) / POST (commit) route handler**

```ts
// apps/admin-v2/src/app/api/admin/billing/[workspaceId]/refund-override/route.ts
import { NextResponse } from "next/server";

import { AdminGuardError, requireAdmin } from "@/lib/admin-guard";
import type { ChargeLookup, OverrideRequest } from "@/lib/refund";
import { validateOverrideRequest } from "@/lib/refund";
import { getStripe } from "@/lib/stripe";
import { supabaseService } from "@/lib/supabase/service";

async function loadCustomer(workspaceId: string) {
  const supabase = supabaseService();
  const { data: billing } = await supabase
    .from("workspace_billing")
    .select("stripe_customer_id, stripe_subscription_id")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  return billing;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof AdminGuardError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  const { workspaceId } = await params;
  const billing = await loadCustomer(workspaceId);
  if (!billing?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No Stripe customer found for this workspace" },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  const charges = await stripe.charges.list({ customer: billing.stripe_customer_id, limit: 100 });

  const payments = charges.data
    .filter((c) => c.paid && !c.refunded)
    .map((c) => ({
      chargeId: c.id,
      amount: c.amount,
      amountRefundable: c.amount - c.amount_refunded,
      currency: c.currency,
      created: c.created,
      invoiceId: typeof c.invoice === "string" ? c.invoice : (c.invoice?.id ?? null),
    }));

  return NextResponse.json({ payments });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (err) {
    if (err instanceof AdminGuardError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  const { workspaceId } = await params;
  const billing = await loadCustomer(workspaceId);
  if (!billing?.stripe_customer_id || !billing.stripe_subscription_id) {
    return NextResponse.json({ error: "No Stripe customer/subscription found" }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as OverrideRequest | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const stripe = getStripe();
  const charges = await stripe.charges.list({ customer: billing.stripe_customer_id, limit: 100 });
  const chargeLookup: ChargeLookup = {};
  for (const c of charges.data) {
    chargeLookup[c.id] = { amountRefundable: c.amount - c.amount_refunded };
  }

  const validation = validateOverrideRequest(body, chargeLookup);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const refunded: Array<{ chargeId: string; refundId: string; amount: number }> = [];
  const failed: Array<{ chargeId: string; error: string }> = [];

  for (const selection of body.selections) {
    try {
      const refund = await stripe.refunds.create({
        charge: selection.chargeId,
        amount: selection.amount,
      });
      refunded.push({
        chargeId: selection.chargeId,
        refundId: refund.id,
        amount: selection.amount,
      });
    } catch (err) {
      failed.push({
        chargeId: selection.chargeId,
        error: err instanceof Error ? err.message : "Refund failed",
      });
      break;
    }
  }

  if (failed.length > 0) {
    return NextResponse.json(
      { error: "One or more refunds failed; subscription was NOT cancelled.", refunded, failed },
      { status: 502 }
    );
  }

  await stripe.subscriptions.cancel(billing.stripe_subscription_id);

  const totalRefunded = refunded.reduce((sum, r) => sum + r.amount, 0);
  const supabase = supabaseService();
  await supabase.from("audit_events").insert({
    workspace_id: workspaceId,
    actor_user_id: admin.id,
    action: "admin_cancel_and_refund_override",
    entity_type: "workspace_billing",
    entity_id: workspaceId,
    metadata: {
      override: true,
      reason: body.reason,
      stripe_subscription_id: billing.stripe_subscription_id,
      refunded_charges: refunded,
      refunded_total_amount: totalRefunded,
    },
  });

  return NextResponse.json({ ok: true, refundedTotal: totalRefunded });
}
```

- [ ] **Step 6: Build the override dialog** (payment history table + manual amounts + required reason)

```tsx
// apps/admin-v2/src/components/refund-override-dialog.tsx
"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type Payment = {
  chargeId: string;
  amount: number;
  amountRefundable: number;
  currency: string;
  created: number;
  invoiceId: string | null;
};

type RefundOverrideDialogProps = {
  workspaceId: string;
  onClose: () => void;
  onDone: () => void;
};

export function RefundOverrideDialog({ workspaceId, onClose, onDone }: RefundOverrideDialogProps) {
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/billing/${workspaceId}/refund-override`)
      .then((res) => res.json())
      .then((json) => setPayments(json.payments ?? []));
  }, [workspaceId]);

  function toggle(payment: Payment) {
    setSelected((prev) => {
      const next = { ...prev };
      if (payment.chargeId in next) {
        delete next[payment.chargeId];
      } else {
        next[payment.chargeId] = payment.amountRefundable;
      }
      return next;
    });
  }

  function setAmount(chargeId: string, amount: number) {
    setSelected((prev) => ({ ...prev, [chargeId]: amount }));
  }

  const total = Object.values(selected).reduce((sum, v) => sum + v, 0);

  async function confirm() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/billing/${workspaceId}/refund-override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
          selections: Object.entries(selected).map(([chargeId, amount]) => ({ chargeId, amount })),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Refund failed");
        return;
      }
      onDone();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="border-border bg-card w-full max-w-lg rounded-2xl border p-6">
        <h2 className="font-heading text-foreground text-lg font-semibold">
          Manual override refund
        </h2>
        <p className="bg-destructive/10 text-destructive mt-1 rounded-lg p-3 text-xs">
          This bypasses the standard 15-day refund policy. Use only for special/manual cases. This
          action is logged with your admin account.
        </p>

        <label className="text-foreground mt-4 block text-sm font-medium">
          Reason (required)
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="border-input bg-background mt-1 w-full rounded-lg border p-2 text-sm"
            rows={2}
          />
        </label>

        <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
          {!payments && <p className="text-muted-foreground text-sm">Loading payment history…</p>}
          {payments?.length === 0 && (
            <p className="text-muted-foreground text-sm">No refundable payments found.</p>
          )}
          {payments?.map((payment) => (
            <div
              key={payment.chargeId}
              className="border-border flex items-center gap-3 rounded-lg border p-2"
            >
              <input
                type="checkbox"
                checked={payment.chargeId in selected}
                onChange={() => toggle(payment)}
              />
              <div className="text-foreground flex-1 text-xs">
                <div>{new Date(payment.created * 1000).toLocaleDateString()}</div>
                <div className="text-muted-foreground">
                  Refundable: {(payment.amountRefundable / 100).toFixed(2)} {payment.currency}
                </div>
              </div>
              {payment.chargeId in selected && (
                <input
                  type="number"
                  min={1}
                  max={payment.amountRefundable}
                  value={selected[payment.chargeId]}
                  onChange={(e) => setAmount(payment.chargeId, Number(e.target.value))}
                  className="border-input bg-background w-24 rounded-lg border p-1 text-right text-sm"
                />
              )}
            </div>
          ))}
        </div>

        <p className="text-foreground mt-3 text-sm font-medium">
          Total to refund: {(total / 100).toFixed(2)}
        </p>

        {error && <p className="text-destructive mt-3 text-sm">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Close
          </Button>
          <Button
            variant="destructive"
            onClick={confirm}
            disabled={
              submitting || reason.trim().length === 0 || Object.keys(selected).length === 0
            }
          >
            {submitting ? "Refunding…" : "Confirm override refund & cancel"}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Wire the override dialog into the billing panel as a secondary option**

```tsx
// apps/admin-v2/src/components/billing-panel.tsx
// Add to the imports:
import { RefundOverrideDialog } from "@/components/refund-override-dialog";

// Add state inside the component body:
const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);

// Add below the existing "Cancel & Refund" button, available whenever there's
// billing history at all (not gated to plan === "pro", since a past customer
// who's already free/cancelled may still need a goodwill refund):
<button
  type="button"
  className="text-muted-foreground text-xs underline"
  onClick={() => setOverrideDialogOpen(true)}
>
  Use manual override
</button>;

// Add at the end of the returned JSX, alongside the standard RefundDialog render:
{
  overrideDialogOpen && (
    <RefundOverrideDialog
      workspaceId={workspaceId}
      onClose={() => setOverrideDialogOpen(false)}
      onDone={() => {
        setOverrideDialogOpen(false);
        onChanged();
      }}
    />
  );
}
```

- [ ] **Step 8: Manual verification**

In Stripe test mode, on a subscription older than 15 days (so the standard path would reject it), open "Use manual override", confirm the full payment history renders, select a charge, edit its amount down to a partial value, confirm a refund without a reason is blocked (button stays disabled), fill in a reason, confirm the refund succeeds and the subscription cancels. Try entering an amount greater than what's refundable on a charge and confirm Stripe (or the 400 response from `validateOverrideRequest`) rejects it before any refund call is made.

- [ ] **Step 9: Commit**

```bash
git add apps/admin-v2/src/lib/refund.ts apps/admin-v2/src/lib/refund.test.ts apps/admin-v2/src/app/api/admin/billing apps/admin-v2/src/components/refund-override-dialog.tsx apps/admin-v2/src/components/billing-panel.tsx
git commit -m "Add manual override variant of Cancel & Refund"
```

---

### Task 20: Deploy `apps/admin-v2` as its own Vercel project

**Files:** none (infrastructure step)

- [ ] **Step 1: Run the full test suite and typecheck for admin-v2**

Run: `cd apps/admin-v2 && npx vitest run && npm run typecheck`
Expected: all tests pass (env, admin-guard, subscription-actions, billing-actions, refund — roughly 20 tests across the 5 test files written in Tasks 3/6/14/16/18/19), typecheck reports no errors.

- [ ] **Step 2: Run the full test suite for the root app** (Task 15 touched root app code)

Run: `npx vitest run` (from repo root)
Expected: all existing tests plus the 3 new `derivePlanFromSubscriptionStatus` tests pass.

- [ ] **Step 3: Create a new Vercel project for admin-v2**

Run: `cd apps/admin-v2 && vercel link` (interactive — choose "Create a new project", name it e.g. `boopy-admin-v2`, link to the same team/org as the other Boopy projects)
Expected: creates `apps/admin-v2/.vercel/project.json`.

- [ ] **Step 4: Set production environment variables**

Run from `apps/admin-v2`:

```bash
printf '%s' '<your-supabase-url>' | vercel env add NEXT_PUBLIC_SUPABASE_URL production
printf '%s' '<your-supabase-anon-key>' | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
printf '%s' '<your-supabase-service-role-key>' | vercel env add SUPABASE_SERVICE_ROLE_KEY production
printf '%s' '<your-stripe-secret-key>' | vercel env add STRIPE_SECRET_KEY production
```

Use `printf`, not `echo`, to avoid the BOM-prepending issue documented in this repo's history with `apps/admin` (v1).

- [ ] **Step 5: Deploy to production**

Run: `cd apps/admin-v2 && vercel deploy --prod`
Expected: build succeeds, deployment reaches `READY` state.

- [ ] **Step 6: Smoke test the live deployment**

Visit the deployed URL's `/login`, sign in with your allowlisted email, confirm you land on `/dashboard` and every sidebar link (Users, Subscriptions, Workspaces, Notifications, Alerts) renders data without errors.

- [ ] **Step 7: Commit anything Vercel's CLI added** (if `vercel link` created a `.vercel/project.json` you want tracked — check this repo's convention first, since `apps/admin`'s `.vercel/` directory may be gitignored)

Run: `git status apps/admin-v2/.vercel`
If untracked and the repo's `.gitignore` already excludes `.vercel/` globally (check root `.gitignore`), no action needed — Vercel project linkage doesn't need to be committed; each developer/CI environment re-links via `vercel link` or environment variables.

---

## Self-review notes

- **Spec coverage:** every section of `docs/superpowers/specs/2026-06-18-admin-v2-foundation-design.md` maps to a task — Architecture → Tasks 1-3, 7; Auth → Tasks 4, 6; Modules table → Tasks 8-12; tracked-subscription action → Tasks 13-14; Pause/Resume → Task 16; Cancel/Undo → Task 17; Cancel & Refund (standard) → Task 18; manual override → Task 19; webhook code change → Task 15; data model changes → Tasks 4, 5 (the `admin_paused` column was moved up into Task 5 from where the spec lists it, with a note explaining why — the view in that same migration depends on the column existing).
- **Deferred sub-projects** (Revenue dashboard, mobile crash metrics, cost/profit, feedback feature) are intentionally absent from this plan — they're separate sub-projects per the spec's "Out of scope" section.
- **Type consistency check:** `workspace_billing.admin_paused`, `subscription_status` enum values (`'paused' | 'cancelled'`, never `'active'` for the RPC), and the `AdminGuardError` status codes (401/403) are used identically across every task that touches them.
