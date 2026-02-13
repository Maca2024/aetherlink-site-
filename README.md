# AetherLink - Corporate Website

> **The power of AI, accessible for every business.**

AetherLink is Europe's AI One-Stop-Shop offering AI assistants, consultancy, training, and custom development. This repository contains the complete multilingual corporate website.

**Live:** [https://aetherlink-website.vercel.app](https://aetherlink-website.vercel.app)

---

## Overview

AetherLink provides three core services:

| Service | Description | Page |
|---------|-------------|------|
| **AetherBot** | Ready-to-use AI chatbot for websites. 24/7 customer support, trained on your knowledge. From €39/mo. | `aetherbot.html` |
| **AetherMIND** | AI consultancy, training, workshops & strategic advisory for organisations. | `aethermind.html` |
| **AetherDEV** | Custom AI development — automations, integrations, and full AI platforms. | `aetherdev.html` |

## Tech Stack

- **HTML5** — Static, no build step required
- **Tailwind CSS** (CDN) — Utility-first styling
- **Custom CSS** — Glass morphism, orbital animations, gradient effects
- **Vanilla JavaScript** — Scroll reveals, mobile menu, FAQ accordion
- **Google Fonts** — Syne (display) + Plus Jakarta Sans (body)
- **Vercel** — Deployment & hosting

## Design System — "Luminous Void"

A dark-theme design with three accent colors mapped to each product:

| Token | Value | Usage |
|-------|-------|-------|
| `--void` | `#05060f` | Background |
| `--surface` | `#0a0d1a` | Card backgrounds |
| `--accent-cyan` | `#00d4ff` | AetherBot |
| `--accent-violet` | `#8b5cf6` | AetherMIND |
| `--accent-emerald` | `#00dfa2` | AetherDEV |
| `--muted` | `#6b7394` | Secondary text |
| `--light` | `#e4e8f1` | Primary text |

### Key Visual Elements

- **Orbital Animation** — 3 concentric rotating rings with orbiting product/capability icons, semi-circle purple arcs, and a central logo with pulsing glow. Pure CSS `@keyframes` for 60fps GPU-accelerated performance.
- **Glass Morphism Cards** — `backdrop-filter: blur(24px)` with subtle borders and hover transforms.
- **Gradient Orbs** — Floating background orbs with mouse parallax (desktop).
- **SVG Noise Grain** — Subtle texture overlay for depth.
- **Scroll Reveal** — `IntersectionObserver`-based fade-in animations with staggered delays.

## Multilingual Support

The site is available in 3 languages:

| Language | Path | Pages |
|----------|------|-------|
| English (default) | `/` | `index.html`, `aetherbot.html`, `aethermind.html`, `aetherdev.html` |
| Dutch (NL) | `/nl/` | `nl/index.html`, `nl/aetherbot.html`, `nl/aethermind.html`, `nl/aetherdev.html` |
| Finnish (FI) | `/fi/` | `fi/index.html`, `fi/aetherbot.html`, `fi/aethermind.html`, `fi/aetherdev.html` |

Each page includes:
- `hreflang` tags for SEO
- `og:locale` meta tags
- Language switcher in the navigation (EN / NL / FI)
- Fully translated content including footer, CTAs, and navigation

## Project Structure

```
aetherlink-website/
├── index.html              # EN Homepage (orbital animation hero)
├── aetherbot.html          # EN AetherBot product page
├── aethermind.html         # EN AetherMIND services page
├── aetherdev.html          # EN AetherDEV development page
├── nl/                     # Dutch translations
│   ├── index.html
│   ├── aetherbot.html
│   ├── aethermind.html
│   └── aetherdev.html
├── fi/                     # Finnish translations
│   ├── index.html
│   ├── aetherbot.html
│   ├── aethermind.html
│   └── aetherdev.html
├── images/
│   ├── logo-white.png      # White logo (nav, footer, hero)
│   ├── logo-color.png      # Color logo (OG images)
│   ├── logo-white.svg      # Vector white logo
│   ├── logo-color.svg      # Vector color logo
│   ├── favicon.png         # Browser favicon
│   └── partners/           # Partner logos (grayscale carousel)
│       ├── solvari.svg
│       ├── defensie.svg
│       ├── droidor.png
│       ├── pitcrew.png
│       ├── welllaw.png
│       ├── cfx.png
│       ├── van-diemen.png
│       ├── mark-dierenarts.png
│       ├── growing-emmen.png
│       └── doama.webp
└── README.md
```

## Page Features

### Homepage (`index.html`)
- Orbital animation hero with 8 orbiting icons across 3 rings
- Three product cards with accent-colored top lines
- Partner logo carousel (grayscale, CSS filtered)
- "Why AetherLink" USP section (4 cards)
- Footer CTA with gradient background

### AetherBot (`aetherbot.html`)
- Product hero with cyan accent theme
- 6 feature cards with icons
- 3-step "How it works" section
- 3 pricing plans (Starter €39, Professional €399, Enterprise custom)
- Feature comparison table
- 3 use cases with testimonials
- Product roadmap (4 items)
- FAQ accordion (5 items with Schema.org markup)

### AetherMIND (`aethermind.html`)
- Services hero with violet accent theme
- 3 service detail cards (Consultancy, Training, Advisory)
- Training topics table (7 subjects)
- 3-step approach methodology

### AetherDEV (`aetherdev.html`)
- Development hero with emerald accent theme
- 4 "What we build" cards with example tags
- 4-step process timeline
- 4 USP cards

## Performance

- **No build step** — Static HTML served directly
- **CSS-only animations** — `transform` and `opacity` only (composite layer, no layout/paint)
- **DNS prefetch** — Pre-resolves Google Fonts and Tailwind CDN
- **Font preload** — Critical font resources preloaded
- **`font-display: swap`** — Text visible immediately while fonts load
- **`loading="lazy"`** — Below-fold images load on scroll
- **`content-visibility: auto`** — Below-fold sections skip rendering until needed
- **`requestAnimationFrame`** — Throttled scroll handlers
- **`prefers-reduced-motion`** — Respects user accessibility preferences

## Header & Navigation

Award-winning fixed header with:
- Logo (left) → Centered nav links → Login + CTA (right)
- `backdrop-filter: blur(24px)` glass effect on scroll
- Animated underline hover effect on nav links
- Language switcher (EN / NL / FI)
- Full-screen mobile overlay menu with hamburger → X animation
- Responsive breakpoint at `1024px` (desktop/mobile split)

## Footer

5-column layout:
- **Brand** — Logo, tagline, social links (LinkedIn, X/Twitter)
- **Products** — AetherBot, Pricing, Features
- **Services** — AetherMIND, AetherDEV, AI Training
- **Contact** — Phone (+31 6 1377 2333), Email (info@aetherlink.ai), 24/7 availability
- **Locations** — Netherlands, Finland, United Arab Emirates
- Bottom bar: Privacy Policy, Terms of Service, EU AI Act & GDPR compliance badges

## SEO & Schema Markup

- Open Graph meta tags on all pages
- `hreflang` alternate links for multilingual SEO
- Schema.org `Organization` markup (homepage)
- Schema.org `SoftwareApplication` markup (AetherBot)
- Schema.org `FAQPage` markup (AetherBot FAQ section)
- Canonical URLs on all pages

## Deployment

Hosted on [Vercel](https://vercel.com). Deploy with:

```bash
npx vercel --prod
```

No build configuration needed — Vercel serves the static files directly.

## Contact

- **Website:** [https://aetherlink.ai](https://aetherlink.ai)
- **Email:** info@aetherlink.ai
- **Phone:** +31 6 1377 2333
- **LinkedIn:** [AetherLink](https://www.linkedin.com/company/aetherlink/)

## License

Copyright © 2026 AetherLink. All rights reserved.
