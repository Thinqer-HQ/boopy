# Boopy Marketing App

Separate Next.js marketing application for aggressive growth experiments.

## Why this app exists

- Separate deployment lifecycle from the dashboard app
- Faster landing page iteration and A/B testing
- Integrates with Payload as a headless CMS endpoint
- Includes a Puck visual editor route at `/studio`

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

## Content source

The homepage fetches `marketing-site` global from Payload:

- `GET {PAYLOAD_API_URL}/api/globals/marketing-site`

If Payload is unreachable, the app falls back to local default content.

## Payload schema starter

Use the provided schema files in `payload-schema/`:

- `payload-schema/globals/marketing-site.ts`
- `payload-schema/payload.config.example.ts`

They define a production-ready `marketing-site` global with:

- SEO metadata
- Hero + CTA configuration
- Feature cards
- Testimonials
- FAQs
- Free/Pro pricing blocks
