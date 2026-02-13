# AetherLink Website — Project Context

> Complete technical and design context for the AetherLink corporate website.
> This document serves as the single source of truth for developers, designers, and AI agents working on this project.

---

## 1. Company Overview

**AetherLink** is Europe's AI One-Stop-Shop, headquartered in the Netherlands with operations in Finland and the United Arab Emirates. The company provides end-to-end AI solutions for businesses of all sizes.

### Mission
> The power of AI, accessible for every business.

### Contact
- **Website:** https://aetherlink.ai
- **Email:** info@aetherlink.ai
- **Phone:** +31 6 1377 2333
- **LinkedIn:** https://linkedin.com/company/aetherlink
- **Availability:** 24/7 support

### Locations
| Region | Country |
|--------|---------|
| Europe (HQ) | Netherlands |
| Nordics | Finland |
| Middle East | United Arab Emirates |

---

## 2. Products & Services

### AetherBot — AI Chatbot Platform
- **Accent Color:** Cyan `#00d4ff`
- **Description:** Ready-to-use AI chatbot for websites. Provides 24/7 customer support, trained on your knowledge base. Handles FAQs, lead generation, and appointment scheduling.
- **Pricing Tiers:**
  - Starter: €39/month (1 chatbot, 1,000 conversations/mo)
  - Professional: €399/month (5 chatbots, 10,000 conversations/mo, analytics)
  - Enterprise: Custom pricing (unlimited, dedicated support, SLA)
- **Key Features:** Knowledge base training, multilingual support, analytics dashboard, CRM integration, human handoff, custom branding
- **Schema Markup:** `SoftwareApplication` + `FAQPage`

### AetherMIND — AI Consultancy & Training
- **Accent Color:** Violet `#8b5cf6`
- **Description:** Strategic AI consultancy, hands-on training, and workshops for organisations looking to adopt AI.
- **Service Areas:**
  - AI Consultancy (strategy, roadmaps, implementation planning)
  - AI Training (7 training topics, from prompt engineering to AI ethics)
  - Strategic Advisory (board-level AI governance, EU AI Act compliance)
- **Methodology:** 3-step approach (Assess → Implement → Scale)

### AetherDEV — Custom AI Development
- **Accent Color:** Emerald `#00dfa2`
- **Description:** Bespoke AI development services — automations, integrations, and full AI platforms.
- **Capabilities:**
  - AI-powered automations (workflow optimization, document processing)
  - API integrations (connecting AI to existing business systems)
  - Custom AI platforms (full-stack AI solutions, dashboards)
  - Data pipelines (ETL, data enrichment, analytics)
- **Process:** 4-step (Discovery → Design → Develop → Deploy)

---

## 3. Design System — "Luminous Void"

### Philosophy
A premium dark-theme aesthetic that balances sophistication with approachability. The design draws inspiration from deep space, with floating elements, glass morphism, and orbital motion suggesting the interconnected nature of AI systems.

### Color Tokens

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--void` | `#05060f` | `5, 6, 15` | Page background, deepest layer |
| `--surface` | `#0a0d1a` | `10, 13, 26` | Card backgrounds, elevated surfaces |
| `--border` | `#1a1f35` | `26, 31, 53` | Card borders, dividers |
| `--accent-cyan` | `#00d4ff` | `0, 212, 255` | AetherBot branding, CTAs |
| `--accent-violet` | `#8b5cf6` | `139, 92, 246` | AetherMIND branding, navigation |
| `--accent-emerald` | `#00dfa2` | `0, 223, 162` | AetherDEV branding, success states |
| `--muted` | `#6b7394` | `107, 115, 148` | Secondary text, labels, captions |
| `--light` | `#e4e8f1` | `228, 232, 241` | Primary text, headings |

### Gradients
- **CTA Gradient:** `linear-gradient(135deg, #00dfa2, #8b5cf6)` — Emerald to Violet
- **Hero Glow:** `radial-gradient(circle at 30% 50%, rgba(139,92,246,0.15), transparent 50%)`
- **Card Hover:** `rgba(139,92,246,0.05)` overlay

### Typography

| Role | Font | Weight | Size Range |
|------|------|--------|------------|
| Display / Headings | **Syne** | 700-800 | 36px–72px |
| Body / UI | **Plus Jakarta Sans** | 400-600 | 14px–18px |
| Code / Monospace | System monospace | 400 | 14px |

**Source:** Google Fonts CDN with `font-display: swap` and preload hints.

