# Deploying SJACS PTA Election (GitHub)

This guide targets hosting the app yourself (VPS, Railway, Render, Fly.io, etc.) with **PostgreSQL**. It does **not** cover Cloudflare tunnels or Vercel unless you add that separately.

## 1. Repository

Clone the public repo:

```bash
git clone https://github.com/ltmtms/sjacs-pta-election.git
cd sjacs-pta-election
npm ci
```

## 2. Database (PostgreSQL)

Create a database and set:

```bash
export DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/sjacs_pta"
npm run db:migrate
```

SQLite (`file:./data/local.sqlite`) is for **local development only**. Production startup validates `DATABASE_URL` is PostgreSQL.

## 3. Secrets

Generate strong random values (≥ 32 characters):

```bash
openssl rand -hex 32   # SESSION_SECRET
openssl rand -hex 32   # TRANSPARENCY_COMMITMENT_SECRET
```

| Variable | Notes |
| --- | --- |
| `SESSION_SECRET` | Iron session encryption; required strength in production |
| `TRANSPARENCY_COMMITMENT_SECRET` | **Dedicated** secret for HMAC commitment root; store offline for auditors |
| `ADMIN_PASSWORD` | Admin UI (`/admin`) password |
| `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | From Cloudflare Turnstile |
| `EMAIL_PROVIDER` | Set to `resend` (or extend `src/lib/email.ts`) |
| `RESEND_API_KEY` | If using Resend |
| `APP_URL` | Public HTTPS origin, e.g. `https://pta-vote.example.edu.hk` |

**Do not set** `TURNSTILE_BYPASS_DEV=true` in production — the app exits on boot.

**Do not set** `EMAIL_PROVIDER=stub` in production — the app exits on boot.

## 4. Build and run

```bash
NODE_ENV=production npm run build
NODE_ENV=production npm start
```

Run behind HTTPS (reverse proxy). Set `APP_URL` to the public URL.

## 5. GitHub Actions (optional CI)

Example workflow (add `.github/workflows/ci.yml`):

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
        env:
          NEXT_PHASE: phase-production-build
```

`NEXT_PHASE` allows `next build` without production-only secrets on the runner.

## 6. Post-deploy checklist

1. Sign in to `/admin`, set candidates, **open** election when ready.
2. Confirm Turnstile widgets load on home and vote pages.
3. Request a test code via email provider.
4. Note the **commitment root** on `/transparency` while voting is open.
5. After closing, verify published codes match the earlier root.

## 7. Updating from GitHub

```bash
git pull origin main
npm ci
npm run db:migrate
NODE_ENV=production npm run build
# restart process manager (systemd, pm2, etc.)
```

## Support

Issues: [https://github.com/ltmtms/sjacs-pta-election/issues](https://github.com/ltmtms/sjacs-pta-election/issues)
