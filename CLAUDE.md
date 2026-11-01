# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

Portfolio and video showcase for Henrique Bueno (bueno_dev). Product decisions live in `PRODUCT.md`, the visual system in `DESIGN.md` (tokens are normative; `.impeccable/design.json` is its sidecar). `mocks/b-diagrama.html` is the approved static mock; the other mocks are rejected directions. `exemplos/` holds the reference videos and social links.

## Site (`site/`)

React 19 + Vite, prerendered to static HTML at build and hydrated in the browser; Motion for animations. Needs Node ≥ 22.23.4; the system Node may be older, so use `~/.nvm/versions/node/v24.20.0/bin` (`.nvmrc` says 24).

```sh
cd site
npm run dev        # dev server on :4321 (the API's CORS allows this port), page server-rendered like the build
npm run build      # client build + SSR build + prerender.mjs → static output in site/dist
npm run check      # type check (tsc)
```

- `index.html` (template with `<!--app-->`/`<!--dados-->`) → `src/main.tsx` hydrates `src/App.tsx`, which composes the page from `src/components/*` (one component + one `.css` per section, CSS nested under the section's root class).
- `src/entry-server.tsx` renders the page; `prerender.mjs` uses it at build (and downloads each video cover from the API, converting it to WebP in `dist/capas/`), the `paginaNoDev` plugin in `vite.config.ts` uses it in dev. The snapshot travels to the browser as JSON in `<script id="dados">`.
- `src/dados/` holds curated content; `src/lib/snapshot.ts` loads videos and follower counts from the API (`API_URL`, else `PUBLIC_API_URL`) or from `src/dados/exemplo.ts`. Local images are imported with `?w=…&format=webp&as=picture` (vite-imagetools).
- After hydration, `Videos` re-checks `/snapshot` and swaps the list if its `assinatura` changed; `useContagensAoVivo` follows the counts over SSE.
- `admin/index.html` + `src/admin/*`: the admin panel (React, keycloak-js with PKCE) calling `/admin-api`; client-rendered only.
- `src/scripts/movimento.ts` holds the scroll/entrance animations and `cursor.ts` the cursor; `App` starts both once after hydration. Hidden initial states are in `src/styles/global.css` and only apply with JS and without `prefers-reduced-motion`.
- Env vars keep the `PUBLIC_` prefix (`envPrefix` in `vite.config.ts`). Built against the API with `API_URL=… PUBLIC_API_URL=… npm run build`.

## API (`api/`)

Quarkus 3 on Java 25 (sdkman's default here). See `api/README.md` for endpoints and environment variables.

```sh
cd api
./mvnw quarkus:dev     # dev on :8080
./mvnw test            # unit tests + @QuarkusTest (random port; 8081 is taken on this machine)
./mvnw package && java -jar target/quarkus-app/quarkus-run.jar
```

- Videos and the Instagram/TikTok counts come from the site's `/admin` panel: `admin/AdminRecurso` (`/admin-api/*`, `@RolesAllowed("admin")`, Keycloak tokens via quarkus-oidc) → `admin/Catalogo` (validation, covers in MinIO via `capas/CapasMinio`, rebuild request). Tests swap MinIO for `CapasEmMemoria` (`@Mock`) and use `@TestSecurity`.
- `fontes/` holds the automatic sources (`YouTube`, `GitHub`, plus `Exemplo` with the copied pinned repos); `Conjunto` picks which; `coleta/Coletor` reads them with `@Scheduled`. Numbers are never invented: no source = handle only.
- `snapshot/Estado` keeps the last snapshot in `dados/snapshot.json` and fires CDI events (`Eventos`); `web/Transmissor` (SSE) observes count changes.
- Keep it simple: no virtual threads, no circuit breaker (user decision).

## Docker

`docker-compose.yml` runs `web` (Nginx serving only the static site: `site/docker/Dockerfile.web` + `site/docker/nginx.conf`), `construtor` (site builder: `site/Dockerfile` + `site/docker/construir.sh`), `api`, `minio` (Coolify's image; the official one is no longer published) and `keycloak` (`keycloak/Dockerfile` + `keycloak/realm-portfolio.json`, which uses `${SITE_URL}` for redirect URIs). Site, API and Keycloak are separate domains (`SITE_URL`, `API_URL_PUBLICA`, `KEYCLOAK_URL_PUBLICA`); Nginx proxies nothing. It is deployed on the user's VPS through Coolify, which owns the domains/HTTPS and the env vars, so the main compose file publishes no ports and reads no `.env` file; locally add `-f docker-compose.local.yml` (site :8080, API :8082, Keycloak :8180; :8081 is taken on this machine) and use `.env` (template `.env.example`, never committed). The API asks for a site rebuild by touching `/dados/rebuild-pedido`; the builder polls it, builds inside the container and swaps the `/site/atual` symlink. Deploy steps are in `README.md`.

## Prompt log

Every user prompt is saved automatically to `prompts/NNN.md` (001, 002, ...) by a `UserPromptSubmit` hook (`.claude/settings.json` → `.claude/hooks/save-prompt.sh`). The next number is the highest existing `NNN.md` + 1. Don't rename or renumber files in `prompts/`, and don't write to it by hand.
