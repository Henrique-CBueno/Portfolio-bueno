# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

- Site: React + Vite (moved from Astro on 2026-11-01), static, hosted on Hostinger (user decision 2026-11-01: the front is not in Docker). Fixed content is prerendered to HTML; videos, follower counts and pinned repos are fetched from the API in the browser on each visit, with loading skeletons, an error state with retry and empty states; counts then update live over SSE. Last known numbers baked in at build; live updates over SSE. Rebuilt when the API sees a new post.
- API (`api/`): Java 25 + Quarkus, kept simple (no virtual threads, no circuit breaker). Videos and the Instagram follower count come from the Instagram Graph API (`META_API_KEY`; decided 2026-11-01, replacing the panel form used since 2026-10-22): covers are copied to MinIO, data goes to `dados/snapshot.json`. Without the token, Instagram's count is typed in the site's `/admin` panel (TikTok shows no count), login via Keycloak (role `admin`). Scheduled reads: YouTube subscribers every 30 s, Instagram every 5 min, pinned repos every 10 min. Serves `GET /snapshot`, `GET /capas/<id>`, SSE `GET /stream`, `POST /contato`, and `/admin-api/*` for the panel.
- Hosting: the static site on Hostinger web hosting (`henriquebueno.com`, files uploaded by hand); the backend (API, MinIO, Keycloak) on the user's Hostinger VPS with Coolify, deployed from Git with Docker Compose: API `api.henriquebueno.com`, Keycloak `auth.henriquebueno.com` (user decision: front only the static site, back only the API).
- No Remotion in the site. Components from the video project may be copied, but nothing is ported per video.

## Users

Personal portfolio and creator showcase in one home. Audiences: the video audience (watch, follow), brands and companies (contact), and people evaluating Henrique as a developer (projects, about). Order: personal opening → about → latest videos → projects → stacks → awards → contact (about moved to second on 2026-10-22).

## Product Purpose

A showcase ("vitrine") for Henrique Bueno (`bueno_dev`), a developer who makes short videos teaching backend concepts. Low upkeep: posting a Reel on Instagram is enough; the site shows it within ~5 min without republishing. Success: a visitor understands who he is in one viewport, sees the latest videos, and finds a calm way to get in touch.

## Positioning

Explains backend and distributed-systems concepts (concurrency, resilience, consistency, security) in ~80–90s vertical videos, in PT-BR, built from everyday scenarios (Black Friday checkout, concert seat, the Brazilian voting machine) and animated "living system diagrams" coded in Remotion. Site tagline: "Sistemas distribuídos em 90 segundos, com exemplos do Brasil." Profile: "Desenvolvedor backend · Java · AWS", Brasil; GitHub "Full-Stack focused in Spring Boot"; LinkedIn `henrique-cbueno`.

## Operating Context

- Videos are 1080×1920 Reels/Shorts, posted to Instagram, TikTok and YouTube.
- Videos are the account's Instagram Reels (user decision 2026-11-01: Instagram only, the panel no longer registers videos). Title = first line of the caption without hashtags; category = first hashtag that is a known category (`#resiliencia`, with or without accents); cover = the Reel's thumbnail, copied to MinIO; the card links to the Reel. Per-video TikTok/YouTube links are no longer shown. A new, edited or deleted Reel shows on the site within ~5 min (the browser reads the API). No embedded players.
- Categories (chosen in the panel) = pill color: `resiliencia` red, `concorrencia` green, `consistencia` yellow, `seguranca` blue, `arquitetura` purple; a category without a color is a neutral pill; none = no pill. The list lives in the API config (`portfolio.categorias`).
- Follower counts: YouTube comes from its API (rounded, shown as approximate). Instagram comes from its API (exact). TikTok shows only the handle, never a follower count (user decision 2026-11-01; it had no API, the number was typed in the panel). Without the Meta token, Instagram's count is typed in the panel (the panel shows when it was last updated; the site shows only the number, no date — user decision). Empty = only the handle.

## Capabilities and Constraints

