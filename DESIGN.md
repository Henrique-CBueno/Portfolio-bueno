---
name: bueno_dev
description: Personal portfolio and video showcase for Henrique Bueno, dressed in the visual language of his Remotion videos.
colors:
  signal-yellow: "#FFC247"
  ok-green: "#3DDC84"
  failure-red: "#FF5A5F"
  diagram-blue: "#5B9DFF"
  diagram-purple: "#B48CFF"
  night-ground: "#0B0F17"
  panel: "#141B27"
  panel-raised: "#1C2535"
  wire: "#2A3549"
  text: "#E9EDF3"
  text-soft: "#C3CAD6"
  muted: "#8A95A8"
  light-ground: "#F4F1EA"
  light-panel: "#FBF9F4"
  light-panel-raised: "#ECE7DC"
  light-wire: "#D6CFC0"
  light-text: "#1A1A1A"
  light-text-soft: "#3D3A35"
  light-muted: "#66625A"
  light-amber: "#7D4F00"
  light-ok-green: "#17703D"
  light-failure-red: "#A8262C"
  light-diagram-blue: "#2459B8"
  light-diagram-purple: "#6B3FC0"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(48px, 6vw, 84px)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.035em"
  caption:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(38px, 4.4vw, 64px)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.5
  body-lead:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1
  data:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
  number:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.03em"
rounded:
  chip: "6px"
  control: "10px"
  button: "12px"
  panel: "14px"
  photo: "18px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "20px"
  lg: "28px"
  xl: "56px"
  section: "72px"
  gutter: "32px"
  gutter-mobile: "16px"
components:
  button-primary:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.night-ground}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "13px 20px"
  button-secondary:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "13px 20px"
  pill:
    textColor: "{colors.signal-yellow}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "6px 11px"
  panel:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.panel}"
  input:
    backgroundColor: "{colors.night-ground}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "13px 14px"
  stamp:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.night-ground}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "8px 16px"
  chip:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.text}"
    typography: "{typography.data}"
    rounded: "{rounded.chip}"
    padding: "5px 9px"
---

# Design System: bueno_dev

## Overview

**Creative North Star: "The Living Cover"**

The site is one of Henrique's video covers, extended into a page. The same night-blue ground with a faint diagram grid, the same system panels and mono pills, the same bold caption with one yellow word. Someone who saw a Reel should recognize the site before reading a word. The person comes first (photo, name, role), and the panels are stuck onto that person the way the videos stick diagram cards over his face.

Density is calm: few elements per viewport, big type for names and claims, small mono text for facts and data. Color is functional, never decorative. Yellow marks the one thing to read, green means ok, red means failure, blue and purple only appear as category or organizer colors inside pills and diagram nodes.

Motion comes from the videos, built with Motion (`site/src/scripts/movimento.ts`). Headings rise word by word from a clipped line, like the videos' captions (0.7s, `cubic-bezier(.2,.8,.2,1)`, 0.07s stagger). Stuck-on elements land with a spring: photo overlays drop in and settle, yellow stamps "slap" from 2× scale. Chains light up link by link, with the wire drawing before each panel. Diagrams build node by node, then small yellow packets run along the wires while the diagram is on screen. Counts tick up from zero once. Everything else fades up 16–24px when it enters the viewport, and hover lifts 2–4px. After landing, the opening photo stays alive: the stuck-on cards float on their own rhythms (4–6s), the stamp bobs, the photo breathes (scale 1→1.035 over 9s), and the whole portrait tilts in 3D toward the mouse (up to 7°) with the cards shifting more than the photo, as if they were stuck on top. The cursor is one of the diagrams' yellow packets with a trailing wire ring; the background grid lights up in a 240px circle around it; over links the ring grows yellow, and over video covers and repos it becomes a yellow label ("assistir", "abrir"). Cursor and tilt only run with a fine pointer (`site/src/scripts/cursor.ts`). With `prefers-reduced-motion: reduce` or without JS, nothing moves and the whole page is visible.

The world was chosen on 2026-10-22 from three mocked directions (a thermal-receipt roll and a streaming title-card wall were rejected). Reference build: `mocks/b-diagrama.html`.

**Key Characteristics:**
- Night-blue ground with a 48px diagram grid behind everything.
- Panels with 1.5px wire borders and 14px corners; no floating cards without a border.
- Inter 800 for names, headlines and captions; JetBrains Mono for every label, date, number, handle and tag.
- One yellow keyword per heading; meaning-bearing green/red.
- Stuck-on elements (photo overlays, the yellow stamp, award stamps) are the only tilted things on the page.
- Motion tells the videos' story: captions rise, stickers land, chains light up, packets run.

