# AetherLink Website — Project Context

> Complete technical and design context for the AetherLink corporate website.
> This document is the single source of truth for developers, designers, and AI agents working on this project.
> **Last updated:** February 2026

---

## 1. Company Overview

**AetherLink.ai** is Europe's AI One-Stop-Shop, headquartered in the Netherlands with operations in Finland and the United Arab Emirates. Founded in 2019.

### Mission
> The power of AI, accessible for every business.

### Team
| Name | Role | Expertise |
|------|------|-----------|
| **Marco** | CTO & AI Lead Architect | 5+ years AI experience. Specialist in autonomous AI agents, agentic workflows, RAG systems, AI platform architecture. Builds with Claude, GPT, Gemini, Supabase, n8n, Pinecone, LangGraph, MCP servers, Docker. |
| **Constance** | CEO | Organization strategy, business development |
| **Ronald** | CCO/CFO | Commercial operations, partnerships, finance |

### Contact
- **Website:** https://aetherlink.ai
- **Email:** info@aetherlink.ai
- **Phone:** +31 6 1377 2333
- **LinkedIn:** https://www.linkedin.com/company/aetherlink/
- **Availability:** 24/7

### Locations
| Region | Country |
|--------|---------|
| Europe (HQ) | Netherlands |
| Nordics | Finland |
| Middle East | United Arab Emirates |

### Key Clients
Solvari (21 AI agents in 12 weeks), Dutch Ministry of Defence (AI consultancy), 10+ SMEs (chatbots, automations, platforms).

---

## 2. Products & Services

### AetherBot — AI Chatbot Platform
- **Accent Color:** Cyan `#00d4ff`
- **Description:** Ready-to-use AI chatbots for websites. Trained on company knowledge, live in minutes, available 24/7.
- **Pricing:**
  - Starter: €49/month (1 chatbot, basic features)
  - Professional: €599/month (5 chatbots, analytics, CRM integration)
  - Enterprise: Custom (unlimited, dedicated support, SLA)
- **Features:** Knowledge base training, multilingual (NL/EN/DE/FR/FI+), analytics dashboard, CRM integration, human handoff, custom branding
- **Integrations:** WordPress, Shopify, Magento, WooCommerce, custom
- **Compliance:** EU AI Act compliant, GDPR-proof
- **Schema:** `SoftwareApplication` + `FAQPage` (5 Q&A per language) + `BreadcrumbList`
- **URL pattern:** `/{lang}/aetherbot.html`

### AetherMIND — AI Consultancy & Training
- **Accent Color:** Violet `#8b5cf6`
- **Services:**
  - AI Readiness Scans — assessment of AI readiness
  - AI Strategy Development — roadmap and implementation plan
  - AI Training for Teams — prompt engineering, AI tools, responsible AI use
  - AI Change Management — human-centered AI transformation, adoption
  - Co-intelligence — human + AI collaboration optimization
- **Methodology:** Assess → Implement → Scale
- **Schema:** `ProfessionalService` + `FAQPage` (5 Q&A per language) + `BreadcrumbList`
- **URL pattern:** `/{lang}/aethermind.html`

### AetherDEV — Custom AI Development
- **Accent Color:** Emerald `#00dfa2`
- **Capabilities:**
  - Agentic AI workflows (n8n, LangGraph)
  - RAG systems and knowledge bases (Pinecone, pgvector)
  - AI platform development (Supabase, Vercel)
  - MCP server configuration and integration
  - AI dashboards and analytics
  - Process automation
  - Custom integrations
- **Technologies:** Claude, GPT, Gemini, Grok, Mistral, Supabase, n8n, Pinecone, LangGraph, Docker
- **Process:** Discovery → Design → Develop → Deploy
- **Schema:** `ProfessionalService` + `FAQPage` (5 Q&A per language) + `BreadcrumbList`
- **URL pattern:** `/{lang}/aetherdev.html`

---

## 3. Design System — "Luminous Void"

### Philosophy
Premium dark-theme aesthetic balancing sophistication with approachability. Inspired by deep space — glass morphism, orbital motion, floating elements suggest the interconnected nature of AI systems. Supports dark/light theme toggle.

