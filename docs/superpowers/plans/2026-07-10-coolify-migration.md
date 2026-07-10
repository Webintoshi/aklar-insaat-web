# Aklar İnşaat Coolify Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the existing Next.js application as a small, rootless standalone container, build it outside the Coolify server, deploy it with bounded resources, and switch both production domains through Cloudflare without downtime.

**Architecture:** GitHub Actions builds an amd64 multi-stage Docker image and publishes it to public GHCR. Coolify only pulls and runs that image with runtime-only Supabase/R2 secrets; Cloudflare changes after application and TLS checks pass.

**Tech Stack:** Next.js 16.2.10, React/React DOM 19.2.7, Node.js 24 Alpine, Docker Buildx, GitHub Actions, GHCR, Coolify, Cloudflare, Supabase, Cloudflare R2.

## Global Constraints

- Keep the existing App Router, API routes, admin area, Supabase project, and R2 bucket unchanged.
- Never write `SUPABASE_SERVICE_ROLE_KEY`, `R2_ACCESS_KEY_ID`, or `R2_SECRET_ACCESS_KEY` to Git, Docker layers, GitHub logs, or documentation.
- Build the image on GitHub-hosted infrastructure; Coolify must not run `next build`.
- Run one rootless replica with 1 vCPU, 512 MiB reservation, and 768 MiB initial memory limit.
- Do not change production DNS until container, application, media, and TLS checks pass.
- Keep the prior DNS target recorded until the post-cutover verification is complete.

---

### Task 1: Patch Runtime Dependencies and Enable Standalone Output

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `next.config.ts`

**Interfaces:**
- Consumes: Existing `npm run build` and Next.js App Router application.
- Produces: `.next/standalone/server.js`, `.next/static`, and a patched dependency lockfile.

- [ ] **Step 1: Record the current production build baseline**

Run with the migrated public values supplied only to the process:

```powershell
$env:NEXT_PUBLIC_SITE_URL='https://orduaklarinsaat.com'
$env:NEXT_PUBLIC_SUPABASE_URL=Read-Host 'NEXT_PUBLIC_SUPABASE_URL from Vercel'
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY=Read-Host 'NEXT_PUBLIC_SUPABASE_ANON_KEY from Vercel'
$env:NEXT_PUBLIC_R2_PUBLIC_URL=Read-Host 'NEXT_PUBLIC_R2_PUBLIC_URL from Vercel'
npm ci
npm run build
```

Expected: build succeeds on commit `9ff33c42c1ba98b5d144e3a5a353f89a82cc632c`. If it fails, save the exact error before modifying dependencies.

- [ ] **Step 2: Apply exact patched dependency versions**

Run:

```powershell
npm install --save-exact next@16.2.10 react@19.2.7 react-dom@19.2.7
```

Expected `package.json` dependency entries:

```json
"next": "16.2.10",
"react": "19.2.7",
"react-dom": "19.2.7"
```

- [ ] **Step 3: Enable Next.js standalone output**

Add this property at the top of the exported `nextConfig` object in `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: process.cwd(),
  images: {
```

- [ ] **Step 4: Verify the patched build**

Run:

```powershell
npm ci
npm run lint
npm run build
Test-Path .next/standalone/server.js
```

Expected: lint and build exit `0`; final command prints `True`.

- [ ] **Step 5: Commit the runtime patch**

```powershell
git add package.json package-lock.json next.config.ts
git commit -m "build: prepare standalone Coolify runtime"
```

### Task 2: Create a Small Rootless Docker Runtime

**Files:**
- Create: `.dockerignore`
- Create: `Dockerfile`

**Interfaces:**
- Consumes: `.next/standalone`, `.next/static`, and `public` from Task 1.
- Produces: An HTTP service on port `3000` with an internal health check.

- [ ] **Step 1: Create `.dockerignore`**

```dockerignore
.git
.github
.next
node_modules
npm-debug.log*
docs
supabase
*.md
.env*
!.env.example
```

- [ ] **Step 2: Create the multi-stage `Dockerfile`**