## Colors

A dark diagram palette lifted straight from the videos' theme file: one warm signal color over cool night blues, with green and red reserved for meaning. Dark is the site; a light theme exists only as a visitor's choice (see **Light Theme** below).

### Primary
- **Signal Yellow** (`signal-yellow`): the emphasis color. The keyword in each heading (`Últimos **vídeos**`, `Projetos em **destaque**`), the role line under the name, the primary button, the handle stamp and award stamps, link underlines, focus rings and text selection.

### Secondary
- **Ok Green** (`ok-green`): "working / good". The live dot next to the brand, the AWS overlay on the photo, the "copiado" and "mensagem enviada" confirmations, the cloud/devops layer.
- **Failure Red** (`failure-red`): "broken / problem". Invalid form fields, the "o problema" step, the resilience category, the messaging layer.

### Tertiary
- **Diagram Blue** (`diagram-blue`) and **Diagram Purple** (`diagram-purple`): category and organizer colors only, always inside a pill or a diagram node outline (consistency/security categories, databases, observability, AI, organizers like FIAP or CREA JR-DF).

### Neutral
- **Night Ground** (`night-ground`): page background, input wells, text on yellow.
- **Panel** (`panel`): every card, panel and secondary button.
- **Panel Raised** (`panel-raised`): icon tiles inside panels, tech chips, the browser bar above project screenshots.
- **Wire** (`wire`): all borders, dividers, diagram connectors and the background grid (at 28% opacity).
- **Text** (`text`): headings and emphasized words.
- **Text Soft** (`text-soft`): long body copy inside panels and project descriptions.
- **Muted** (`muted`): bios, dates, captions, mono metadata, neutral pills. Lighter than the videos' `#7C879A` so small mono text stays legible on the panel color.

### Named Rules
**The One Yellow Word Rule.** A heading gets at most one yellow phrase, and it is the noun the section is about. Yellow on a second element in the same block means one of them is wrong.

**The Meaning Rule.** Green only ever means ok and red only ever means failure or problem, as in the videos. Never use them as decoration or as "brand colors".

### Light Theme
A visitor option (decided 2026-11-01), never the default: every first visit opens dark, and the choice is remembered (`localStorage`, applied in `<head>` before painting so dark never flashes). Toggled by the sun/moon button in the top bar. It is the videos' paper and ink, not a generic white theme:
- **Paper Ground** `#F4F1EA`, **Paper Panel** `#FBF9F4`, **Paper Raised** `#ECE7DC`, **Paper Wire** `#D6CFC0`; **Ink** `#1A1A1A`, **Ink Soft** `#3D3A35`, **Ink Muted** `#66625A`. The background grid becomes ink at 6%.
- **Signal Yellow stays a fill only** (primary button, stamps, underlines, the cursor packet): on paper it reads at 1.4:1, so yellow *words*, yellow pills and the focus ring switch to **Signal Amber** `#7D4F00`. Text on yellow is always night ink (`#0B0F17`), in both themes.
- Green, red, blue and purple take darker twins (`#17703D`, `#A8262C`, `#2459B8`, `#6B3FC0`) so pills keep ≥ 4.5:1 even on their 12% tint.
- Shadows turn warm and light (`rgba(70,52,20,.14)`) instead of black.
- Every color comes from a token in `site/src/styles/global.css` (`:root` and `:root[data-tema="claro"]`); no hard-coded colors in component CSS, or the light theme breaks.

**The Pill-Only Rainbow Rule.** Blue and purple (and green/red when used as categories) appear only as a pill's text/border or a diagram node's outline, tinted 12% into the ground. Never as section backgrounds, gradients or large fills.

## Typography

**Display Font:** Inter (with system-ui, sans-serif), weights 500/700/800
**Label/Mono Font:** JetBrains Mono (with ui-monospace, monospace), weights 500/700

**Character:** Inter 800 at tight negative tracking is the videos' caption voice: loud, short, spoken. JetBrains Mono is the "system UI" voice: every fact that a machine could print (dates, counts, handles, tags, file-ish labels) is mono.

