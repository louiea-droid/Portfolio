# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Personal portfolio of Louie Apolinario, a working product designer and computer engineer (positioned as equal parts design and engineering; SaaS, dashboards, mobile, front-end). Single-page React 19 + Vite site, plain CSS, no router, no UI or animation libraries. Deployed on Vercel.

## Working preferences (from the owner)

- **Use the available skills, plugins and agents** for every non-trivial task:
  - design work → `frontend-design` (plus `ui-design-system`, `react-best-practices`, `senior-frontend` in `.claude/skills/`)
  - scroll/motion work → `scroll-experience`; speed and jank → `web-performance-optimization`
  - writing or editing site copy → `humanizer`
  - design/UX critique → the `ui-ux-designer` agent in `.claude/agents/`
  - check changes visually in a real browser with the Playwright plugin (desktop ~1366px and mobile 390px, light and dark)
- Keep it dependency-free: CSS and native browser APIs over libraries.
- Delete the `.playwright-mcp/` screenshot folder after browser checks.

## Commands

```bash
npm run dev      # Vite dev server
npm run build    # production build to dist/
npm run lint     # ESLint (flat config, react-hooks v7 rules)
npm run preview  # serve the built dist/
npm test         # assert-based check of the contact form validation (scripts/check-contact.mjs)
npx vercel dev   # run the site plus the /api function locally (needs Vercel CLI login)
```

There's no UI test suite. Verify with `npm run lint`, `npm test`, `npm run build`, and a browser check. `npm run dev` has no `/api`, so the contact form shows its fallback error there; that's expected.

## Architecture

- `src/content.js`: **all site copy and data** (profile, links, projects, process steps, about facts). Content edits go here, not in JSX. In each project, `tags` drives the Work filter chips, `kind` picks the CSS wireframe thumbnail (`dashboard | mobile | flow | list`), and `hue` tints it.
- `src/App.jsx`: every component in one file (Intro, Backdrop, Hero, Work + case-study dialog, Process, About, Contact, Toolbar).
- `src/index.css`: all styles. Design tokens live on `:root` and `:root[data-theme='dark']`.
- `index.html` has an inline script that sets `data-theme` before first paint. React reads that initial value; theme changes go through `localStorage`. It also loads Vercel Web Analytics (`/_vercel/insights/script.js`), but not on localhost.
- `api/contact.js`: Vercel serverless function. It validates input with `api/_validate.js` (files starting with `_` aren't routes), drops honeypot submissions (`company` field), and emails the message through the Resend REST API. It needs the `RESEND_API_KEY` env var on Vercel (optional: `CONTACT_TO`); without the key it returns 503 and the form tells visitors to email directly.
- `public/og.png` (1200×630 link preview), `public/favicon.svg` (the "LA" mark), and `public/robots.txt`. Once the domain is final, `og:image` in `index.html` should become an absolute URL.

### Behaviours that span files

- **Design concept:** the page is a design-tool canvas. Dot-grid background, projects shown as "frames" with names above them, selection boxes with handles, an inspector panel, a bottom floating toolbar for navigation. Accent `--select` (selection blue). Fonts: Bricolage Grotesque (display, condensed via `font-stretch`) and Geist (body), loaded from Google Fonts in `index.html`.
- **Intro → hero choreography:** `Intro` shows once per session (`sessionStorage.intro`). It's removed by a timer after its 0.6s wipe, never by `transitionend`, which didn't fire reliably and left the hero stuck invisible. When it leaves, `App` adds `html.play`. CSS pauses every hero/toolbar animation with `html:not(.play) ... { animation-play-state: paused }`. Hero timings (`draw`, `cursor` keyframes) are tuned to each other, so change them together.
- **Deep links:** `#work/<project id>` opens that case study. `Work` keeps the hash in sync with `history.replaceState` and listens to `hashchange`. A deep link skips the intro.
- **Section tracking:** one IntersectionObserver in `App` sets the active section. `Toolbar` slides `.toolbar-pill` to it, re-measuring with a ResizeObserver.
- **Scroll reveal:** add class `reveal` to an element. The observer in `App` adds `.in`. Children of `.frames.reveal` / `.flow.reveal` stagger by a `--i` inline style.
- **View Transitions:** the `transition()` helper wraps theme switches and filtering (`flushSync` inside `startViewTransition`). Frames need unique `viewTransitionName`s.
- **Draggable headline:** dragging works with a mouse only (touch keeps scrolling). Arrow keys move it, Escape or double-click resets. Its live X/Y/W/H shows in the inspector.
- **Smoothness rules:**
  - Pointer-driven effects write at most one style per animation frame, and CSS transitions do the easing. The spotlight moves via `translate` + `--x/--y`, and the dragged headline transitions `translate`.
  - The dot grid is a fixed `body::before` layer (no repaint on scroll), and the spotlight offsets its own dots to stay aligned with it.
  - Don't use `filter: blur()` on large animated elements; use a radial gradient instead.
  - Don't do full-screen mask repaints on mouse move.
- **Scroll-linked motion** (progress bar, hero easing back, thumbnail parallax) uses CSS `animation-timeline: scroll()/view()`. It's inside `@supports` + `prefers-reduced-motion: no-preference`, so unsupported browsers simply get no effect. Scrolling itself stays native: no scroll hijacking or smooth-scroll library.
- **Reduced motion** is respected globally in CSS and in JS (`reducedMotion()` skips the pointer spotlight and shortens the intro).

### Lint gotcha

`eslint-plugin-react-hooks` v7 flags synchronous `setState` inside effects and reading refs during render. DOM-measurement updates (e.g. the toolbar pill) write to element styles through refs instead of state.

## Open content gaps

- Project thumbnails are CSS sketches. Real screenshots (add `image`/`alt` fields in `content.js`) are the top priority.
- Case-study `details`/`role`/`outcome` text and the About stats were drafted from early summaries and need confirming by the owner.
- `profile.links` is empty (LinkedIn, résumé PDF in `/public`).
- The contact intro promises a reply "within two working days"; the owner should confirm that.
