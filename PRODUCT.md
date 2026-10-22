# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

- Site: Astro, static, with JS islands only for the live diagram. Last known numbers baked in at build; live updates over SSE. Rebuilt when the API sees a new post.
- API: Java + Spring Boot (virtual threads), Resilience4j circuit breaker around each source. Also receives the contact form and sends it by SMTP. Polls Instagram and YouTube every ~20 s, pushes counts and per-source status (latency, breaker state) over SSE, refreshes the 60-day Instagram token itself.
- Hosting: the user's Hostinger VPS (site and API). Deploy is the user's responsibility.
- No Remotion in the site. Components from the video project may be copied, but nothing is ported per video.

## Users

Personal portfolio and creator showcase in one home. Audiences: the video audience (watch, follow), brands and companies (contact), and people evaluating Henrique as a developer (projects, about). Order: personal opening → about → latest videos → projects → stacks → awards → contact (about moved to second on 2026-10-22).

## Product Purpose

A showcase ("vitrine") for Henrique Bueno (`bueno_dev`), a developer who makes short videos teaching backend concepts. Zero upkeep: posting on Instagram updates the site. Success: a visitor understands who he is in one viewport, sees the latest videos, and finds a calm way to get in touch.

## Positioning

Explains backend and distributed-systems concepts (concurrency, resilience, consistency, security) in ~80–90s vertical videos, in PT-BR, built from everyday scenarios (Black Friday checkout, concert seat, the Brazilian voting machine) and animated "living system diagrams" coded in Remotion. Site tagline: "Sistemas distribuídos em 90 segundos, com exemplos do Brasil." Profile: "Desenvolvedor backend · Java · AWS", Brasil; GitHub "Full-Stack focused in Spring Boot"; LinkedIn `henrique-cbueno`.

## Operating Context

- Videos are 1080×1920 Reels/Shorts, posted to Instagram, TikTok and YouTube.
- Instagram (professional account) is the single video source. Each card shows the Instagram cover and links to the Instagram post. TikTok and YouTube appear as profiles only.
- Caption convention when posting: first line = card title; one category hashtag = pill color (`#resiliencia` red, `#concorrencia` green, `#consistencia` yellow, `#seguranca` blue, `#arquitetura` purple; unknown hashtag = neutral pill, no hashtag = no pill).
- TikTok follower count needs app review: until then the TikTok node shows only the handle. YouTube subscriber counts come rounded from the API; show them as approximate.

## Capabilities and Constraints

- Live follower counts (Instagram, YouTube; TikTok once approved) shown as small labels on the network links in the opening. No API status, latency or circuit-breaker state on the page (user rejected it).
- Opening: name, role, one-line bio, CTAs "ver projetos" (→ #projetos) and "falar comigo" (→ #contato), a numbers strip (years of experience computed at build from the first job, 2025-04; "20+ projetos entregues" as the user states it; "2× 1º lugar em hackathon" counted from the awards file), network links with live counts.
- Projects (added 2026-10-22 after comparing with the old site, henriquebueno.com): "Projetos em destaque" is a curated content file (title, screenshot, tech tags, description, links), because some of them are not on GitHub (Gioia Investimentos, NegociaDF). Only projects in production are featured (decided 2026-10-22). Current list: Revi (team project, revi-jovi.vercel.app: photo of the notebook → AI flash cards, summary, mock exam, mind map; Spring Boot, LangChain4j, S3, PostgreSQL, React; shown as the wide lead card), Gioia Investimentos, NegociaDF (participation). Cinema API and the CDC platform left the featured list and appear only among the pinned repos. Screenshots come from the old site (`mocks/assets/projeto-*.jpg`); a project without one gets a small diagram in the videos' style. Below it, "fixados no GitHub" stays automatic: pinned repos via GraphQL, card text = repo description, falling back to the README's first paragraph, else name + languages only; repos already featured are skipped; a repo without description shows "sem descrição no GitHub".
- Awards ("Premiações", replaced the certifications section on 2026-10-22; the user rejected both certification layouts): two columns. Left: "// premiações", the uppercase video-caption line "Primeiro lugar em 2 hackathons" (count computed from the awards file, keyword in yellow) and one supporting line. Right: awards with a photo get a wide featured card (photo left, text right; tilted yellow "1º lugar" stamp, date/event, title, one-line project description, context line, organizer pills); awards without a photo get a compact row (trophy icon, place, title, description, "1º lugar" + organizer pills), so a missing photo never leaves an empty slot. (Option B alone, from `mocks/premiacoes-opcoes.html`, was rejected as too empty.) Current: 1º lugar Hackathon AWS × Três Corações × FIAP (Cafeína Week 2026, out 2026; Grupo 4, desafio CORA Vendas, nota 4,62/5; project "Cora GPS": instead of the daily indicators PDF, the 3corações salesperson gets a route plan saying what to bring each client, how much and the chance of acceptance; photo `mocks/assets/premio-3coracoes.jpg`, cropped from the winner announcement in `~/Documentos/hackaton-3coracoes-fotos/`; the impact numbers on the pitch slides are marked as illustrative, so they are not used). 1º lugar Hackathon CREA JR-DF (Distrito Federal, no date or photo, so it is a compact row). Certifications (AWS Cloud Practitioner, Asimov, Udemy courses) are not on the page for now.
- About: built from the CV (`~/Documentos/profissional/cv/Henrique_Bueno_CV.yaml`): summary and languages, plus a "Como eu explico um conceito" panel (problema → conceito → frase, generic, never tied to a specific video). No experience/education timeline (user rejected it on 2026-10-22). Location shown as "Brasil" (user's choice, though the CV says São Paulo).
- Photo: GitHub avatar (460×460), so displayed at ≤ ~460 CSS px; a larger hero needs the original.
- Home shows the latest 8 videos plus "ver todos no Instagram".
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

1. Zero manual upkeep: a new post appears on its own.
2. Personal first: a real person (photo, role, projects), presented in the videos' visual language.
3. One identity across video and site: someone who saw a Reel recognizes the site.
4. Honest numbers: real counts, real status, approximations labeled.
5. Contact, not pitch.