### Color Tokens

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--void` | `#05060f` | `5, 6, 15` | Page background, deepest layer |
| `--surface` | `#0a0d1a` | `10, 13, 26` | Card backgrounds, elevated surfaces |
| `--border` | `#1a1f35` | `26, 31, 53` | Card borders, dividers |
| `--accent-cyan` | `#00d4ff` | `0, 212, 255` | AetherBot branding, CTAs, links in chat |
| `--accent-violet` | `#8b5cf6` | `139, 92, 246` | AetherMIND branding, navigation, chat accent |
| `--accent-emerald` | `#00dfa2` | `0, 223, 162` | AetherDEV branding, success states, online indicator |
| `--muted` | `#6b7394` | `107, 115, 148` | Secondary text, labels, captions |
| `--light` | `#e4e8f1` | `228, 232, 241` | Primary text, headings |

### Gradients
```css
/* CTA Button */
background: linear-gradient(135deg, #00dfa2, #8b5cf6);

/* Chat Widget FAB */
background: linear-gradient(135deg, #00d4ff 0%, #8b5cf6 50%, #00dfa2 100%);

/* Hero Glow */
background: radial-gradient(circle at 30% 50%, rgba(139,92,246,0.15), transparent 50%);

/* User Message Bubble */
background: linear-gradient(135deg, rgba(0,212,255,0.18), rgba(139,92,246,0.12));
```

### Typography

| Role | Font | Weight | Size Range |
|------|------|--------|------------|
| Display / Headings | **Syne** | 700–800 | 36px–72px |
| Body / UI | **Plus Jakarta Sans** | 400–600 | 13.5px–18px |
| Code / Monospace | **JetBrains Mono** / system | 400 | 12px–14px |

Source: Google Fonts CDN with `font-display: swap` and preload hints.

### Spacing Scale
- Section padding: `120px 0` (desktop), `80px 0` (mobile)
- Card padding: `32px` (desktop), `24px` (mobile)
- Content max-width: `1200px` centered
- Grid gap: `32px` (desktop), `24px` (mobile)

### Glass Morphism

```css
/* Standard glass card */
.glass-card {
  background: rgba(10, 13, 26, 0.6);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
}

/* Chat widget panel (heavier blur) */
.aether-assist-panel {
  background: rgba(10, 13, 26, 0.94);
  backdrop-filter: blur(40px) saturate(1.2);
  -webkit-backdrop-filter: blur(40px) saturate(1.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Hover lift effect */
.card:hover {
  transform: translateY(-8px);
  border-color: rgba(139, 92, 246, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}
```

### Visual Effects
1. **SVG Noise Grain** — `<svg>` filter with `feTurbulence` overlaid at 3% opacity for texture
2. **Gradient Orbs** — Fixed-position background blobs with `filter: blur(100px)` for ambient glow
3. **Mouse Parallax** — Desktop-only `mousemove` listener shifting orb positions at reduced rates
4. **Scroll Reveal** — `IntersectionObserver` with `threshold: 0.1`, staggered `animation-delay` per element
5. **Reduced Motion** — All animations respect `prefers-reduced-motion: reduce`
6. **Dark/Light Toggle** — `data-theme="light"` attribute on `<html>`, persisted in localStorage via `js/theme.js`

---

## 4. Orbital Animation (Homepage Hero)

### Structure
```
orbit-wrap (540x540px, centered)
├── orbit-center (92px logo with pulsing glow)
├── orbit-track outer (480px, rotates CW 25s)
│   ├── orbit-arc (semi-circle, violet border)
│   ├── orbiting icon: Bot (0°)
│   └── orbiting icon: Cloud (120°)
├── orbit-track middle (350px, rotates CCW 20s)
│   ├── orbit-arc (semi-circle, cyan border)
│   ├── orbiting icon: Brain (0°)
│   ├── orbiting icon: Chart (90°)
│   └── orbiting icon: Shield (180°)
└── orbit-track inner (230px, rotates CW 15s)
    ├── orbit-arc (semi-circle, emerald border)
    ├── orbiting icon: Code (0°)
    ├── orbiting icon: Zap (120°)
    └── orbiting icon: Lock (240°)
```

### Counter-Rotation Technique
Icons stay upright while orbiting:
```css
@keyframes orbit-outer {
  from { transform: rotate(0deg) translateX(240px) rotate(0deg); }
  to   { transform: rotate(360deg) translateX(240px) rotate(-360deg); }
}
```
Negative `animation-delay` positions icons evenly around each ring.

### Responsive Scaling
| Breakpoint | Scale | Margin Compensation |
|------------|-------|---------------------|
| > 1280px | 1.0 | none |
| 1024–1280px | 0.82 | -40px top |
| 768–1024px | 0.7 | -60px top |
| 480–768px | 0.58 | -80px top/bottom |
| < 480px | 0.48 | -100px top/bottom |

---