### Hierarchy
- **Display** (`display`): the name in the opening, once per page.
- **Caption** (`caption`): an uppercase video-style claim sentence ("Primeiro lugar em 2 hackathons"), with its keyword in yellow. At most one per section, only where the section makes a claim.
- **Headline** (`headline`): section titles (`h2`), with the one yellow word.
- **Title** (`title`): card titles for featured projects and awards (19–22px). Mono 16px is used instead when the title is a repo name.
- **Body** (`body` / `body-lead`): 15–16px inside panels, 17–18px for bios, about and contact intros. Keep line length at 46–70ch.
- **Label** (`label`): pills, buttons, form labels, stamps. Always mono 700, 12–14px, lowercase in the UI.
- **Data** (`data`): dates, handles, follower counts, tech chips, footer. Mono 500, 11.5–13px, tabular numbers for counts.
- **Number** (`number`): the numbers strip in the opening (24px on mobile), with the "+" or "×" suffix in yellow.

### Named Rules
**The Machine-Prints-Mono Rule.** If a value could have come from an API or a log (a count, a date, a handle, a version, a tech name), set it in JetBrains Mono. Human sentences are Inter.

**The Lowercase Label Rule.** Pills, buttons and labels are lowercase ("ver projetos", "falar comigo", "1º lugar"). Uppercase is reserved for the caption sentence.

## Layout

One centered column, max width 1280px, with 32px side gutters (16px under 960px). Sections are stacked with 72px vertical padding; the opening has 40px top and 96px bottom. The background grid is fixed to the page, 48px cells, so panels sit on a visible diagram canvas.

Section headers are a row: headline on the left, a muted mono link or one-line description on the right, baseline-aligned, stacking under 960px.

Grids are asymmetric by default: opening `460px | 1fr` (gap 72px), stacks `7fr | 5fr`, awards `4fr | 8fr`, contact `5fr | 7fr`, about `1fr | 1fr`. Repeated items use even grids: 4 video covers per row (2 on mobile), 2 featured projects per row (1 on mobile). Everything collapses to one column at 960px. Long repeated lists become horizontal carousels on phones instead of stacking: video covers (about 2 visible, 46% wide) and featured projects (86% wide, the next card peeking in), with scroll-snap, edge-to-edge bleed and a small indicator under them (bars, the active one yellow and longer, plus a mono "n / total"). On phones, featured project descriptions clamp to 4 lines and repo descriptions to 2; stack layers put the pill and the chips on one wrapping line.

**The Follow-Along Rule.** In a two-column section, the shorter column is sticky (96px from the top, under the sticky header) and travels with the taller one until the section ends, so neither side leaves an empty gap while scrolling. Desktop only; on one column nothing sticks.

Spacing rhythm: 6–10px inside chips and pill rows, 14–20px inside cards, 20–28px between cards, 48–56px between columns, 72px between sections.

## Elevation & Depth

Mostly flat: depth comes from tonal layering (ground → panel → panel-raised) and wire borders, not shadows. Shadows are reserved for things that are physically stuck on top of something else, and they are deep and soft, like a sticker casting onto the video frame.

### Shadow Vocabulary
- **Photo lift** (`box-shadow: 0 30px 70px rgba(0,0,0,.5)`): the opening photo only.
- **Stuck-on panel** (`box-shadow: 0 12px 30px rgba(0,0,0,.45)`): overlay panels on the photo.
- **Yellow stamp** (`box-shadow: 0 10px 30px rgba(255,194,71,.25), 0 10px 24px rgba(0,0,0,.4)`): the handle stamp and award stamps; a warm glow plus a dark drop.
- **Live dot ring** (`box-shadow: 0 0 0 4px rgba(61,220,132,.16)`): the green dot next to the brand.

### Named Rules
**The Sticker Rule.** Only stuck-on elements get a shadow, and only stuck-on elements may rotate (−3° to 5°). Cards, sections and buttons are flat and straight.

## Shapes

Gently rounded, system-UI rectangles. Chips 6px, inputs and icon tiles 8–10px, buttons and stamps 12px, panels and covers 14px, the opening photo 18px, pills fully round. Borders are 1.5px everywhere (1px only for faint inner dividers at 70% wire). Icon tiles are square (30–52px) with the icon centered on panel-raised.

Diagram nodes reuse the same shapes: rounded panels joined by 2px wire connectors with a small arrowhead, as in the videos' boot-chain and architecture scenes. Layered lists (the stacks chain, the "como eu explico" steps) connect consecutive panels with a short vertical wire.

## Components

### Buttons
- **Shape:** 12px corners, 1.5px border, mono 700 14px label with a trailing 16px Lucide icon.
- **Primary:** yellow fill and border with night-ground text. Used for the one main action in a block ("ver projetos", "enviar mensagem").
- **Secondary:** panel fill, wire border, text color ("falar comigo").
- **Hover / Focus:** lifts 2px over 0.3s `cubic-bezier(.2,.8,.2,1)`; the secondary border brightens to muted, the primary lightens to `#FFD27A`. Focus is a 2px yellow outline offset 3px.