### Spacing Scale
- Section padding: `120px 0` (desktop), `80px 0` (mobile)
- Card padding: `32px` (desktop), `24px` (mobile)
- Content max-width: `1200px` centered
- Grid gap: `32px` (desktop), `24px` (mobile)

### Elevation & Glass
```css
/* Glass card effect */
.glass-card {
    background: rgba(10, 13, 26, 0.6);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 20px;
}

/* Hover lift */
.card:hover {
    transform: translateY(-8px);
    border-color: rgba(139, 92, 246, 0.3);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}
```

### Visual Effects
1. **SVG Noise Grain** — `<svg>` filter with `feTurbulence` overlaid at 3% opacity for texture
2. **Gradient Orbs** — Fixed-position background blobs with `filter: blur(100px)` for ambient glow
3. **Mouse Parallax** — Desktop-only `mousemove` listener shifting orb positions
4. **Scroll Reveal** — `IntersectionObserver` with `threshold: 0.1`, staggered `animation-delay`
5. **Reduced Motion** — All animations respect `prefers-reduced-motion: reduce`

---

## 4. Orbital Animation

The hero section features a signature orbital animation with 3 concentric rotating rings, each containing orbiting product/capability icons.

### Structure
```
orbit-wrap (540×540px, centered)
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

### Key Technique
Icons stay upright while orbiting using the counter-rotation trick:
```css
@keyframes orbit-outer {
    from { transform: rotate(0deg) translateX(240px) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(240px) rotate(-360deg); }
}
```
Negative `animation-delay` positions icons evenly around the ring.

### Responsive Scaling
Instead of recalculating all positions per breakpoint, the entire wrapper scales:
| Breakpoint | Scale | Margin Compensation |
|------------|-------|---------------------|
| > 1280px | 1.0 | none |
| 1024–1280px | 0.82 | -40px top |
| 768–1024px | 0.7 | -60px top |
| 480–768px | 0.58 | -80px top/bottom |
| < 480px | 0.48 | -100px top/bottom |

---

## 5. Header & Navigation

### Desktop (≥ 1024px)
- **Layout:** Logo (left) → Centered nav links → Login + CTA (right)
- **Position:** Fixed top, `z-index: 1000`
- **Glass Effect:** `backdrop-filter: blur(24px)` + border-bottom on scroll
- **Nav Links:** AetherBot, AetherMIND, AetherDEV — each with `::after` animated underline on hover
- **Active State:** Permanent underline via `.active` class
- **Login Button:** Ghost style with violet border
- **CTA Button:** Gradient fill (emerald → violet) with shimmer pseudo-element
- **Language Switcher:** EN / NL / FI text links

### Mobile (< 1024px)
- **Header:** Logo (left) + Hamburger (right)
- **Hamburger:** 3-line icon, transforms to X on open
- **Menu:** Full-screen overlay (`100vh`) with centered stacked links
- **Animation:** Slide-in from right with `translateX(100%)` → `translateX(0)`

---

## 6. Footer

### Structure (5-column grid on desktop, stacked on mobile)
1. **Brand** — Logo, tagline, social icons (LinkedIn, X/Twitter)
2. **Products** — AetherBot, Pricing, Features
3. **Services** — AetherMIND, AetherDEV, AI Training
4. **Contact** — Phone, Email, "24/7 Available" badge
5. **Locations** — Netherlands, Finland, United Arab Emirates (with flag emojis)

### Bottom Bar
- Privacy Policy | Terms of Service
- EU AI Act Compliant badge
- GDPR Compliant badge
- Copyright © 2026 AetherLink

---

## 7. Partner Logo Carousel

### Implementation
- CSS-only infinite marquee using `@keyframes marquee-scroll` with `translateX(-50%)`
- Logos duplicated in DOM for seamless loop (20 images total, 10 unique)
- 40-second animation duration, linear timing, `animation-play-state: paused` on hover

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

### Partners (10)
| Partner | File | Type |
|---------|------|------|
| Solvari | `solvari.svg` | SVG |
| Defensie (Dutch MoD) | `defensie.svg` | SVG |
| Droidor | `droidor.png` | PNG (bg removed) |
| Pitcrew | `pitcrew.png` | PNG (bg removed) |
| Welllaw | `welllaw.png` | PNG (bg removed) |
| CFX Video Agency | `cfx.png` | PNG (bg removed) |
| Van Diemen Sloopwerken | `van-diemen.png` | PNG (bg removed) |
| Mark Dierenarts | `mark-dierenarts.png` | PNG (bg removed) |
| Growing Emmen | `growing-emmen.png` | PNG (bg removed) |
| Doama | `doama.webp` | WebP |

**Note:** Logos with opaque backgrounds were processed with Python/Pillow to remove backgrounds, enabling the CSS grayscale filter to work correctly.

---

## 8. Multilingual Architecture

### Languages
| Language | Code | Path | Default |
|----------|------|------|---------|
| English | `en` | `/` (root) | Yes |
| Dutch (Nederlands) | `nl` | `/nl/` | No |
| Finnish (Suomi) | `fi` | `/fi/` | No |

### Per-Page Requirements
Each page must include:
1. `<html lang="xx">` attribute matching the language
2. `<link rel="alternate" hreflang="xx">` tags for all 3 language versions
3. `<meta property="og:locale" content="xx_XX">` for social sharing
4. `<link rel="canonical">` pointing to the current URL
5. Language switcher in the nav (EN / NL / FI links)
6. Fully translated: nav labels, hero text, section titles, CTAs, footer, button text

### Translation Notes
- **Dutch:** "Inloggen" (Login), "Aan de slag" (Get started), "Producten" (Products), "Diensten" (Services)
- **Finnish:** "Kirjaudu" (Login), "Aloita tasta" (Get started), "Tuotteet" (Products), "Palvelut" (Services)

### Asset Paths
- Root pages: `images/...`, `styles.css`
- Subdirectory pages: `../images/...`, `../styles.css`

---

## 9. Page Inventory

| # | File | Language | Type | Accent |
|---|------|----------|------|--------|
| 1 | `index.html` | EN | Homepage | Multi (all 3) |
| 2 | `aetherbot.html` | EN | Product | Cyan |
| 3 | `aethermind.html` | EN | Service | Violet |
| 4 | `aetherdev.html` | EN | Service | Emerald |
| 5 | `nl/index.html` | NL | Homepage | Multi (all 3) |
| 6 | `nl/aetherbot.html` | NL | Product | Cyan |
| 7 | `nl/aethermind.html` | NL | Service | Violet |
| 8 | `nl/aetherdev.html` | NL | Service | Emerald |
| 9 | `fi/index.html` | FI | Homepage | Multi (all 3) |
| 10 | `fi/aetherbot.html` | FI | Product | Cyan |
| 11 | `fi/aethermind.html` | FI | Service | Violet |
| 12 | `fi/aetherdev.html` | FI | Service | Emerald |

### Page-Specific Features

**Homepages (index.html):**
- Orbital animation hero (3 rings, 8 orbiting icons)
- 3 product cards with accent-colored top borders
- Partner logo marquee carousel (10 logos)
- "Why AetherLink" USP section (4 cards)
- Footer CTA with gradient background

**AetherBot pages:**
- Product hero with cyan accent
- 6 feature cards with icons
- 3-step "How it works"
- 3 pricing plans with feature comparison table
- 3 use cases with testimonials
- Product roadmap (4 items)
- FAQ accordion (5 items with Schema.org `FAQPage` markup)

**AetherMIND pages:**
- Service hero with violet accent
- 3 service detail cards (Consultancy, Training, Advisory)
- Training topics table (7 subjects)
- 3-step approach methodology

**AetherDEV pages:**
- Development hero with emerald accent
- 4 capability cards with example tags
- 4-step process timeline
- 4 USP cards

---

## 10. Performance Optimizations

| Technique | Implementation |
|-----------|---------------|
| No build step | Static HTML, no bundler or framework |
| DNS Prefetch | `<link rel="dns-prefetch">` for Google Fonts, Tailwind CDN |
| Font Preload | `<link rel="preload" as="font">` for critical font files |
| Font Display | `font-display: swap` — text visible while fonts load |
| Lazy Loading | `loading="lazy"` on below-fold images |
| Content Visibility | `content-visibility: auto` on below-fold sections |
| Scroll Throttle | `requestAnimationFrame` for scroll event handlers |
| GPU Compositing | Animations use only `transform` + `opacity` (no layout/paint) |
| Reduced Motion | `prefers-reduced-motion: reduce` disables all animations |

---

## 11. SEO & Schema Markup

### Meta Tags (all pages)
```html
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="images/logo-color.png">
<meta property="og:url" content="https://aetherlink.ai/...">
<meta property="og:locale" content="en_US"> <!-- or nl_NL / fi_FI -->
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
```

### Schema.org Markup
- **Homepage:** `Organization` schema (name, logo, URL, contact, social links)
- **AetherBot:** `SoftwareApplication` schema (name, description, pricing, rating)
- **AetherBot FAQ:** `FAQPage` schema (5 Q&A pairs with `Question` + `Answer` types)

### Canonical & Hreflang
```html
<link rel="canonical" href="https://aetherlink.ai/">
<link rel="alternate" hreflang="en" href="https://aetherlink.ai/">
<link rel="alternate" hreflang="nl" href="https://aetherlink.ai/nl/">
<link rel="alternate" hreflang="fi" href="https://aetherlink.ai/fi/">
<link rel="alternate" hreflang="x-default" href="https://aetherlink.ai/">
```

---

## 12. Deployment

### Vercel (Primary)
- **URL:** https://aetherlink-website.vercel.app
- **Method:** `npx vercel --prod` from project root
- **Config:** Zero-config (static files served directly)
- **Framework:** None detected (static)

### GitHub
- **Repository:** https://github.com/Maca2024/aetherlink-site-
- **Branch:** `main`
- **Push:** `git push origin main`

### Custom Domain (Future)
- Target: `aetherlink.ai`
- Vercel supports custom domains via project settings

---

## 13. Browser Support

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 90+ | Full support |
| Firefox | 90+ | Full support |
| Safari | 15+ | `-webkit-backdrop-filter` prefix needed |
| Edge | 90+ | Chromium-based, full support |
| Mobile Safari | 15+ | Tested, responsive |
| Chrome Android | 90+ | Tested, responsive |

### Critical CSS Features Used
- `backdrop-filter: blur()` — Safari needs `-webkit-` prefix (included)
- `content-visibility: auto` — Progressive enhancement (Chrome 85+, Firefox 124+)
- CSS `@keyframes` with `transform` — Universal support
- `IntersectionObserver` — Universal support (IE excluded by design)

---

## 14. File Size Budget

| Asset Type | Target | Actual |
|------------|--------|--------|
| HTML per page | < 80KB | ~45-70KB |
| Total images | < 2MB | ~1.5MB |
| External CSS (Tailwind CDN) | ~300KB (cached) | CDN-cached |
| External fonts | ~100KB (cached) | CDN-cached |
| Total first load | < 500KB | ~350KB |

---

## 15. Development Guidelines

### Adding a New Page
1. Copy the closest existing page as a template
2. Update `<title>`, `<meta>` tags, `og:` tags, and `canonical` URL
3. Add `hreflang` alternates pointing to all 3 language versions
4. Update the nav to mark the correct link as `.active`
5. Create translations in `/nl/` and `/fi/` directories
6. Add the page to the nav menu in all 12 existing pages
7. Update this context file and README.md

### Adding a New Language
1. Create a new directory (e.g., `/de/`) with all 4 page translations
2. Add `hreflang` alternate links to ALL existing pages (all languages)
3. Update the language switcher in the nav across all pages
4. Update `og:locale` meta tags
5. Translate: nav labels, hero content, section titles, CTAs, footer, buttons

### Adding a New Partner Logo
1. Place the logo in `images/partners/` (prefer SVG or PNG with transparent background)
2. If the logo has an opaque background, remove it first (Python/Pillow or image editor)
3. Add `<img>` tags to the marquee in all 3 homepage files (EN, NL, FI)
4. Remember to add the duplicate entry too (for seamless loop)
5. Test that the CSS grayscale filter renders correctly

### Code Style
- No build tools — all code is hand-written HTML/CSS/JS
- Tailwind CSS via CDN for utility classes
- Custom CSS in `<style>` blocks within each HTML file
- JavaScript in `<script>` blocks at the bottom of each HTML file
- CSS custom properties (`--void`, `--surface`, etc.) for design tokens
- BEM-ish class naming for custom components (`.orbit-wrap`, `.partner-logo`)

---

## 16. Legal & Compliance

- **EU AI Act:** Compliant (badge displayed in footer)
- **GDPR:** Compliant (badge displayed in footer)
- **Privacy Policy:** Linked in footer (page TBD)
- **Terms of Service:** Linked in footer (page TBD)
- **Copyright:** © 2026 AetherLink. All rights reserved.
- **Cookie Consent:** Not yet implemented (TODO)

---

*Last updated: February 2026*
*Generated with the assistance of Claude Code (Anthropic)*
