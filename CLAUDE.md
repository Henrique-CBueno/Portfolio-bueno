# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

Portfolio and video showcase for Henrique Bueno (bueno_dev). Product decisions live in `PRODUCT.md`, the visual system in `DESIGN.md` (tokens are normative; `.impeccable/design.json` is its sidecar). `mocks/b-diagrama.html` is the approved static mock; the other mocks are rejected directions. `exemplos/` holds the reference videos and social links.

## Site (`site/`)

React 19 + Vite, a static site hosted on Hostinger (files uploaded to `public_html`, not Docker): fixed content is prerendered to HTML at build and hydrated; API data (videos, counts, pinned repos) is fetched in the browser on each visit. Motion for animations. Needs Node ≥ 22.23.4; the system Node may be older, so use `~/.nvm/versions/node/v24.20.0/bin` (`.nvmrc` says 24).

```sh
cd site
npm run dev        # dev server on :4321 (the API's CORS allows this port), page server-rendered like the build
npm run build      # client build + SSR build + prerender.mjs → site/dist (upload its contents, .htaccess included); URLs from .env.production
npm run check      # type check (tsc)
npm run lint       # ESLint (typescript-eslint + react-hooks); npm run format = Prettier (CSS excluded)
npm test           # Vitest + Testing Library (jsdom): src/**/*.test.ts(x)
npm run test:e2e   # Playwright on the production build (vite preview :4173), system Chrome, desktop + Pixel 7; API/Keycloak mocked with page.route
```