### Pills
- **Style:** fully round, 1.5px `currentColor` border, background `currentColor` mixed 12% into the ground, mono 700 12px, optional 13px icon.
- **Use:** categories on video cards (from the caption hashtag), tech tags on featured projects, organizers on awards, languages in about, social links in contact, state feedback ("copiado", "enviando…", "mensagem enviada"). Neutral (muted) pill when a category has no assigned color.

### Chips
- **Style:** panel-raised fill, no border, mono 500 12–13px, 6px corners. Used for tech items inside the stacks chain and repo languages, where a pill's color would be noise.

### Cards / Containers
- **Corner Style:** 14px.
- **Background:** panel, with panel-raised for nested tiles.
- **Shadow Strategy:** none (see the Sticker Rule).
- **Border:** 1.5px wire; a colored border (yellow, green, blue) marks a featured or meaningful card, never more than one or two per section.
- **Internal Padding:** 20–28px.
- **Hover:** linked cards lift 3–4px and the border brightens (yellow on video covers).

### Inputs / Fields
- **Style:** night-ground well inside a panel, 1.5px wire border, 10px corners, Inter 500 16px, padding 13px 14px. Labels above in mono 700 12px muted.
- **Focus:** border turns yellow, no glow.
- **Error:** border turns failure-red after the user interacts (`:user-invalid`).
- **Feedback:** the submit row shows state as a pill (yellow "enviando…", green "mensagem enviada").

### Navigation
- **Style:** sticky top bar. On the left, the brand as a tag: `< HENRIQUE BUENO />`, the name in Inter 800 uppercase (19px, 17px on phones) between JetBrains Mono 700 brackets in signal yellow (carried over from the old site, henriquebueno.com, into this identity). On load the brackets open from the center and reveal the name; on hover they move 5px apart. On the right, section links in mono 500 13px muted, with a panel-colored marker that slides to the current section. Links hidden under 960px.

### Opening photo with stuck-on panels (signature)
The GitHub photo at 1:1 with 18px corners, overlaid by small tilted panels (icon tile + mono title + mono subtitle) at the corners and a yellow handle stamp straddling the bottom edge. This is how the videos put diagram cards over Henrique's face.

### Video cover card
9:16 cover with 14px corners and wire border, title below in Inter 700 16px, then a category pill and a mono relative date. Hover: yellow border and 4px lift.

### Featured project card
Panel with a browser bar (three wire dots + mono URL) over a 16:9 screenshot cropped from the top. When there is no screenshot, the slot shows the project's architecture as a diagram of nodes and wires on a 24px grid. Below: tech pills, title, description, and mono links underlined in yellow.

### Layered chain
Stacked panels, each with a category pill on the left and chips on the right, joined by short vertical wires. Used for the stacks section and the "como eu explico" steps.

### Award
A caption claim on the left; on the right, awards with a photo get a wide card (photo left, text right) with a tilted yellow "1º lugar" stamp; awards without a photo get a compact row (icon tile, text, pills). A missing photo never leaves an empty slot.

### Copyable e-mail
Large mono e-mail with a 3px yellow underline next to a neutral "copiar" pill that turns into a green "copiado" pill for ~2s.

## Do's and Don'ts

### Do:
- **Do** keep every surface on the night ground with the 48px wire grid visible behind it.
- **Do** give each heading exactly one yellow word or phrase.
- **Do** set every count, date, handle and tech name in JetBrains Mono, with tabular numbers for counts.
- **Do** use green only for ok/success and red only for failure/problem.
- **Do** draw technical explanations as nodes and wires in the videos' style when an image is missing.
- **Do** honor `prefers-reduced-motion`: all transitions off, smooth scroll off.
- **Do** keep looping motion to diagrams and the opening photo, and pause it when it leaves the screen.

### Don't:
- **Don't** make the light theme the default or follow the system setting on a first visit; the site is the dark cover world, and paper is only the visitor's choice.
- **Don't** use signal yellow for text on paper; use Signal Amber.
- **Don't** add gradients, glows or colored section backgrounds; color lives in pills, stamps, borders and one word per heading.
- **Don't** rotate or shadow anything that is not stuck on top of something else.
- **Don't** animate tilt with `transform`; tilt lives in the CSS `rotate` property so entrance animations (which use `transform`) keep it.
- **Don't** add a generic dev-portfolio hero (avatar circle, gradient name, "Hi, I'm…").
- **Don't** show API status, latency or circuit-breaker state on the page.
- **Don't** hardcode video topics, scenes or categories; category colors come from caption hashtags.
