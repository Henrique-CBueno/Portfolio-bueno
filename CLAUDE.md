# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

Portfolio and video showcase for Henrique Bueno (bueno_dev). Product decisions live in `PRODUCT.md`, the visual system in `DESIGN.md` (tokens are normative; `.impeccable/design.json` is its sidecar). `mocks/b-diagrama.html` is the approved static mock; the other mocks are rejected directions. `exemplos/` holds the reference videos and social links.

## Site (`site/`)

Astro (static) + Motion for animations. Needs Node ≥ 22.23.4; the system Node may be older, so use `~/.nvm/versions/node/v24.20.0/bin` (`.nvmrc` says 24).

```sh
cd site
npm run dev        # dev server on :4321 (or: npx astro dev --background)
npm run build      # static output in site/dist
npx astro check    # type check
```

- `src/pages/index.astro` composes the single page from `src/components/*` (one component per section).
- `src/dados/` holds curated content; `src/lib/snapshot.ts` loads videos and follower counts from the API (`API_URL` at build) or from `src/dados/exemplo.ts`.
- `src/scripts/movimento.ts` holds every animation; hidden initial states are in `src/styles/global.css` and only apply with JS and without `prefers-reduced-motion`.
- The Spring Boot API (`api/`, not started yet) will serve `GET /snapshot`, SSE `/stream` and `POST /contato`.

## Prompt log

Every user prompt is saved automatically to `prompts/NNN.md` (001, 002, ...) by a `UserPromptSubmit` hook (`.claude/settings.json` → `.claude/hooks/save-prompt.sh`). The next number is the highest existing `NNN.md` + 1. Don't rename or renumber files in `prompts/`, and don't write to it by hand.
