This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_KEY=
```

`NEXT_PUBLIC_*` variables are inlined into the client bundle **at build time**, so
they must also be added to the hosting provider's environment settings
(Vercel/Netlify/Cloudflare) for the environment you deploy to. If they are only
available at runtime, `next build` will fail while prerendering pages that use
Supabase with `Error: supabaseUrl is required.` After adding the variables,
redeploy the project.

## Deploy to Cloudflare Workers

This project uses the [OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare).
The adapter files (`wrangler.jsonc`, `open-next.config.ts`) are committed so builds
are reproducible.

In the Cloudflare dashboard, set the Worker's build settings to:

- **Build command:** `npm run build` (Next.js build + OpenNext bundle)
- **Deploy command:** `npx wrangler deploy`

`npm run build` produces the OpenNext output (`.open-next`). Use
`npm run build:next` if you only need a plain Next.js build without the
Cloudflare bundle.

Also add the variables below under **Settings → Variables and Secrets → Build
variables and secrets** for **Production** and **Preview**, because `next build`
needs them to inline `NEXT_PUBLIC_*` values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_KEY`

Runtime variables can stay in the same dashboard page; `keep_vars` in
`wrangler.jsonc` prevents `wrangler deploy` from removing them.

To preview the Worker locally (requires Node.js 22+ for Wrangler):

```bash
cp .env.example .dev.vars   # then fill in the values
npm run preview
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