```dockerfile
# syntax=docker/dockerfile:1.7
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_R2_PUBLIC_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_R2_PUBLIC_URL=$NEXT_PUBLIC_R2_PUBLIC_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
```

- [ ] **Step 3: Build the local image**

```powershell
docker build --platform linux/amd64 `
  --build-arg NEXT_PUBLIC_SITE_URL=$env:NEXT_PUBLIC_SITE_URL `
  --build-arg NEXT_PUBLIC_SUPABASE_URL=$env:NEXT_PUBLIC_SUPABASE_URL `
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=$env:NEXT_PUBLIC_SUPABASE_ANON_KEY `
  --build-arg NEXT_PUBLIC_R2_PUBLIC_URL=$env:NEXT_PUBLIC_R2_PUBLIC_URL `
  -t aklar-insaat-web:coolify .
```

Expected: build exits `0` and final image contains only the runner stage.

- [ ] **Step 4: Smoke-test the local container**

```powershell
docker run --rm -d --name aklar-coolify-test -p 3100:3000 `
  --memory=768m --cpus=1 `
  -e NEXT_PUBLIC_SITE_URL -e NEXT_PUBLIC_SUPABASE_URL `
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY -e NEXT_PUBLIC_R2_PUBLIC_URL `
  -e SUPABASE_SERVICE_ROLE_KEY -e R2_ENDPOINT -e R2_ACCESS_KEY_ID `
  -e R2_SECRET_ACCESS_KEY -e R2_BUCKET_NAME -e R2_ACCOUNT_ID -e R2_REGION `
  aklar-insaat-web:coolify
Invoke-WebRequest http://127.0.0.1:3100/ -UseBasicParsing
docker inspect --format='{{.State.Health.Status}}' aklar-coolify-test
docker rm -f aklar-coolify-test
```

Expected: HTTP `200`, health status `healthy`, then the test container is removed. The required variables are process-local and no environment file is written.

- [ ] **Step 5: Commit Docker packaging**

```powershell
git add .dockerignore Dockerfile
git commit -m "build: add rootless production container"
```

### Task 3: Publish the Image from GitHub Actions

**Files:**
- Create: `.github/workflows/publish-coolify-image.yml`

**Interfaces:**
- Consumes: Repository variables `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_R2_PUBLIC_URL`.
- Produces: `ghcr.io/webintoshi/aklar-insaat-web:latest` and immutable commit-SHA tags.

- [ ] **Step 1: Create the GHCR workflow**

```yaml
name: Publish Coolify image

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  packages: write