- Follower counts shown as small labels on the network links in the opening, pushed live over SSE when they change. Never invented: without a source the label is just the handle. No API status, latency or circuit-breaker state on the page (user rejected it).
- Opening: name, role, one-line bio, CTAs "ver projetos" (→ #projetos) and "falar comigo" (→ #contato), a numbers strip (years of experience computed at build from the first job, 2025-04; "20+ projetos entregues" as the user states it; "2× 1º lugar em hackathon" counted from the awards file), network links with live counts.
- Projects (added 2026-10-22 after comparing with the old site, henriquebueno.com): "Projetos em destaque" is a curated content file (title, screenshot, tech tags, description, links), because some of them are not on GitHub (Gioia Investimentos, NegociaDF). Only projects in production are featured (decided 2026-10-22). Each featured project has its own page at `/projetos/<slug>` (decided 2026-11-01: featured only, the pinned repos keep linking to GitHub): tags, title, large screenshot, description and links, plus links to the other projects; the home card opens it. Unknown addresses get a friendly 404 page; the `/admin` panel shows a friendly message with retry when the API or the login doesn't answer. Current list: Revi (team project, revi-jovi.vercel.app: photo of the notebook → AI flash cards, summary, mock exam, mind map; Spring Boot, LangChain4j, S3, PostgreSQL, React; shown as the wide lead card), Gioia Investimentos, NegociaDF (participation). Cinema API and the CDC platform left the featured list and appear only among the pinned repos. Screenshots come from the old site (`mocks/assets/projeto-*.jpg`); a project without one gets a small diagram in the videos' style. Below it, "fixados no GitHub" stays automatic and live (user decision 2026-11-01: read from the API in the browser on each visit): pinned repos via GraphQL (without a token: the 6 most recently pushed public repos via GitHub's public REST API; no hand-copied list, decided 2026-11-01), card = repo description, falling back to the README's first paragraph, else name + languages only; repos already featured are skipped; a repo without description shows "sem descrição no GitHub". Each card also shows the main language's GitHub color and "atualizado há …" from the last push (decided 2026-11-01).
- Awards ("Premiações", replaced the certifications section on 2026-10-22; the user rejected both certification layouts): two columns. Left: "// premiações", the uppercase video-caption line "Primeiro lugar em 2 hackathons" (count computed from the awards file, keyword in yellow) and one supporting line. Right: awards with a photo get a wide featured card (photo left, text right; tilted yellow "1º lugar" stamp, date/event, title, one-line project description, context line, organizer pills); awards without a photo get a compact row (trophy icon, place, title, description, "1º lugar" + organizer pills), so a missing photo never leaves an empty slot. (Option B alone, from `mocks/premiacoes-opcoes.html`, was rejected as too empty.) Current: 1º lugar Hackathon AWS × Três Corações × FIAP (Cafeína Week 2026, out 2026; Grupo 4, desafio CORA Vendas, nota 4,62/5; project "Cora GPS": instead of the daily indicators PDF, the 3corações salesperson gets a route plan saying what to bring each client, how much and the chance of acceptance; photo `mocks/assets/premio-3coracoes.jpg`, cropped from the winner announcement in `~/Documentos/hackaton-3coracoes-fotos/`; the impact numbers on the pitch slides are marked as illustrative, so they are not used). 1º lugar Hackathon CREA JR-DF (Distrito Federal, no date or photo, so it is a compact row). Certifications (AWS Cloud Practitioner, Asimov, Udemy courses) are not on the page for now.
- About: built from the CV (`~/Documentos/profissional/cv/Henrique_Bueno_CV.yaml`): summary and languages, plus a "Como eu explico um conceito" panel (problema → conceito → frase, generic, never tied to a specific video). No experience/education timeline (user rejected it on 2026-10-22). Location shown as "Brasil" (user's choice, though the CV says São Paulo).
- Photo: GitHub avatar (460×460), so displayed at ≤ ~460 CSS px; a larger hero needs the original.
- Home shows the latest 4 videos (one row on desktop; user decision 2026-11-01) plus "ver todos no Instagram"; with no videos yet, a quiet panel points to the three networks.
- Nothing in the design may depend on the current videos: no fixed topics, scenes, captions or categories hardcoded. No per-concept pages, no ported scenes, no embedded players.
- Contact is one quiet section: a form (nome, e-mail, assunto optional, mensagem, hidden honeypot) that POSTs to the API (`/contato`), which sends it to `contato@henriquebueno.com` with the visitor's address as reply-to, rate-limited per IP; beside it the copyable domain e-mail and social links. One neutral line, no sales copy, no media kit, no job pitch.
- PT-BR only for now; structure ready for i18n.
- Domain: `henriquebueno.com` (from the CV); contact e-mail `contato@henriquebueno.com`. Never publish the phone or personal e-mail from the CV.
- Stacks section: layered chain (languages → backend → messaging → databases → cloud/devops → observability → security → tests) plus Architecture and AI-assisted-dev panels, all taken from the CV's skills.

## Brand Commitments

- Handle `bueno_dev` (Instagram `bueno_dev`, TikTok `bueno_dev0`, YouTube "Henrique Bueno | Dev" `@bueno_dev`, GitHub `Henrique-CBueno`).
- Video identity (from `src/comum/tema.ts`): Inter + JetBrains Mono; ground `#0B0F17`, panel `#141B27`, border `#2A3549`, text `#E9EDF3`, muted `#7C879A`, ok `#3DDC84`, error `#FF5A5F`, signature yellow `#FFC247`, blue `#5B9DFF`, paper `#F4F1EA`, ink `#1A1A1A`. The site inherits this world (chosen 2026-10-22 from three mocked directions).
- Voice: direct, spoken PT-BR, concrete scenario first, then the concept, ends with a one-line takeaway ("Timeout protege uma requisição. Circuit breaker protege o sistema inteiro.").
- Must not look AI-generated.

## Evidence on Hand

- 4 videos: `exemplos/circuit-breaker.mp4`, `fencing.mp4`, `urna.mp4`, `virtual-threads.mp4`; scripts in `~/YOUTUBE/edicao/src/<video>/roteiro.ts`.
- Social links: `exemplos/links.md` (YouTube Shorts link there looks truncated).
- No testimonials, sponsors, clients, press or employer info yet — do not invent any. Channel is new (fencing token Short: 78 views on 2026-10-22).

## Product Principles

1. Low upkeep: post on Instagram, everything else automatic.
2. Personal first: a real person (photo, role, projects), presented in the videos' visual language.
3. One identity across video and site: someone who saw a Reel recognizes the site.
4. Honest numbers: real counts, real status, approximations labeled.
5. Contact, not pitch.
