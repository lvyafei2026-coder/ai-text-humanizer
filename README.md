# AI Text Humanizer

A Cloudflare Worker that rewrites AI-generated text so it sounds more human, using Cloudflare Workers AI (Llama 3.1 8B).

## Features

- Three tone options: natural, casual, professional
- Runs on Cloudflare Workers AI — no API keys to manage
- Built-in rate limiting: 30 requests per minute per IP
- Text is not stored or logged
- 3,000 character limit per request
- Multi-language interface (EN + ZH)

## Architecture

- **Worker** (`src/index.js`) handles `POST /api/humanize` and serves static assets
- **Static assets** (`public/`) contain the HTML, CSS, and JS
- **Workers AI** is bound via `[ai]` in `wrangler.toml`
- **Rate Limiting** is bound via `[[ratelimits]]` in `wrangler.toml`

## Setup

```bash
npm install
npx wrangler login
npx wrangler deploy
```

## Local development

```bash
npx wrangler dev
```

## Routes

Served on its own subdomain, routed by `tool-proxy` (service binding `SITE_HUMANIZE`,
service name `ai-text-humanizer`):

- `humanize.toolara.dev/*` — primary

Legacy paths (`toolara.dev/ai-text-humanizer/*`, `www.toolara.dev/ai-text-humanizer/*`)
still 301 to the subdomain; they are kept only until Google drops them from the index,
see `LEGACY_PATH_MAP` in `tool-proxy/src/sites.js`.

## Free tier

- **Workers AI**: 10,000 Neurons/day (~200 rewrites/day)
- **Rate Limiting**: Free plan included, no storage cost

## License

MIT
