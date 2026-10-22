---
version: 1
slug: "mocks-b-diagrama-html"
primary_target: "mocks/b-diagrama.html"
related_targets: []
---

## Scope

Home of the bueno_dev portfolio, the only page. Mode: Experience. Chosen sketch: `mocks/b-diagrama.html`.

## Audience and job

Personal portfolio + creator showcase. Order: personal opening (with CTAs + numbers strip) → about → latest 8 videos → featured projects (screenshots) + pinned repos → stacks → awards (Premiações) → contact form. Actions: see projects, open a video on Instagram, follow, send a message or copy the contact e-mail.

## Direction contract

THESIS: A personal portfolio dressed as one of his video covers: the person first, with the videos' panels and pills stuck onto the photo. Refuses the generic dev-portfolio hero (avatar circle, gradient name, "Hi, I'm").

OWN-WORLD: The Remotion video system, unchanged: ground #0B0F17 with a 48px diagram grid, panels #141B27 with #2A3549 borders and 14px radii, mono pills in yellow/green/red/blue/purple, red/green carry failure/ok, Inter 800 captions with the keyword in #FFC247, JetBrains Mono for labels, data and status.

STORY: In one viewport the visitor meets Henrique (photo, name, role, one line on the videos, network links with counts). Scrolling: latest videos, pinned GitHub projects, stacks as a layered chain (like the boot-chain scene), about (summary + languages beside a "how I explain a concept" panel: problem → concept → takeaway; no work timeline), quiet contact.

FIRST VIEWPORT: Two columns: left, the GitHub photo (460px square, 18px radius) with cover-style overlays: a rotated Java/Spring Boot panel top-left, a rotated AWS panel bottom-right, a yellow @bueno_dev stamp on the bottom edge. Right: "Henrique Bueno" in Inter 800 (~84px), "Desenvolvedor backend" in yellow below, one-line bio, a 2×2 grid of network link panels (Instagram/YouTube with live counts, TikTok handle, GitHub), "Brasil". Primary actions: the network links.

FORM: Grounded candidate 1 of 7 (the videos' own diagram language), chosen as IMPECCABLE'S PICK over the assigned thermal-receipt direction. seed:b6b394326eb54145

Signature interaction: none heavy; the cover-style overlay panels on the photo and live counts updating in place over SSE.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Constraints

- Nothing depends on current videos: no fixed topics, scenes or captions; category pills come from caption hashtags.
- No concept pages, no ported scenes, no simulator, no embedded players, no API status/breaker on the page.
- Contact: form posting to the API, plus copyable e-mail with "copiado ✓" pill and social links, at most one neutral line.

## Open decisions

- None blocking; the user still owes repo descriptions and a higher-res photo (optional).
