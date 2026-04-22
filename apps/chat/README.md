# Boopy Chat (`@boopy/chat`)

Fork of [supabase-community/vercel-ai-chatbot](https://github.com/supabase-community/vercel-ai-chatbot), upgraded to **Next.js 16**, **AI SDK v4** (`@ai-sdk/openai` + `streamText`), and **React 19**.

Run from the monorepo root:

```bash
npm install --legacy-peer-deps
npm run dev:chat
```

Open [http://localhost:3002](http://localhost:3002). Copy `apps/chat/.env.example` to `apps/chat/.env.local` (or set the same variables in the repo root `.env`) with `NEXT_PUBLIC_SUPABASE_*`, `OPENAI_API_KEY`, and optional GitHub OAuth vars.

---

<p align="center">
  <em>Original template:</em> Next.js AI chatbot with Vercel AI SDK, OpenAI, Supabase Auth and Postgres.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#model-providers"><strong>Model Providers</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy Your Own</strong></a> ·
  <a href="#running-locally"><strong>Running locally</strong></a> ·
  <a href="#authors"><strong>Authors</strong></a>
</p>
<br/>

## Features

- [Next.js](https://nextjs.org) App Router
- React Server Components (RSCs), Suspense, and Server Actions
- [Vercel AI SDK](https://sdk.vercel.ai/docs) for streaming chat UI
- Support for OpenAI (default), Anthropic, Hugging Face, or custom AI chat models and/or LangChain
- Edge runtime-ready
- [shadcn/ui](https://ui.shadcn.com)
  - Styling with [Tailwind CSS](https://tailwindcss.com)
  - [Radix UI](https://radix-ui.com) for headless component primitives
  - Icons from [Phosphor Icons](https://phosphoricons.com)
- Chat History with [Supabase Postgres DB](https://supabase.com)
- [Supabase Auth](https://supabase.com/auth) for authentication

## Model Providers

This template ships with OpenAI `gpt-3.5-turbo` as the default. However, thanks to the [Vercel AI SDK](https://sdk.vercel.ai/docs), you can switch LLM providers to [Anthropic](https://anthropic.com), [Hugging Face](https://huggingface.co), or using [LangChain](https://js.langchain.com) with just a few lines of code.

## Deploy Your Own

You can deploy your own version of the Next.js AI Chatbot to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsupabase-community%2Fvercel-ai-chatbot&env=OPENAI_API_KEY&envDescription=You%20must%20first%20activate%20a%20Billing%20Account%20here%3A%20https%3A%2F%2Fplatform.openai.com%2Faccount%2Fbilling%2Foverview&envLink=https%3A%2F%2Fplatform.openai.com%2Faccount%2Fapi-keys&project-name=vercel-ai-chatbot-with-supabase&repository-name=vercel-ai-chatbot-with-supabase&integration-ids=oac_VqOgBHqhEoFTPzGkPd7L0iH6&external-id=https%3A%2F%2Fgithub.com%2Fsupabase-community%2Fvercel-ai-chatbot%2Ftree%2Fmain)

### Set up GitHub OAuth

This demo uses GitHub Oauth. Follow the [GitHub OAuth setup steps](https://supabase.com/docs/guides/auth/social-login/auth-github) on your Supabase project.

### Configure your site url

In the Supabase Dashboard, navigate to [Auth > URL configuration](https://app.supabase.com/project/_/auth/url-configuration) and set your Vercel URL as the site URL.

## Running locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Next.js AI Chatbot. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables) for this, but a `.env` file is all that is necessary.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control access to your various OpenAI and authentication provider accounts.

Copy the `.env.example` file and populate the required env vars:

```bash
cp .env.example .env
```

[Install the Supabase CLI](https://supabase.com/docs/guides/cli) and start the local Supabase stack:

```bash
npm install supabase --save-dev
npx supabase start
```

Install the local dependencies and start dev mode:

```bash
pnpm install
pnpm dev
```

Your app template should now be running on [localhost:3000](http://localhost:3000/).

## Authors

This library is created by [Vercel](https://vercel.com) and [Next.js](https://nextjs.org) team members, with contributions from:

- Jared Palmer ([@jaredpalmer](https://twitter.com/jaredpalmer)) - [Vercel](https://vercel.com)
- Shu Ding ([@shuding\_](https://twitter.com/shuding_)) - [Vercel](https://vercel.com)
- shadcn ([@shadcn](https://twitter.com/shadcn)) - [Contractor](https://shadcn.com)
- Thor Schaeff ([@thorwebdev](https://twitter.com/thorwebdev)) - [Supabaseifier](https://thor.bio)
