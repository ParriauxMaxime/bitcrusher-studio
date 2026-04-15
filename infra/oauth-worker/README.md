# OAuth Worker — Sveltia ↔ GitHub

Minimal Cloudflare Worker that exchanges a GitHub OAuth code for an access token, posting it back to the Sveltia admin window.

## Setup

1. Create a GitHub OAuth app (Settings → Developer settings → OAuth Apps) with Authorization callback URL `https://bitcrusher-oauth.<subdomain>.workers.dev/callback`.
2. `cd infra/oauth-worker && npm install -g wrangler`
3. `wrangler login`
4. `wrangler secret put GITHUB_CLIENT_ID`
5. `wrangler secret put GITHUB_CLIENT_SECRET`
6. Update `ALLOWED_ORIGIN` in `wrangler.toml` if the production domain changes.
7. `wrangler deploy`
8. Update `public/admin/config.yml` `backend.base_url` to the deployed Worker URL.