## 4b. Robot Cinema (`js/robot-cinema.js`)

A cinematic canvas-based animation sequence on the homepage hero (1148 lines). Plays a scripted animation before revealing the chatbot widget.

### Cinematic Sequence
1. **Laser Bot Entrance** — Animated robot character enters from side with laser beam effects
2. **Explosions** — Particle-based explosion effects triggered during the sequence
3. **Heart Absorption** — Animated heart element drawn toward and absorbed into the bot
4. **Gated Chatbot Reveal** — After the cinematic completes, the AETHER-ASSIST chat widget is revealed

### Technical Details
| Aspect | Implementation |
|--------|---------------|
| **Rendering** | HTML5 Canvas with `requestAnimationFrame` loop |
| **Particles** | Custom particle system for explosions and effects |
| **Responsive** | Canvas scales to viewport dimensions |
| **Performance** | GPU-accelerated compositing, frame-rate aware |
| **Integration** | Dispatches event to trigger AETHER-ASSIST reveal on completion |
| **File** | `js/robot-cinema.js` (1148 lines) |

---

## 5. AETHER-ASSIST AI Chatbot System (v4.1)

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER (Client)                          │
│                                                              │
│  js/aether-assist.js (2302 lines, IIFE, vanilla JS)         │
│  ├── Walking Robot Avatar (torso, arms, legs, chest panel)   │
│  ├── Speech bubbles (help/rap/greeting), tricks, depth walk  │
│  ├── Language detection (html lang attribute)                │
│  ├── Page type detection (URL path analysis)                 │
│  ├── Session persistence (sessionStorage, 30min TTL)         │
│  ├── Markdown renderer (bold, links, lists, code, autolink)  │
│  ├── TTS playback (Audio API + blob URLs)                    │
│  ├── STT input (Web Speech API)                              │
│  └── Suggested questions (4 per page × 4 pages × 3 langs)   │
│                                                              │
│     ↓ POST /api/chat              ↓ POST /api/tts            │
│     (JSON → SSE stream)           (JSON → audio/mpeg)        │
│     Web Speech API (STT)                                     │
├─────────────────────────────────────────────────────────────┤
│                 VERCEL SERVERLESS FUNCTIONS                   │
│                                                              │
│  api/chat.js (346 lines)          api/tts.js (144 lines)    │
│  ├── Rate limiting (12/min/IP)    ├── Markdown stripping     │
│  ├── Dynamic system prompt        ├── Text cap (800 chars)   │
│  ├── Page context injection       ├── Voice settings          │
│  ├── Prompt caching (ephemeral)   └── Audio streaming         │
│  ├── Message trimming (last 20)                               │
│  └── SSE streaming to client                                  │
│                                                              │
│     ↓ Anthropic Messages API      ↓ ElevenLabs TTS API       │
│     (streaming)                   (streaming)                 │
├─────────────────────────────────────────────────────────────┤
│                      EXTERNAL APIs                           │
│                                                              │
│  Claude Sonnet 4.5                ElevenLabs Eleven v3         │
│  (claude-sonnet-4-5-20250929)     (fallback: Multilingual v2)  │
│  max_tokens: 1024                 voice: ErXwobaYiN019PkySvjV  │
│  cache_control: ephemeral         output: mp3_44100_192        │
│                                   stability: 0.45              │
│                                   similarity_boost: 0.82       │
│                                   style: 0.4                   │
└─────────────────────────────────────────────────────────────┘
```

### Chat API (`api/chat.js`) — Deep Dive

**System Prompt Structure (XML-formatted, Anthropic best practices):**
```xml
<identity>     — Who AETHER is, built on Claude, by AetherLink Team Alpha
<core_behavior> — Senior consultant, detect language, no hallucination, proactive
<page_context>  — Dynamic: adapts per page type and visitor language
<formatting>    — Bold, links, lists, short paragraphs
<tone_and_style> — Professional but accessible, "wij" for AetherLink
<conversation_goals> — Priority 1: Help, 2: Qualify, 3: Next step
<response_guidelines> — Direct answers, no "Als AI...", no "Geweldig!"
<out_of_scope>  — Custom pricing → schedule call, competitors → neutral
<privacy>       — Never ask for personal data proactively, GDPR
<safety>        — Reject prompt injection, identity override attempts
<knowledge_base> — ~3000 words: company, team, services, pricing, cases, FAQ
```

**Page Context Injection:**
The API accepts a `pageContext` parameter (`index`/`aetherbot`/`aethermind`/`aetherdev`) and injects a context-specific instruction into the system prompt. Example for AetherBot page:
> "The visitor is viewing the AetherBot page — AI chatbot platform for websites. They are likely interested in getting a chatbot for their website."

**Rate Limiting:**
In-memory Map per Vercel instance. 12 messages per 60-second window per IP (`x-forwarded-for` header). Returns trilingual error messages (NL/EN/FI) on 429.

**Prompt Caching:**
`cache_control: { type: 'ephemeral' }` on the system prompt block reduces repeated token costs by ~87.5% for conversations with the same page context.

### TTS API (`api/tts.js`) — Deep Dive

**Pre-processing pipeline:**
1. Strip `**bold**` → `bold`
2. Strip `[text](url)` → `text`
3. Strip `` `code` `` → `code`
4. Strip list markers (`- `, `* `)
5. Replace double newlines → `. ` (natural pause)
6. Trim to 800 characters + `...`

**Voice Configuration:**
- Model: `eleven_v3` (primary, supports NL, EN, FI natively; fallback: `eleven_multilingual_v2`)
- Voice ID: `ErXwobaYiN019PkySvjV`
- Output format: `mp3_44100_192` (192kbps MP3)
- Settings: `stability: 0.45`, `similarity_boost: 0.82`, `style: 0.4`, `use_speaker_boost: true`

### Widget (`js/aether-assist.js`) — Deep Dive

**Walking Robot Avatar:**
The AETHER-ASSIST widget features an articulated walking robot rendered alongside the chat panel.

| Component | Details |
|-----------|---------|
| **Body Parts** | Torso, left/right arms, left/right legs, chest panel (LED display) |
| **Walking Animation** | Articulated limb movement with depth-based walking across viewport |
| **Speech Bubbles** | Context-aware bubbles: help prompt, rap lyrics, greeting messages |
| **Tricks** | Dance, wave, jump — triggered by user interaction or idle timer |
| **Idle Behavior** | Robot stops and performs idle animation after walk cycle completes |
| **Gated Reveal** | On homepage, robot appears after Robot Cinema cinematic completes |

**Suggested Questions (48 total):**
4 questions × 4 page types × 3 languages. Examples:

| Page | NL | EN |
|------|----|----|
| Homepage | "Wat doet AetherLink precies?" | "What does AetherLink do?" |
| AetherBot | "Wat kost een chatbot?" | "How much does a chatbot cost?" |
| AetherMIND | "Wat is een AI Readiness Scan?" | "What is an AI Readiness Scan?" |
| AetherDEV | "Wat is agentic AI?" | "What is agentic AI?" |

**Markdown Renderer Processing Order:**
1. `escapeHtml()` — prevent XSS
2. `**bold**` → `<strong>`
3. `*italic*` → `<em>` (lookbehind to avoid bold conflicts)
4. `[text](url)` → `<a class="aether-link">` (clickable, target=_blank)
5. Plain URLs → autolinked `<a>` (negative lookbehind for href)
6. Email addresses → `<a href="mailto:...">`
7. `` `code` `` → `<code class="aether-code">`
8. `- item` → `<li>` wrapped in `<ul class="aether-list">`
9. Double newlines → `</p><p>`
10. Single newlines → `<br>`

**TTS Button States:**
| State | CSS Class | Icon | Label |
|-------|-----------|------|-------|
| Idle | (none) | Speaker icon | "Luister" / "Listen" / "Kuuntele" |
| Loading | `.loading` | Spinning refresh | "..." |
| Playing | `.playing` | Stop square | "Stop" |

---

## 6. SEO & GEO Infrastructure

### robots.txt
Explicitly allows 13 AI crawlers:
`GPTBot`, `ChatGPT-User`, `OAI-SearchBot`, `ClaudeBot`, `Claude-SearchBot`, `anthropic-ai`, `PerplexityBot`, `Google-Extended`, `Googlebot`, `Bingbot`, `cohere-ai`, `Meta-ExternalAgent`

Blocks: `/.git/`, `/.vercel/`

References: `sitemap.xml`, `llms.txt`

### llms.txt
59-line AI-readable summary of AetherLink. Structured sections: What is AetherLink, Team, Core Services (3), Technology Expertise, Differentiators, Locations, Contact, Important URLs.

### sitemap.xml
22 URLs with `<xhtml:link>` hreflang annotations for NL/EN/FI. Priority: homepages 1.0, service pages 0.8, pillar pages 0.7. Weekly changefreq.

### Schema.org Markup (JSON-LD in `<head>`)

**Homepages — Organization + ProfessionalService:**
```json
{
  "@type": ["Organization", "ProfessionalService"],
  "name": "AetherLink",
  "founder": [Marco, Constance, Ronald],
  "knowsAbout": [16 AI-related topics],
  "areaServed": ["Netherlands", "Finland", "UAE", "Europe"],
  "contactPoint": { "telephone", "email", "3 languages" },
  "hasOfferCatalog": ["AetherBot", "AetherMIND", "AetherDEV"]
}
```

**Service Pages — ProfessionalService + FAQPage + BreadcrumbList:**
- 5 Q&A pairs per language per service page (total: 45 FAQ items)
- Breadcrumb: `Home > ServiceName`

**AetherBot — SoftwareApplication + FAQPage + BreadcrumbList:**
- Application category, pricing, offers

### Answer Capsules
Every page has a 50-70 word bold paragraph immediately after H1, containing:
- Target keyword
- Company name "AetherLink"
- Direct answer to "what is this?"
- Extractable by LLMs as a citation

### Optimized Title Tags
| Page | NL Title |
|------|----------|
| Homepage | "AetherLink — AI Consultancy & Development Nederland \| AI Lead Architecture" |
| AetherBot | "AetherBot — AI Chatbot Platform voor Websites \| Vanaf €49/mnd \| AetherLink" |
| AetherMIND | "AetherMIND — AI Consultancy, Strategie & Training Nederland \| AetherLink" |
| AetherDEV | "AetherDEV — Maatwerk AI Ontwikkeling & Automatisering \| AetherLink" |

EN and FI equivalents follow the same pattern with translated keywords.

---

## 7. Multilingual Architecture

### Language Configuration
| Language | Code | Path | Default | `og:locale` |
|----------|------|------|---------|-------------|
| Dutch (Nederlands) | `nl` | `/nl/` | Yes | `nl_NL` |
| English | `en` | `/en/` | No | `en_US` |
| Finnish (Suomi) | `fi` | `/fi/` | No | `fi_FI` |

Root `index.html` performs `<meta http-equiv="refresh" content="0;url=/nl/">` redirect.

### Per-Page Requirements
1. `<html lang="xx">` — matching language code
2. `<link rel="alternate" hreflang="xx">` — for all 3 languages + `x-default`
3. `<link rel="canonical">` — self-referencing
4. `<meta property="og:locale">` — `nl_NL` / `en_US` / `fi_FI`
5. Language switcher in nav (EN / NL / FI links)
6. Fully translated content: nav, hero, sections, CTAs, footer, buttons

### Translation Key Terms
| Concept | NL | EN | FI |
|---------|----|----|-----|
| Login | Inloggen | Login | Kirjaudu |
| Get started | Aan de slag | Get started | Aloita tasta |
| Products | Producten | Products | Tuotteet |
| Services | Diensten | Services | Palvelut |
| Listen (TTS) | Luister | Listen | Kuuntele |
| New chat | Nieuw gesprek | New chat | Uusi keskustelu |

### Asset Paths
- Root pages (`index.html`): relative paths `images/...`, `css/...`
- Subdirectory pages (`nl/*.html`): parent-relative `../images/...`, `../css/...`, `../js/...`

---

## 8. File Inventory

### Summary
| Category | Count | Total Lines |
|----------|-------|-------------|
| HTML pages | 22 (1 redirect + 21 content) | ~22,000 |
| JavaScript | 3 files | 3,483 |
| CSS | 1 file | 562 |
| API functions | 2 files | 490 |
| SEO/infra files | 4 files | ~150 |
| **Total code** | **32 files** | **~26,700** |

### HTML Pages (22)

| # | File | Lang | Type | Accent | Schema |
|---|------|------|------|--------|--------|
| 1 | `index.html` | NL | Redirect | — | — |
| 2 | `nl/index.html` | NL | Homepage | Multi | Organization, ProfessionalService |
| 3 | `nl/aetherbot.html` | NL | Product | Cyan | SoftwareApplication, FAQPage, Breadcrumb |
| 4 | `nl/aethermind.html` | NL | Service | Violet | ProfessionalService, FAQPage, Breadcrumb |
| 5 | `nl/aetherdev.html` | NL | Service | Emerald | ProfessionalService, FAQPage, Breadcrumb |
| 6 | `nl/ai-consultancy.html` | NL | Pillar | Violet | ProfessionalService, Breadcrumb |
| 7 | `nl/ai-lead-architect.html` | NL | Pillar | Violet | ProfessionalService, Breadcrumb |
| 8 | `nl/ai-verandermanagement.html` | NL | Pillar | Violet | ProfessionalService, Breadcrumb |
| 9 | `en/index.html` | EN | Homepage | Multi | Organization, ProfessionalService |
| 10 | `en/aetherbot.html` | EN | Product | Cyan | SoftwareApplication, FAQPage, Breadcrumb |
| 11 | `en/aethermind.html` | EN | Service | Violet | ProfessionalService, FAQPage, Breadcrumb |
| 12 | `en/aetherdev.html` | EN | Service | Emerald | ProfessionalService, FAQPage, Breadcrumb |
| 13 | `en/ai-consultancy.html` | EN | Pillar | Violet | ProfessionalService, Breadcrumb |
| 14 | `en/ai-lead-architect.html` | EN | Pillar | Violet | ProfessionalService, Breadcrumb |
| 15 | `en/ai-change-management.html` | EN | Pillar | Violet | ProfessionalService, Breadcrumb |
| 16 | `fi/index.html` | FI | Homepage | Multi | Organization, ProfessionalService |
| 17 | `fi/aetherbot.html` | FI | Product | Cyan | SoftwareApplication, FAQPage, Breadcrumb |
| 18 | `fi/aethermind.html` | FI | Service | Violet | ProfessionalService, FAQPage, Breadcrumb |
| 19 | `fi/aetherdev.html` | FI | Service | Emerald | ProfessionalService, FAQPage, Breadcrumb |
| 20 | `fi/ai-consultancy.html` | FI | Pillar | Violet | ProfessionalService, Breadcrumb |
| 21 | `fi/ai-lead-architect.html` | FI | Pillar | Violet | ProfessionalService, Breadcrumb |
| 22 | `fi/ai-muutoshallinta.html` | FI | Pillar | Violet | ProfessionalService, Breadcrumb |

### JavaScript & CSS

| File | Lines | Purpose |
|------|-------|---------|
| `js/aether-assist.js` | 2302 | Chat widget with walking robot avatar, TTS, STT, markdown, suggestions, session |
| `js/robot-cinema.js` | 1148 | Homepage cinematic robot animation (laser bot, explosions, heart absorption, gated reveal) |
| `js/theme.js` | 33 | Dark/light theme toggle with localStorage |
| `css/theme.css` | 562 | Theme variables, light mode overrides, component styles |

### API Functions

| File | Lines | Purpose |
|------|-------|---------|
| `api/chat.js` | 346 | Claude Sonnet 4.5 streaming chat with page context |
| `api/tts.js` | 144 | ElevenLabs Eleven v3 TTS streaming (v2 fallback) |

### SEO & Infrastructure

| File | Purpose |
|------|---------|
| `robots.txt` | AI crawler permissions (13 bots allowed) |
| `llms.txt` | AI-readable company summary (59 lines) |
| `sitemap.xml` | XML sitemap with hreflang (22 URLs) |
| `package.json` | ESM module config (`"type": "module"`) |

### Images

| Directory | Count | Contents |
|-----------|-------|----------|
| `images/` | 7 | Logo variants (white/color/black/padded PNG+SVG), favicon |
| `images/animation/` | 11 | AI brand icons (SVG): Anthropic, Claude, Gemini, GitHub, Copilot, Grok, Lovable, Mistral, NotebookLM, Ollama, Perplexity |
| `images/icons/` | 3 | Service icons (SVG): aetherbot, aetherdev, aethermind |
| `images/partners/` | 15 | Partner logos (SVG/PNG/WebP): Solvari, Defensie, Droidor, Pitcrew, Welllaw, CFX, Van Diemen, Mark Dierenarts, Growing Emmen, Doama, Ears Up, Houkema Tools, Konsta, Nieuwe Tijd Studio, Nijstandhandel |

### Documents & Media

| File | Type |
|------|------|
| `docs/algemene-voorwaarden.pdf` | Terms & Conditions (Dutch) |
| `videos/aetherlink-bg-web.mp4` | Background video |

---

## 9. Environment Variables (Vercel)

| Variable | Purpose | Required | Default |
|----------|---------|----------|---------|
| `ANTHROPIC_API_KEY` | Claude API key for `/api/chat` | Yes | — |
| `ELEVENLABS_API_KEY` | ElevenLabs API key for `/api/tts` | Yes | — |
| `ELEVENLABS_VOICE_ID` | TTS voice selection | No | `ErXwobaYiN019PkySvjV` |

Set via: `vercel env add VARIABLE_NAME production`
List all: `vercel env ls`
Pull to local: `vercel env pull`

---

## 10. Performance Optimizations

| Technique | Implementation | Impact |
|-----------|---------------|--------|
| No build step | Static HTML served directly by Vercel CDN | Zero build time |
| CSS-only animations | `transform` + `opacity` only | Composite layer, no layout/paint thrashing |
| DNS Prefetch | `<link rel="dns-prefetch">` for Google Fonts, Tailwind CDN | Faster font/CSS loading |
| Preconnect | `<link rel="preconnect">` for CDN origins | Early connection setup |
| Font Preload | `<link rel="preload" as="font">` | Critical fonts loaded first |
| Font Display | `font-display: swap` | Text visible immediately |
| Lazy Loading | `loading="lazy"` on below-fold images | Reduced initial bandwidth |
| Content Visibility | `content-visibility: auto` on below-fold sections | Faster initial render |
| Scroll Throttle | `requestAnimationFrame` handlers | Smooth 60fps scroll |
| GPU Compositing | Animations use only composite properties | Hardware-accelerated |
| Reduced Motion | `prefers-reduced-motion: reduce` | Accessibility compliance |
| Prompt Caching | `cache_control: ephemeral` on system prompt | ~87.5% token cost reduction |
| TTS Text Cap | 800-character limit on TTS input | ElevenLabs cost control |
| Rate Limiting | 12 msgs/min per IP on chat API | API cost protection |

---

## 11. Header & Navigation

### Desktop (>= 1024px)
- **Layout:** Logo (left) → Centered nav links → Login + CTA (right)
- **Position:** Fixed top, `z-index: 1000`
- **Glass Effect:** `backdrop-filter: blur(24px)` + border-bottom on scroll
- **Nav Links:** AetherBot, AetherMIND, AetherDEV — animated `::after` underline on hover
- **Active State:** Permanent underline via `.active` class
- **Login Button:** Ghost style with violet border
- **CTA Button:** Gradient fill (emerald → violet) with shimmer pseudo-element
- **Language Switcher:** EN / NL / FI text links
- **Theme Toggle:** Sun/moon icon, toggles `data-theme` attribute

### Mobile (< 1024px)
- **Header:** Logo (left) + Hamburger (right)
- **Hamburger:** 3-line icon, transforms to X on open (CSS transition)
- **Menu:** Full-screen overlay (`100vh`) with centered stacked links
- **Animation:** Slide-in from right with `translateX(100%)` → `translateX(0)`

---

## 12. Footer

### Structure (5-column grid desktop, stacked mobile)
1. **Brand** — Logo, tagline, social icons (LinkedIn, X/Twitter)
2. **Products** — AetherBot, Pricing, Features
3. **Services** — AetherMIND, AetherDEV, AI Training
4. **Contact** — Phone (+31 6 1377 2333), Email (info@aetherlink.ai), "24/7 Available" badge
5. **Locations** — Netherlands, Finland, United Arab Emirates

### Bottom Bar
- Privacy Policy | Terms of Service
- EU AI Act Compliant badge
- GDPR Compliant badge
- Copyright &copy; 2026 AetherLink

---

## 13. Partner Logo Carousel

### Implementation
- CSS-only infinite marquee: `@keyframes marquee-scroll` with `translateX(-50%)`
- Logos duplicated in DOM for seamless loop
- 40-second animation, linear timing, pauses on hover

### Logo Treatment
```css
.partner-logo {
  height: 32px;
  filter: grayscale(100%) brightness(0) invert(1);
  opacity: 0.3;
}
.partner-logo:hover {
  opacity: 0.6;
  filter: grayscale(100%) brightness(0) invert(1) drop-shadow(0 0 8px rgba(255,255,255,0.1));
}
```

### Partners (15)
| Partner | File | Type |
|---------|------|------|
| Solvari | `solvari.svg` | SVG |
| Defensie (Dutch MoD) | `defensie.svg` | SVG |
| Droidor | `droidor.png` | PNG |
| Pitcrew | `pitcrew.png` | PNG |
| Welllaw | `welllaw.png` | PNG |
| CFX Video Agency | `cfx.png` | PNG |
| Van Diemen Sloopwerken | `van-diemen.png` | PNG |
| Mark Dierenarts | `mark-dierenarts.png` | PNG |
| Growing Emmen | `growing-emmen.png` | PNG |
| Doama | `doama.webp` | WebP |
| Ears Up | `ears-up.png` | PNG |
| Houkema Tools | `houkema-tools.png` | PNG |
| Konsta | `konsta.png` | PNG |
| Nieuwe Tijd Studio | `nieuwe-tijd-studio.png` | PNG |
| Nijstandhandel | `nijstandhandel.png` | PNG |

---

## 14. Browser Support

| Browser | Min Version | Notes |
|---------|-------------|-------|
| Chrome | 90+ | Full support |
| Firefox | 90+ | Full support |
| Safari | 15+ | `-webkit-backdrop-filter` prefix included |
| Edge | 90+ | Chromium-based, full support |
| Mobile Safari | 15+ | Responsive layout tested |
| Chrome Android | 90+ | Responsive layout tested |

### Critical CSS Features
- `backdrop-filter: blur()` — Safari needs `-webkit-` prefix (included)
- `content-visibility: auto` — Progressive enhancement (Chrome 85+, Firefox 124+)
- CSS `@keyframes` with `transform` — Universal support
- `IntersectionObserver` — Universal support (IE excluded by design)
- Lookbehind regex in JS — Chrome 62+, Firefox 78+, Safari 16.4+

---

## 15. Deployment

### Vercel (Primary)
- **Live URL:** https://aetherlink-site.vercel.app
- **Future Domain:** aetherlink.ai
- **Method:** Auto-deploy from GitHub push, or `npx vercel --prod`
- **Config:** Zero-config — Vercel detects static files + `/api/` serverless functions automatically
- **Framework:** None (static site)

### GitHub
- **Repository:** https://github.com/Maca2024/aetherlink-site-
- **Branch:** `main`
- **Push:** `git push origin main` triggers Vercel auto-deploy

---

## 16. Development Guidelines

### Adding a New Page
1. Copy the closest existing page as template
2. Update `<title>`, `<meta>`, `og:` tags, `canonical` URL
3. Add `hreflang` alternates pointing to all 3 language versions
4. Update the nav to mark the correct link as `.active`
5. Create translations in `/nl/`, `/en/`, `/fi/`
6. Add the page to the nav menu in all 21 existing pages
7. Add Schema.org JSON-LD (use existing pages as reference)
8. Add to `sitemap.xml` with hreflang links
9. Update this context file and `README.md`

### Adding a New Language
1. Create a new directory (e.g., `/de/`) with all 7 page translations
2. Add `hreflang` alternate links to ALL existing pages (all languages)
3. Update the language switcher in the nav across all pages
4. Update `sitemap.xml` with new URLs + hreflang
5. Add i18n entries to `js/aether-assist.js` (welcome, placeholder, suggestions, errors, TTS label)
6. Add page context descriptions to `api/chat.js` in the new language
7. Update `llms.txt` with new language URLs
8. Add `og:locale` meta tags for the new language

### Modifying AETHER-ASSIST
- **Widget UI/UX:** Edit `js/aether-assist.js` — IIFE pattern, modify inside closure. All CSS is injected via the style block inside the IIFE.
- **Chat AI behavior:** Edit `api/chat.js` — knowledge base (`KNOWLEDGE_BASE` constant), system prompt (`buildSystemPrompt` function), page contexts (`PAGE_CONTEXT` object).
- **Voice settings:** Edit `api/tts.js` — voice ID, model, voice_settings object.
- **Add env vars:** `vercel env add NAME production`

### Code Style
- No build tools — all code is hand-written HTML/CSS/JS
- Tailwind CSS via CDN for utility classes
- Custom CSS in `<style>` blocks within HTML files + `css/theme.css`
- JavaScript in `<script>` blocks at bottom of HTML files + separate JS files
- CSS custom properties (`--void`, `--surface`, etc.) for design tokens
- BEM-ish class naming for custom components (`.orbit-wrap`, `.partner-logo`, `.aether-assist-*`)
- ESM modules for serverless functions (`export default async function handler`)

---

## 17. Legal & Compliance

| Aspect | Status |
|--------|--------|
| EU AI Act | Compliant (badge in footer) |
| GDPR/AVG | Compliant (badge in footer) |
| Terms & Conditions | `docs/algemene-voorwaarden.pdf` |
| Privacy Policy | Linked in footer (page TBD) |
| Cookie Consent | Not needed (no cookies, sessionStorage only) |
| Chat Data | Not used to train models (stated in system prompt) |
| TTS Cost Control | Text capped at 800 chars per request |
| Rate Limiting | 12 messages/minute per IP |
| Copyright | &copy; 2026 AetherLink. All rights reserved. |

---

*Generated with the assistance of Claude Code (Anthropic)*