- Routes (React Router 7, declarative): `/` (`src/paginas/Inicio.tsx`), `/projetos/:slug` (`Projeto.tsx`, the featured projects from `src/dados/projetos.ts`; a slug is a published URL, don't change it) and anything else → `NaoEncontrada.tsx` (404). Per-route `<title>`/description live in `src/lib/cabecalho.ts`, which also lists the pages to prerender (`paginasDoBuild`).
- `index.html` (template with `<!--cabecalho-->`/`<!--app-->`/`<!--dados-->`) → `src/main.tsx` hydrates `src/App.tsx` inside `BrowserRouter`; pages are composed from `src/components/*` (one component + one `.css` per section, CSS nested under the section's root class). Every button is `<Botao>` (`to` → route link, `href` → link, else `<button>`; `variante` primario/perigo) and every card/panel is `<Card>` (`as` picks the element); don't write `className="botao"`/`"painel"` by hand. `useNavegacao` updates the tab title and scrolls to the `#hash`/top on client navigation.
- `src/entry-server.tsx` renders a route inside `StaticRouter`; `prerender.mjs` writes every page at build (`dist/index.html`, `dist/projetos/<slug>.html`, `dist/404.html`) without calling the API (only `geradoEm` travels in `<script id="dados">`); the `paginaNoDev` plugin in `vite.config.ts` renders whatever URL is requested in dev. `public/.htaccess` (copied into `dist/`) rewrites `/x` to `x.html` (shared links and refresh land on the right page), serves `404.html` with a real 404 and sets cache headers; `public/admin/.htaccess` adds no-store/noindex.
- `src/dados/` holds curated content. Local images are imported with `?w=…&format=webp&as=picture` (vite-imagetools).
- API data: `App` reads `/snapshot` once per visit (`hooks/useSnapshot` → `Carga`: carregando / erro / pronto, plus `tentarDeNovo`) and hands it to `Videos`, `Projetos` (pinned repos) and `Abertura` (counts, then live over SSE in `useContagensAoVivo`). Every API-fed block has a skeleton shaped like the real content, an error state with retry and an empty state; content that arrives later uses the `.chega` fade-in instead of the scroll-reveal hidden state. The contact form and the panel lock their buttons with a spinner while sending (plus a ref guard against double clicks).
- `admin/index.html` + `src/admin/*`: the admin panel (React, keycloak-js with PKCE) calling `/admin-api` for the contact messages (`Mensagens.tsx`), the featured projects (`Destaques.tsx`; keys resolved by `src/lib/destaques.ts`, also used by the home) and the typed-in counts; client-rendered only, outside the router. When the API or Keycloak doesn't answer it shows `components/FalhaApi` (friendly message + retry); Keycloak is pinged first because keycloak-js would otherwise redirect to a dead login page.
- Theme: dark default, light as a visitor option. Colors are tokens in `src/styles/global.css` (`:root` and `:root[data-tema="claro"]`); never hard-code a color in component CSS. `src/lib/tema.ts` + `components/TrocaTema` store the choice in `localStorage`; an inline script in `index.html`/`admin/index.html` applies it before paint. Palette and contrast rules in `DESIGN.md` (Light Theme).
- `src/scripts/movimento.ts` holds the animations: `animarMarca` (header, once, from `App`) and `animarPagina(main)`, which each page calls through `usePaginaAnimada` so content animates after client navigation too; `cursor.ts` is started once by `App`. Hidden initial states are in `src/styles/global.css` and only apply with JS and without `prefers-reduced-motion`.
- Tests: the contact rules (`lib/contato.test.ts`), the form (`components/Contato.test.tsx`), the admin login and blocking (`admin/api.test.ts`, `admin/Painel.test.tsx`) and the same flows end to end (`e2e/`). The backend side (field errors, 401/403 on `/admin-api`) is in the API's JUnit tests.
- Env vars keep the `PUBLIC_` prefix (`envPrefix` in `vite.config.ts`). Built against the API with `API_URL=… PUBLIC_API_URL=… npm run build`.

### Site code conventions (also in README "Código do site")

- Folders by responsibility: `paginas/` (one per route), `components/` (presentation only, each with its own `.css`), `hooks/` (screen logic and state), `services/` (every call to the outside: `api.ts` public API, `autenticacao.ts` Keycloak, `painel.ts` admin API), `lib/` (pure functions and types, no React, no network), `dados/` (curated content), `admin/` (panel screens), `scripts/` (imperative animations), `styles/`.
- Component → hook → service. Never call `fetch`, `EventSource` or keycloak from a component; add a service function and a hook (`useCarregamento` covers load/error/retry). Don't `setState` synchronously in an effect (lint rule `react-hooks/set-state-in-effect`): reset state from the event handler, derive what you can, use `useSyncExternalStore` for state that lives outside React.
- Names: Portuguese (domain language). PascalCase for components/types (file = export: `Topo.tsx` → `Topo`), `useX` hooks in camelCase files, camelCase functions with verbs (`listarMensagens`), UPPER_CASE module constants, lowercase CSS classes nested under the component's root class. Tests next to the file (`*.test.ts(x)`), e2e in `e2e/*.spec.ts`.
- Enforced: ESLint + Prettier (tabs, single quotes, 160 cols; CSS keeps one rule per line and is not formatted). Husky (`site/.husky/pre-commit`, installed by `npm install` through `prepare`, `core.hooksPath=site/.husky/_`) runs lint-staged and `npm run check` before any commit touching `site/`; a lint error blocks the commit. Don't bypass it with `--no-verify`.

## API (`api/`)

Quarkus 3 on Java 25 (sdkman's default here). See `api/README.md` for endpoints and environment variables.

```sh
cd api
./mvnw quarkus:dev     # dev on :8080
./mvnw test            # unit tests + @QuarkusTest (random port; 8081 is taken on this machine)
./mvnw package && java -jar target/quarkus-app/quarkus-run.jar
```

- Videos are the Instagram Reels (`META_API_KEY`): `fontes/Instagram` (Graph API; the token type is probed on first use, not guessed from its text: Facebook tokens go through the linked Page, Instagram-login tokens are renewed daily via `fontes/TokenMeta` into `dados/meta-token.json`) → `videos/Reels` (cover copied to MinIO via `capas/CapasMinio`, title/category from the caption in `videos/Legenda`).
- Contact form: `contato/ContatoRecurso` validates (`contato/Mensagem`; rules and texts mirrored in `site/src/lib/contato.ts`, change both), saves to `dados/mensagens.json` through `contato/Caixa` (before the e-mail, so a mail failure doesn't lose it) and mails it via `contato/Carteiro`.
- The `/admin` panel (Keycloak login, `@RolesAllowed("admin")`) shows the contact messages (`/admin-api/mensagens`: read/answered/delete), picks the home's featured projects (`admin/Destaques` → `snapshot.destaques`, keys `projeto:<slug>` / `github:<nome>` validated against `snapshot.publicos`) and types Instagram's count when there's no Meta token (TikTok shows the handle only, never a count): `admin/AdminRecurso` (`/admin-api/*`, `@RolesAllowed("admin")`, Keycloak tokens via quarkus-oidc) → `admin/Numeros`. Tests swap MinIO for `CapasEmMemoria` (`@Mock`) and use `@TestSecurity`.
- `fontes/` holds the automatic sources (`YouTube`, `GitHub` — pinned repos via GraphQL with a token, the 6 most recently pushed public repos via REST without one; pauses until the reset when GitHub reports the rate limit — and `Instagram`); `Conjunto` picks which; `coleta/Coletor` reads them with `@Scheduled` (Instagram every 5 min, its own rate limit; a repeated read error is logged once). Numbers are never invented: no source = handle only.
- `snapshot/Estado` keeps the last snapshot in `dados/snapshot.json` and fires CDI events (`Eventos`); `web/Transmissor` (SSE) observes count changes.
- Keep it simple: no virtual threads, no circuit breaker (user decision).

## Docker (backend only)

`docker-compose.yml` runs the backend on the user's VPS through Coolify: `api`, `minio` (Coolify's image; the official one is no longer published) and `keycloak` (`keycloak/Dockerfile` + `keycloak/realm-portfolio.json`, which uses `${SITE_URL}` for redirect URIs). The site is not in Docker: it's static files on Hostinger (`henriquebueno.com`); API and Keycloak are `api.` and `auth.` subdomains on the VPS. Coolify owns the domains/HTTPS and the env vars, so the main compose file publishes no ports and reads no `.env` file; locally add `-f docker-compose.local.yml` (API :8082, Keycloak :8180; :8081 is taken on this machine), use `.env` (template `.env.example`, never committed) and pass `-p portfolio` (the folder is named `portifolio`, so without it Compose starts a second, empty project). Deploy steps for both parts are in `README.md`.

## Git workflow

- GitHub Flow: `main` is always releasable. Before changing anything, branch off `main` as `<type>/<short-topic>` (`feat/…`, `fix/…`, `docs/…`, `refactor/…`, `test/…`, `build/…`, `chore/…`). Integrate with a pull request, or locally with `git merge --no-ff <branch>` on `main`, then delete the branch. The `pre-commit` hook rejects commits on `main` (except the commit that concludes a merge).
- Conventional Commits, in English, imperative: `<type>(<scope>): <subject>`, scope optional and one of `site`, `api`, `docker`, `keycloak`, `deps`; header ≤ 100 chars; body explains why. Checked by commitlint in the `commit-msg` hook (`site/commitlint.config.js`). Split commits by area (api, site, docs) and stage with `git add -A <path>`; check `git diff --cached` first, since earlier `git rm`/`git mv` are already staged.
- Never bypass hooks with `--no-verify`. Commit, merge into `main` or push only when the user asks.

## Prompt log

Every user prompt is saved automatically to `prompts/NNN.md` (001, 002, ...) by a `UserPromptSubmit` hook (`.claude/settings.json` → `.claude/hooks/save-prompt.sh`). The next number is the highest existing `NNN.md` + 1. Don't rename or renumber files in `prompts/`, and don't write to it by hand.