concurrency:
  group: coolify-image-${{ github.ref }}
  cancel-in-progress: true

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/metadata-action@v5
        id: meta
        with:
          images: ghcr.io/${{ github.repository_owner }}/aklar-insaat-web
          tags: |
            type=raw,value=latest,enable={{is_default_branch}}
            type=sha,format=long
      - uses: docker/build-push-action@v6
        with:
          context: .
          platforms: linux/amd64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            NEXT_PUBLIC_SITE_URL=${{ vars.NEXT_PUBLIC_SITE_URL }}
            NEXT_PUBLIC_SUPABASE_URL=${{ vars.NEXT_PUBLIC_SUPABASE_URL }}
            NEXT_PUBLIC_SUPABASE_ANON_KEY=${{ vars.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
            NEXT_PUBLIC_R2_PUBLIC_URL=${{ vars.NEXT_PUBLIC_R2_PUBLIC_URL }}
```

- [ ] **Step 2: Add repository Actions variables through GitHub**

Create the four variables listed in the interface. Values come from Vercel; no service-role or R2 secret is sent to GitHub.

- [ ] **Step 3: Commit and publish the branch**

```powershell
git add .github/workflows/publish-coolify-image.yml
git commit -m "ci: publish Coolify image to GHCR"
git push -u origin codex/coolify-migration
```

- [ ] **Step 4: Merge the branch and verify the workflow**

Merge `codex/coolify-migration` into `main`, then confirm the `Publish Coolify image` workflow succeeds and the package SHA matches the merged commit.

- [ ] **Step 5: Set the GHCR package visibility to public**

Open the package settings, select `Change visibility`, choose `Public`, confirm the repository name, and verify unauthenticated access to the image manifest.

### Task 4: Create and Harden the Coolify Application

**Files:**
- No repository files.

**Interfaces:**
- Consumes: Public GHCR image and the 11 environment variables from the design.
- Produces: A healthy Coolify resource reachable through a temporary hostname and port `3000`.

- [ ] **Step 1: Inspect server architecture and capacity**

Confirm the destination is `linux/amd64` and that at least 1 GiB free memory and sufficient image-pull disk space are available. If architecture differs, add that platform to Task 3 before deploying.

- [ ] **Step 2: Create a Docker Image application**

Use image `ghcr.io/webintoshi/aklar-insaat-web:latest`, port `3000`, one replica, and production environment.

- [ ] **Step 3: Add runtime variables**

Add all 10 Vercel variables plus `NEXT_PUBLIC_SITE_URL=https://orduaklarinsaat.com`. Mark service-role and R2 credential values as secrets; do not expose them in build logs.

- [ ] **Step 4: Apply resource and health settings**

Set CPU limit `1`, memory reservation `512 MiB`, memory limit `768 MiB`, health path `/`, interval `30s`, timeout `5s`, retries `3`, and restart policy `unless-stopped`.

- [ ] **Step 5: Deploy and inspect logs**

Expected: image pull succeeds, container becomes healthy, no missing-environment errors appear, and the temporary Coolify URL returns HTTP `200`.

- [ ] **Step 6: Functional pre-cutover checks**

Verify `/`, `/projeler`, one project detail page, `/auth/login`, `/api/whatsapp/config`, Supabase-rendered content, R2 images, and one authorized R2 presign request. No endpoint may return an unexpected `5xx`.

### Task 5: Cut Over Cloudflare and Verify Production

**Files:**
- No repository files.

**Interfaces:**
- Consumes: Healthy Coolify origin and current Cloudflare DNS state.
- Produces: Canonical HTTPS production service on `orduaklarinsaat.com` with `www` redirect.

- [ ] **Step 1: Record current DNS values**

Capture the current root and `www` record types, targets, TTLs, and proxy states before changing them.

- [ ] **Step 2: Add both domains to Coolify**

Configure `https://orduaklarinsaat.com` as primary and `https://www.orduaklarinsaat.com` as alias; wait for Coolify/TLS configuration before DNS cutover.

- [ ] **Step 3: Update Cloudflare DNS**

Point the root and `www` records at the Coolify origin using the record type required by the server, enable Cloudflare proxy, and keep the prior values recorded for rollback.

- [ ] **Step 4: Apply Cloudflare edge settings**

Use SSL/TLS `Full (strict)`, enable Always Use HTTPS, retain WebSockets, and configure a permanent redirect from `www` to the root domain without caching admin/API responses.

- [ ] **Step 5: Verify production from the public edge**

Run:

```powershell
curl.exe -I https://orduaklarinsaat.com/
curl.exe -I https://www.orduaklarinsaat.com/
curl.exe -I https://orduaklarinsaat.com/auth/login
curl.exe -I https://orduaklarinsaat.com/api/whatsapp/config
```

Expected: root and application routes return successful/expected redirect statuses with valid TLS; `www` permanently redirects to root; Cloudflare does not cache admin/API responses.

- [ ] **Step 6: Perform browser verification**

Check desktop and mobile navigation, homepage, project media/video, admin login, browser console errors, API failures, and Cloudflare certificate state.

- [ ] **Step 7: Check runtime consumption and rollback readiness**

Observe Coolify CPU/memory after warm traffic. If the container approaches 768 MiB during ordinary use, raise the limit to 1 GiB while retaining 1 vCPU. Keep the previous DNS values until all checks pass.

- [ ] **Step 8: Rotate the exposed Coolify API token**

After deployment, revoke the token shared in chat, create a replacement only if continuing API automation is required, and do not store the replacement in the repository.
