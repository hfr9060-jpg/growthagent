# GTM OS AI Video Intelligence Radar

Next.js HTML frontend for `growth_agent`.

## Data Contract

This app calls the FastAPI service only. It does not read local `output/*.json`
files and does not depend on Streamlit.

Default API base:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Optional API key header:

```bash
NEXT_PUBLIC_API_KEY=...
```

## Local Run

Start FastAPI from the repo root:

```bash
uvicorn api.main:app --reload --port 8000
```

Start the frontend from this folder:

```bash
npm install
npm run dev
```

## Deploy Notes

### GitHub Pages

This folder can be pushed as the root of the public `growthagent` repository.
The GitHub Pages URL will be:

```text
https://hfr9060-jpg.github.io/growthagent/
```

Build locally for that URL:

```bash
pnpm build:github
```

The static export is written to:

```text
out/
```

In the `growthagent` repo, keep only frontend-safe files. Do not publish Agent
code, `.env`, Supabase service keys, or FastAPI backend secrets.

Set `NEXT_PUBLIC_API_BASE_URL` as a repository variable once the FastAPI backend
has a public HTTPS URL.

### Vercel / Cloudflare Pages

For Vercel, set `NEXT_PUBLIC_API_BASE_URL` to the deployed FastAPI URL.

For Cloudflare Pages, use the same environment variable and build command:

```bash
npm run build
```
