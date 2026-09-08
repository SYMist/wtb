# Tooly workspace entry

Read `CLAUDE.md`, then `CURRENT.md`. Before changing application code, read `tooly/AGENTS.md` and the relevant installed Next.js documentation.

## Cloud setup

The app is in `tooly/` and its committed lockfile is `tooly/package-lock.json`.

```sh
cd tooly
npm ci
npx tsx lib/data/housing-subscription-cancel.test.ts
npx eslint app/finance/housing-subscription-cancel/page.tsx lib/data/housing-subscription-cancel.ts
```

Use `npm run build` only when the change needs a production build. Do not run Cloudflare deploys or blog publishing from this setup.

## Optional Avatar source

When a task needs the Avatar contract or evidence, the environment owner must select and provide its root with `AVATAR_ROOT`, for example `export AVATAR_ROOT=/workspace/Avatar`. Check the precise file needed under that root. Do not copy Avatar material into this repository. If `AVATAR_ROOT` is unset or the requested file is absent, report that evidence as unavailable and continue only with the Tooly materials that are present.
