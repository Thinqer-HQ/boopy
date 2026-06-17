# Boopy Mobile — Stage 1: Foundation + Dashboard + Subscriptions

## Context

`apps/mobile` is an Expo/React Native app. It exists so subscription data is available offline via on-device storage, syncing to the same Supabase backend as the Next.js web app (`src/app/(app)/...`, referred to here as "boopy web"). Today its Dashboard, Subscriptions, AI, and Settings tabs have their own bespoke UI that doesn't match boopy web's design.

Goal: make boopy mobile look like boopy web (same colors, type, layout, components), while keeping the local-first storage that's the whole reason it's a native app instead of a wrapped website. Boopy web is not to be modified — all logic mobile needs is duplicated into `apps/mobile`'s own files, even where boopy web has equivalent code, to avoid any risk to the web app.

Full feature parity (clients, groups, calendar, documents, reports, settings/billing/notifications, admin) is the end goal, but it's too large for one pass. This spec covers **Stage 1 only**: the navigation/theme/storage foundation, plus the Dashboard and Subscriptions screens (the two areas mobile already partially has, just with the wrong UI). Later stages (clients, calendar, documents, reports, settings) get their own specs once this foundation exists.

## Decisions

- **Styling:** NativeWind, not hand-written `StyleSheet`. Boopy web is Tailwind + shadcn/ui; NativeWind lets mobile reuse the same utility-class vocabulary and stay visually in sync as web's design evolves, instead of hand-translating every class into RN style objects.
- **Local storage scope:** mixed, not all-or-nothing. Subscriptions and groups (the data Stage 1 covers) are local-first with sync, matching the existing `lib/db.ts` / `lib/sync.ts` pattern. Later stages will decide per-domain: documents/files and billing/Stripe state should stay server-live (too heavy to cache, or must reflect live state) rather than local-first.
- **Code sharing:** duplicate, don't extract. Logic mobile needs that also exists in boopy web (calculations, validation, types) gets copied into `apps/mobile/lib/...` and adapted, rather than pulled into a new shared workspace package. Slower to keep in sync long-term, but zero risk of touching/breaking boopy web.
- **Build order:** Stage 1 = foundation + Dashboard + Subscriptions, chosen because mobile already has partial versions of both and because the nav shell / theme / storage work here is a prerequisite for every later stage.

## Visual parity: NativeWind + ported theme tokens

Boopy web's entire look is defined as CSS variables in `src/app/globals.css`, consumed via Tailwind v4's `@theme inline`:

- Color palette in `oklch()` — e.g. `--primary: oklch(0.549 0.231 281)` (`#6d5df6`, "Boopy purple"), plus `--accent`, `--muted`, `--card`, `--border`, `--destructive`, separate `:root` and `.dark` sets.
- Radii scale derived from `--radius: 1.125rem` (`rounded-3xl`, `rounded-2xl`, etc.)
- Two fonts: `--font-sans` (Manrope, body) and `--font-heading` (Fredoka, headings) via `font-heading` utility class.

For Stage 1:

1. Convert the oklch values to hex/rgb (NativeWind/RN don't reliably support the `oklch()` CSS function) and define them in a new `apps/mobile/tailwind.config.js` theme, matching boopy web's token names (`primary`, `accent`, `muted`, `card`, `border`, `destructive`, `radius-*`) so class names like `bg-primary`, `text-muted-foreground`, `rounded-3xl` work identically on both apps.
2. Add NativeWind + its babel/metro plugin to `apps/mobile`.
3. Load Manrope and Fredoka via `expo-font`, expose a `font-heading` utility matching web's.
4. Rebuild the small set of shadcn primitives actually used by Dashboard/Subscriptions (`Card`, `Button`, `Badge`, `Alert`, `Skeleton`) as plain RN components carrying the same `className` props and visual variants — not a port of shadcn itself, just enough to match what these two screens render.
5. Port each screen's JSX structure directly: `div→View`, `p/span/h1→Text`, `<Link href>` (next/link) → `<Link href>` (expo-router, same API shape), `onClick→onPress`, `<img>→<Image>`. Tailwind class strings carry over largely unchanged.

## Data model reconciliation

Mobile's local SQLite schema (`apps/mobile/lib/types.ts`) has drifted from boopy web's Supabase schema:

| Field                     | Web                                                | Mobile today                                       | Stage 1 change                                |
| ------------------------- | -------------------------------------------------- | -------------------------------------------------- | --------------------------------------------- |
| `status`                  | `"active" \| "paused" \| "cancelled"`              | `"active" \| "paused" \| "canceled"`               | adopt web's spelling (`cancelled`)            |
| `cadence`                 | `"monthly" \| "yearly" \| "quarterly" \| "custom"` | `"weekly" \| "monthly" \| "quarterly" \| "yearly"` | adopt web's set (drop `weekly`, add `custom`) |
| `start_date` / `end_date` | present, used in renewal math                      | absent                                             | add both columns                              |

Mobile's `lib/db.ts` schema and `lib/utils.ts` helpers (`getRenewalLabel`, `daysUntil`, etc.) get updated to match; a one-time local migration handles any existing on-device rows from the old schema. Renewal-date math gets re-derived from web's `lib/subscriptions/recurrence.ts` logic (`nextOccurrenceDayKeyOnOrAfter`, `recurrenceBoundsFromNullable`), duplicated into mobile per the code-sharing decision above.

## Sync: extend the existing pattern to groups

`apps/mobile/lib/sync.ts` already does push-unsynced-then-pull-cloud-wins for subscriptions (cloud wins when its `updated_at` is newer). Groups are currently fetched read-only. Stage 1 adds a local `groups` table synced the same way, since the Dashboard's group cards/KPIs need them available offline.

## Screens

**Dashboard** (`app/(tabs)/index.tsx`, replacing current implementation): hero banner with today's date and monthly-spend summary, 4 KPI cards (Groups / Subscriptions / Monthly spend / Upcoming renewals — tap-through like web's `Link`-wrapped cards), group cards grid (top 5 + "new group"), upcoming-renewals list (next 30/60 days), quick actions list, paused-subscriptions "savings mode" card. Skeleton/error/empty states match web's.

**Subscriptions** (`app/(tabs)/subscriptions.tsx`, replacing current implementation): list/grid toggle, search, group filter, add/edit/delete, per-group and overall totals. Receipt upload via Google Drive, the invoice generator dialog, and CSV/spreadsheet export are present in web's version but depend on browser-only or Drive-OAuth flows that don't map directly to RN — Stage 1 renders these as visible "coming soon" affordances (not silently dropped) rather than building them now.

## Out of scope (future stages)

Clients, Calendar, Documents, Reports, Settings (account/billing/notifications/workspace), Google Drive integration, invoice generation, admin features. Each gets its own spec once the Stage 1 foundation lands.

## Testing

- Playwright against `npx expo start --web` to verify each screen renders without console errors and visually matches the corresponding web page (colors, layout, copy).
- Manual check on a device/simulator for native-only behavior: SQLite read/write, offline mode (airplane mode + app restart shows last-synced data), gesture navigation.
