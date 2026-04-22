# Boopy Marketing App

Separate Next.js marketing application for high-velocity growth and conversion experiments.

## Why this app exists

- Separate deployment lifecycle from the dashboard app
- Faster landing page iteration and A/B testing
- Integrates with Payload as a no-code CMS endpoint
- Includes a visual editor route at `/studio` for quick block experiments

## Run locally

From the repository root:

```bash
npm run dev:marketing
```

Default local URL: `http://localhost:3001`

## Environment variables

- `NEXT_PUBLIC_DASHBOARD_URL` (e.g. `https://app.boopy.dev/login`)
- `PAYLOAD_API_URL` (e.g. `https://your-payload-domain.com`)
- `PAYLOAD_API_TOKEN` (optional, for protected globals endpoint)
- `PAYLOAD_SECRET` (required when using embedded/local Payload in this app)
- `DATABASE_URI` or `DATABASE_URL`
  - local fallback: `file:./apps/marketing/payload.db` (SQLite)
  - production recommended: Postgres connection string (Supabase/Neon/etc.)
- `PAYLOAD_SQLITE_PATH` (optional SQLite path override, e.g. `file:/tmp/payload.db`)

## Content source (no-code)

The homepage fetches `marketing-site` global from Payload:

- `GET {PAYLOAD_API_URL}/api/globals/marketing-site`
- if `PAYLOAD_API_URL` is not set, the app uses the embedded Payload instance directly via Local API

If Payload is unreachable, the app falls back to local default content.

## Can non-dev marketing partners edit this?

Yes. Payload is the primary no-code control layer.

Recommended workflow:

1. Open Payload admin at `/admin` and edit the `marketing-site` global.
2. Update messaging, audience cards, value pillars, social proof, pricing, FAQs, and CTAs.
3. Save and publish.
4. Verify on the deployed marketing URL.

This lets marketing modify positioning and launch copy without code changes.

## Embedded Payload routes (Next.js)

This app now includes full Payload + Next.js integration using route groups:

- Admin UI: `/admin`
- REST API: `/api/*`
- GraphQL API: `/api/graphql`
- GraphQL Playground: `/api/graphql-playground`

## Important runtime behavior

- Landing content is rendered dynamically (`force-dynamic`) so CMS edits appear immediately.
- In production, use Postgres (`DATABASE_URI` or `DATABASE_URL`) for persistent CMS data.
- If no DB connection is configured in production, landing page safely falls back to static defaults.

## Payload schema starter

Use the provided schema files in `payload-schema/`:

- `payload-schema/globals/marketing-site.ts`
- `payload-schema/payload.config.example.ts`

They define a production-ready `marketing-site` global with:

- SEO metadata
- Brand statement
- Hero + CTA configuration
- Social proof stats
- Audience segments (personal, group, agency, business, etc.)
- Value pillars
- No-code CMS section content
- Feature cards
- Testimonials
- FAQs
- Free/Pro pricing blocks
