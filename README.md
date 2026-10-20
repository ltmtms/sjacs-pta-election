# SJACS PTA Parent Election

Bilingual (繁體中文 + English) web voting for the **SJACS** Parent-Teacher Association parent committee election.

## Features

- **Branding**: SJACS throughout (not SJC)
- **Languages**: `zh-Hant` (default) and English with header language switcher
- **Ballot rules**: up to 6 primary + 6 secondary candidates, **11 total**; one vote per 4-letter code (letters **A–Z excluding I and O**)
- **Bot protection**: Cloudflare Turnstile on code request and ballot claim
- **DEV Turnstile bypass**: set `TURNSTILE_BYPASS_DEV=true` locally (documented below; blocked in production)
- **Atomic ballot claim**: database transaction ensures each code is claimed once
- **Anonymous ballots**: `ballots` table stores choices only — no voter code or email foreign keys
- **Transparency (Option A)**:
  - While election is **open**: public page shows turnout + HMAC **commitment root** only
  - When **closed**: publishes full plaintext issued codes + keeps the same root (`TRANSPARENCY_COMMITMENT_SECRET`)
- **Admin UI**: `/admin` — open/close election, live tally, add candidates
- **Database**: SQLite for local dev; PostgreSQL required in production

## Quick start (local)

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed   # optional sample candidates + open election
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Turnstile DEV bypass

For local testing without Cloudflare widgets:

```bash
TURNSTILE_BYPASS_DEV=true
```

The UI shows a notice when bypass is active. **Production startup fails** if this variable is `true`.

With bypass off, add test keys from the [Cloudflare Turnstile dashboard](https://dash.cloudflare.com/) to `.env`.

### Email stub

`EMAIL_PROVIDER=stub` prints ballot codes to the server console. **Production refuses to start** with `EMAIL_PROVIDER=stub`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm test` | Vitest unit/integration tests |
| `npm run build` | Production build |
| `npm run db:migrate` | Apply SQLite/Postgres schema |
| `npm run db:seed` | Seed sample candidates (dev) |

## Environment variables

See [`.env.example`](.env.example). Production requirements:

| Variable | Requirement |
| --- | --- |
| `SESSION_SECRET` | ≥ 32 characters, not a default placeholder |
| `TRANSPARENCY_COMMITMENT_SECRET` | Dedicated secret for HMAC commitment root |
| `DATABASE_URL` | `postgresql://…` |
| `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Required |
| `TURNSTILE_BYPASS_DEV` | Must be unset or `false` |
| `EMAIL_PROVIDER` | Must not be `stub` |

## Transparency verification

Each issued code `C` has leaf `HMAC-SHA256(TRANSPARENCY_COMMITMENT_SECRET, C)`.

**Root** = `HMAC-SHA256(secret, sort(leaves).join("\n"))`.

After the election closes, reconcile published codes against the root published while voting was open.

JSON API: `GET /api/transparency`.

## Deployment

See **[DEPLOY.md](DEPLOY.md)** for GitHub-oriented production setup (Postgres, secrets, no tunnel/Vercel steps unless you add them).

## License

Private school PTA use — adjust as needed for your organisation.
