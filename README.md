# AetherLink.ai — Corporate Website

```
     _    _____ _____ _   _ _____ ____  _     ___ _   _ _  __
    / \  | ____|_   _| | | | ____|  _ \| |   |_ _| \ | | |/ /
   / _ \ |  _|   | | | |_| |  _| | |_) | |    | ||  \| | ' /
  / ___ \| |___  | | |  _  | |___|  _ <| |___ | || |\  | . \
 /_/   \_\_____| |_| |_| |_|_____|_| \_\_____|___|_| \_|_|\_\
```

> **The power of AI, accessible for every business.**

Europe's AI One-Stop-Shop — AI Chatbots, Consultancy, Training & Custom Development.

**Live:** https://aetherlink-site.vercel.app
**GitHub:** https://github.com/Maca2024/aetherlink-site-
**Domain:** aetherlink.ai

---

## Table of Contents

- [Overview](#overview)
- [Services](#services)
- [Tech Stack](#tech-stack)
- [Design System](#design-system--luminous-void)
- [AETHER-ASSIST AI Chatbot](#aether-assist-ai-chatbot-v21)
- [SEO & GEO Infrastructure](#seo--geo-infrastructure)
- [Multilingual Architecture](#multilingual-architecture)
- [Project Structure](#project-structure)
- [Page Features](#page-features)
- [Performance](#performance)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Browser Support](#browser-support)
- [Development Guidelines](#development-guidelines)
- [Partners](#partners)
- [Team](#team)
- [Contact](#contact)
- [Legal & Compliance](#legal--compliance)

---

## Overview

AetherLink is a European AI consultancy and development company headquartered in the Netherlands with operations in Finland and the United Arab Emirates. Founded in 2019, AetherLink specializes in **AI Lead Architecture**, **Agentic AI implementation**, and **AI change management**.

This repository contains the complete multilingual corporate website — a static HTML/CSS/JS site with integrated AI chatbot (AETHER-ASSIST) powered by Claude and ElevenLabs, deployed on Vercel with serverless API functions.

---

## Services

| Service | Description | Accent | Pricing |
|---------|-------------|--------|---------|
| **AetherBot** | Ready-to-use AI chatbots for websites. Trained on your knowledge, live in minutes. Multilingual, GDPR-compliant. | Cyan `#00d4ff` | Starter €49/mnd, Pro €599/mnd, Enterprise custom |
| **AetherMIND** | AI consultancy, strategy, training & change management. From AI Readiness Scans to full AI transformation. | Violet `#8b5cf6` | Custom per scope |
| **AetherDEV** | Custom AI development — agentic workflows, RAG systems, MCP servers, platforms, automations. | Emerald `#00dfa2` | Custom per project |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Markup** | HTML5 (static, no build step) |
| **Styling** | Tailwind CSS v4 (CDN) + Custom CSS (glass morphism, orbital animations) |
| **JavaScript** | Vanilla JS (scroll reveals, FAQ accordion, mobile menu, theme toggle, chat widget) |
| **Fonts** | Google Fonts: Syne (display) + Plus Jakarta Sans (body) |
| **Hosting** | Vercel (static files + serverless functions) |
| **Chat AI** | Anthropic Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`) via Messages API |
| **Voice AI** | ElevenLabs Multilingual v2 (text-to-speech streaming) |
| **Module System** | ESM (`package.json` with `"type": "module"`) |
| **SEO** | Schema.org JSON-LD, robots.txt, sitemap.xml, llms.txt |

---

## Design System — "Luminous Void"

A premium dark-theme aesthetic with glass morphism, orbital motion, and floating elements inspired by deep space.

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--void` | `#05060f` | Page background |
| `--surface` | `#0a0d1a` | Card backgrounds |
| `--border` | `#1a1f35` | Borders, dividers |
| `--accent-cyan` | `#00d4ff` | AetherBot branding |
| `--accent-violet` | `#8b5cf6` | AetherMIND branding |
| `--accent-emerald` | `#00dfa2` | AetherDEV branding |
| `--muted` | `#6b7394` | Secondary text |
| `--light` | `#e4e8f1` | Primary text |

### Typography

| Role | Font | Weight |
|------|------|--------|
| Display / Headings | **Syne** | 700–800 |
| Body / UI | **Plus Jakarta Sans** | 400–600 |
| Code / Mono | **JetBrains Mono** / system | 400 |

### Key Visual Elements

- **Orbital Animation** — 3 concentric rotating rings with 8 orbiting AI icons. Pure CSS `@keyframes` for 60fps GPU-accelerated performance.
- **Glass Morphism Cards** — `backdrop-filter: blur(24px)` with subtle borders and hover transforms.
- **Gradient Orbs** — Floating background blobs with mouse parallax (desktop).
- **SVG Noise Grain** — `feTurbulence` overlay at 3% opacity for texture.
- **Scroll Reveal** — `IntersectionObserver`-based fade-in animations with staggered delays.
- **Dark/Light Theme** — Toggle via `data-theme` attribute, persisted in localStorage.

---

## AETHER-ASSIST AI Chatbot (v2.1)

A premium AI chat widget integrated into all 12 language pages, powered by Claude Sonnet 4.5 with ElevenLabs text-to-speech.

### Architecture

```
┌──────────────────────────────────────┐
│  Browser (js/aether-assist.js)       │
│  818 lines · Vanilla JS · IIFE      │
├──────────────┬───────────────────────┤
│ POST /api/chat (SSE)  │ POST /api/tts│
├──────────────┼───────────────────────┤
│ api/chat.js  │ api/tts.js            │
│ 346 lines    │ 91 lines              │
├──────────────┼───────────────────────┤
│ Claude       │ ElevenLabs            │
│ Sonnet 4.5   │ Multilingual v2       │
└──────────────┴───────────────────────┘
```

### Features

| Feature | Details |
|---------|---------|
| **Streaming Chat** | SSE-based real-time text streaming from Claude |
| **Text-to-Speech** | "Luister/Listen/Kuuntele" button per response, ElevenLabs multilingual v2 |
| **Page Context** | Adapts system prompt to current page (homepage/aetherbot/aethermind/aetherdev) |
| **Suggested Questions** | 4 context-aware question chips per page type, per language (48 total) |
| **Markdown Rendering** | Bold, italic, clickable links, autolinked URLs, email links, lists, inline code |
| **Session Persistence** | sessionStorage with 30-minute TTL, survives page navigation |
| **Rate Limiting** | 12 messages/minute per IP |
| **Prompt Caching** | `cache_control: ephemeral` for 87.5% cost reduction on system prompt |
| **Knowledge Base** | ~3000-word curated inline knowledge base about AetherLink |
| **i18n** | Full NL/EN/FI: welcome messages, placeholders, suggestions, errors, TTS labels |
| **XSS Prevention** | `escapeHtml()` on all user input before rendering |
| **Mobile Responsive** | Full-width panel on <480px, adapted button sizes |
| **Theme Support** | Dark/light mode via `[data-theme="light"]` CSS selectors |

---

## SEO & GEO Infrastructure

### AI Findability (GEO — Generative Engine Optimization)

| File | Purpose |
|------|---------|
| `robots.txt` | Explicitly allows 13 AI crawlers (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, anthropic-ai, Google-Extended, etc.) |
| `llms.txt` | AI-readable company summary — team, services, technology, differentiators, contact, URLs |
| `sitemap.xml` | 13 URLs with `xhtml:link` hreflang annotations for all 3 languages |

### Schema.org Markup (JSON-LD)

| Page Type | Schema Types |
|-----------|-------------|
| Homepages | `Organization` + `ProfessionalService` (founder, knowsAbout, areaServed, contactPoint, hasOfferCatalog) |
| AetherBot | `SoftwareApplication` + `FAQPage` (5 Q&A per language) + `BreadcrumbList` |
| AetherMIND | `ProfessionalService` + `FAQPage` (5 Q&A per language) + `BreadcrumbList` |
| AetherDEV | `ProfessionalService` + `FAQPage` (5 Q&A per language) + `BreadcrumbList` |

### Meta Tags (all pages)

- `<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">`
- Open Graph: title, description, image, url, type, locale
- Canonical URLs + hreflang alternates (nl, en, fi, x-default)
- Optimized title tags with target keywords
- Answer capsules: 50-70 word bold paragraphs after H1 for LLM extraction

---

## Multilingual Architecture

| Language | Code | Path | Default |
|----------|------|------|---------|
| Dutch (Nederlands) | `nl` | `/nl/` | Yes (root redirects here) |
| English | `en` | `/en/` | No |
| Finnish (Suomi) | `fi` | `/fi/` | No |

Root `index.html` performs a `meta http-equiv="refresh"` redirect to `/nl/`.

Each page includes: `<html lang="">`, hreflang tags, `og:locale`, canonical URL, language switcher in nav, fully translated content.

---

## Project Structure

```
aetherlink-site/
├── index.html                    # Root redirect → /nl/
├── package.json                  # ESM module config {"type": "module"}
├── robots.txt                    # AI crawler permissions (13 bots)
├── llms.txt                      # LLM-readable company summary
├── sitemap.xml                   # XML sitemap with hreflang
│
├── api/                          # Vercel Serverless Functions
│   ├── chat.js                   # Claude Sonnet 4.5 streaming (346 lines)
│   └── tts.js                    # ElevenLabs TTS streaming (91 lines)
│
├── js/
│   ├── aether-assist.js          # AETHER-ASSIST chat widget (818 lines)
│   └── theme.js                  # Dark/light theme toggle (33 lines)
│
├── css/
│   └── theme.css                 # Theme variables & overrides (562 lines)
│
├── nl/                           # Dutch pages (default language)
│   ├── index.html                # Homepage with orbital animation
│   ├── aetherbot.html            # AetherBot product page
│   ├── aethermind.html           # AetherMIND services page
│   └── aetherdev.html            # AetherDEV development page
│
├── en/                           # English pages
│   ├── index.html
│   ├── aetherbot.html
│   ├── aethermind.html
│   └── aetherdev.html
│
├── fi/                           # Finnish pages
│   ├── index.html
│   ├── aetherbot.html
│   ├── aethermind.html
│   └── aetherdev.html
│
├── images/
│   ├── logo-white.png/svg        # White logo variants
│   ├── logo-color.png/svg        # Color logo variants
│   ├── logo-black.png            # Black logo
│   ├── logo-bg.png               # Logo with background
│   ├── logo-padded.png           # Padded logo
│   ├── favicon.png               # Browser favicon
│   ├── animation/                # 11 AI brand icons for orbital hero
│   │   ├── anthropic.svg
│   │   ├── claude.svg
│   │   ├── gemini.svg
│   │   ├── github.svg
│   │   ├── github-copilot.svg
│   │   ├── grok.svg
│   │   ├── lovable.svg
│   │   ├── mistral-ai.svg
│   │   ├── notebooklm.svg
│   │   ├── ollama.svg
│   │   └── perplexity.svg
│   ├── icons/                    # Service icons
│   │   ├── aetherbot.svg
│   │   ├── aetherdev.svg
│   │   └── aethermind.svg
│   └── partners/                 # 15 partner logos
│       ├── solvari.svg
│       ├── defensie.svg
│       ├── droidor.png
│       ├── pitcrew.png
│       ├── welllaw.png
│       ├── cfx.png
│       ├── van-diemen.png
│       ├── mark-dierenarts.png
│       ├── growing-emmen.png
│       ├── doama.webp
│       ├── ears-up.png
│       ├── houkema-tools.png
│       ├── konsta.png
│       ├── nieuwe-tijd-studio.png
│       └── nijstandhandel.png
│
├── docs/
│   └── algemene-voorwaarden.pdf  # Terms & Conditions
│
├── videos/
│   └── aetherlink-bg-web.mp4    # Background video
│
├── CONTEXT.md                    # Technical context (this project's bible)
└── README.md                     # This file
```

---

## Page Features

### Homepages (`*/index.html`)
- Orbital animation hero (3 rings, 8+ orbiting AI brand icons, counter-rotation)
- Three product cards with accent-colored top borders
- Partner logo marquee carousel (15 logos, CSS-only infinite scroll)
- "Why AetherLink" USP section (4 cards)
- Organization + ProfessionalService schema (founder, knowsAbout, contactPoint)
- Footer CTA with gradient background

### AetherBot (`*/aetherbot.html`)
- Product hero with cyan accent theme
- 6 feature cards with icons
- 3-step "How it works" section
- 3 pricing plans with feature comparison table
- 3 use cases with testimonials
- Product roadmap (4 items)
- FAQ accordion (5 items with `FAQPage` schema)
- `SoftwareApplication` + `BreadcrumbList` schema

### AetherMIND (`*/aethermind.html`)
- Services hero with violet accent theme
- 3 service detail cards (Consultancy, Training, Advisory)
- Training topics table (7 subjects)
- 3-step approach methodology
- `ProfessionalService` + `FAQPage` + `BreadcrumbList` schema

### AetherDEV (`*/aetherdev.html`)
- Development hero with emerald accent theme
- 4 capability cards with example tags
- 4-step process timeline
- 4 USP cards
- `ProfessionalService` + `FAQPage` + `BreadcrumbList` schema

---

## Performance

| Technique | Implementation |
|-----------|---------------|
| No build step | Static HTML served directly by Vercel |
| CSS-only animations | `transform` + `opacity` only (composite layer, no layout/paint) |
| DNS Prefetch | `<link rel="dns-prefetch">` for Google Fonts, Tailwind CDN |
| Font Preload | `<link rel="preload" as="font">` for critical font files |
| Font Display | `font-display: swap` — text visible while fonts load |
| Lazy Loading | `loading="lazy"` on below-fold images |
| Content Visibility | `content-visibility: auto` on below-fold sections |
| Scroll Throttle | `requestAnimationFrame` for scroll event handlers |
| GPU Compositing | Animations use only `transform` + `opacity` |
| Reduced Motion | `prefers-reduced-motion: reduce` disables all animations |
| Prompt Caching | Chat API caches system prompt for 87.5% token cost reduction |
| TTS Text Cap | Voice synthesis limited to 500 chars for cost control |

---

## Deployment

```bash
# Deploy to Vercel (production)
npx vercel --prod

# Or push to GitHub (auto-deploys via Vercel Git integration)
git push origin main
```

No build configuration needed — Vercel detects static files + `/api/` serverless functions automatically.

---

## Environment Variables

Set via Vercel CLI (`vercel env add NAME production`):

| Variable | Purpose | Required |
|----------|---------|----------|
| `ANTHROPIC_API_KEY` | Claude API key for chat function | Yes |
| `ELEVENLABS_API_KEY` | ElevenLabs API key for TTS function | Yes |
| `ELEVENLABS_VOICE_ID` | Voice ID for TTS (default: `ErXwobaYiN019PkySvjV`) | Optional |

---

## Browser Support

| Browser | Minimum | Notes |
|---------|---------|-------|
| Chrome | 90+ | Full support |
| Firefox | 90+ | Full support |
| Safari | 15+ | `-webkit-backdrop-filter` prefix included |
| Edge | 90+ | Chromium-based, full support |
| Mobile Safari | 15+ | Responsive, tested |
| Chrome Android | 90+ | Responsive, tested |

---

## Development Guidelines

### Adding a New Page

1. Copy the closest existing page as template
2. Update `<title>`, `<meta>`, `og:` tags, `canonical` URL
3. Add `hreflang` alternates for all 3 language versions
4. Update nav to mark correct link as `.active`
5. Create translations in `/nl/`, `/en/`, `/fi/`
6. Add the page to nav in all 12 existing pages
7. Add Schema.org JSON-LD (use existing pages as reference)
8. Add to `sitemap.xml`
9. Update `CONTEXT.md` and `README.md`

### Adding a New Language

1. Create new directory (e.g., `/de/`) with all 4 pages
2. Add `hreflang` alternate links to ALL existing pages
3. Update language switcher in nav across all pages
4. Update `sitemap.xml` with new URLs
5. Add i18n entries to `js/aether-assist.js` (welcome, placeholder, suggestions, errors)
6. Add page context to `api/chat.js`
7. Update `llms.txt`

### Modifying AETHER-ASSIST

- **Widget UI:** Edit `js/aether-assist.js` (IIFE pattern, modify inside closure)
- **Chat AI:** Edit `api/chat.js` (knowledge base, system prompt, page contexts)
- **Voice AI:** Edit `api/tts.js` (voice settings, text processing)
- **Env vars:** `vercel env add NAME production`

---

## Partners

Trusted by 15+ organizations including:

| Partner | Sector |
|---------|--------|
| **Solvari** | Lead generation platform |
| **Ministerie van Defensie** | Dutch Ministry of Defence |
| **Droidor** | Technology |
| **Pitcrew** | Automotive |
| **Welllaw** | Legal |
| **CFX Video Agency** | Media |
| **Van Diemen Sloopwerken** | Construction |
| **Mark Dierenarts** | Veterinary |
| **Growing Emmen** | Regional development |
| **Doama** | Marketing |
| **Ears Up** | Pet care |
| **Houkema Tools** | Industrial tools |
| **Konsta** | Construction |
| **Nieuwe Tijd Studio** | Creative studio |
| **Nijstandhandel** | Wholesale trade |

---

## Team

| Name | Role | Focus |
|------|------|-------|
| **Marco** | CTO & AI Lead Architect | AI architecture, agentic workflows, RAG systems. Builds with Claude, GPT, Gemini, Supabase, n8n, Pinecone, LangGraph, MCP servers, Docker. |
| **Constance** | CEO | Organization strategy and business development |
| **Ronald** | CCO/CFO | Commercial operations, partnerships and finance |

---

## Contact

| Channel | Details |
|---------|---------|
| Website | [aetherlink.ai](https://aetherlink.ai) |
| Email | [info@aetherlink.ai](mailto:info@aetherlink.ai) |
| Phone | +31 6 1377 2333 |
| LinkedIn | [AetherLink](https://www.linkedin.com/company/aetherlink/) |
| Availability | 24/7 |

---

## Legal & Compliance

- **EU AI Act** Compliant — all solutions meet European AI legislation
- **GDPR/AVG** Compliant — data protection by design
- **Terms & Conditions:** `docs/algemene-voorwaarden.pdf`
- Chat data is not used to train AI models
- No cookies (sessionStorage only for chat persistence)
- Rate limiting: 12 messages/minute per IP
- TTS text capped at 500 characters for cost control

---

**Copyright &copy; 2026 AetherLink. All rights reserved.**

*Built with Claude Code (Anthropic) &middot; Last updated: February 2026*
