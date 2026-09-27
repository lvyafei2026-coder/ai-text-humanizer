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

Add these to the `tool-proxy` Worker's proxy map and Cloudflare routes:

- `toolara.dev/ai-text-humanizer/*`
- `www.toolara.dev/ai-text-humanizer/*`

## Free tier

- **Workers AI**: 10,000 Neurons/day (~200 rewrites/day)
- **Rate Limiting**: Free plan included, no storage cost

## License

MIT
