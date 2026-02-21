# AETHERLINK COMMAND CENTER — Technical Blueprint v1.0

> *"We don't use platforms. We build the platform."*
> — AetherLink Engineering, February 2026

---

## 1. Executive Summary

**AetherLink Core** is a self-governing, AI-powered digital ecosystem that replaces legacy CMS platforms (Squarespace, WordPress, Wix) with a unified Command Center. It combines autonomous content generation, SEO optimization, KPI monitoring, social media orchestration, and CRM into a single "God-Mode" dashboard — all powered by AI agents and designed for zero-friction operation.

The platform is built on the existing AetherLink infrastructure (Vercel + Supabase + serverless APIs) and extends it with 6 integrated modules, 8 new database tables, 15 new API routes, and a fully modular admin dashboard.

**What makes this 100x better than Squarespace:**
- Content writes itself (Claude + Perplexity research → quality-gated articles)
- SEO optimizes itself (Google Search Console integration + health crawler)
- Social media distributes itself (AI-generated copy → LinkedIn/Medium/X)
- Performance monitors itself (GA4 + GSC daily snapshots → KPI dashboard)
- The system learns from its own output (feedback loop → better generation)

---

## 2. Immediate Fix: Blog Button in Header

**Problem:** Desktop nav flex container uses `gap-1` (0.25rem) with 7 items, causing the Blog link to be squeezed on narrower viewports.

**Fix applied to all 24 HTML files:**
```diff
- <div class="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
+ <div class="hidden lg:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
```

**Status:** DONE

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AETHERLINK COMMAND CENTER                     │
│                         /admin/                                  │
├─────────┬───────────┬──────────┬─────────┬──────────┬──────────┤
│ Content │    SEO    │  Intel   │   CRM   │  Social  │   KPI    │
│ Module  │  Module   │  Module  │  Module │  Module  │  Module  │
│         │           │          │         │          │          │
│ Editor  │ GSC Data  │ Perplx   │ Contacts│ Schedule │ GA4 Data │
│ Calendar│ Keywords  │ Trends   │ Partners│ CrossPost│ Traffic  │
│ AI Gen  │ Health    │ Gaps     │ Activity│ AI Copy  │ Metrics  │
│ Bulk    │ IndexNow  │ Compete  │         │ Analytics│          │
├─────────┴───────────┴──────────┴─────────┴──────────┴──────────┤
│                      API LAYER (Vercel Serverless)               │
│  /api/blog/*  /api/seo/*  /api/intelligence/*  /api/crm/*       │
│  /api/social/*  /api/kpi/*  /api/chat  /api/og  /api/sitemap    │
├──────────────────────────────────────────────────────────────────┤
│                    SUPABASE (PostgreSQL + Auth + RLS)            │
│  blog_posts | content_calendar | seo_snapshots | contacts       │
│  social_posts | analytics_snapshots | research_cache | settings  │
│  seo_health_checks | activity_log                                │
├──────────────────────────────────────────────────────────────────┤
│                    EXTERNAL SERVICES                             │
│  Claude API | Perplexity Sonar | Google GSC/GA4 | LinkedIn API  │
│  Medium API | IndexNow | ElevenLabs | GitHub Actions             │
└──────────────────────────────────────────────────────────────────┘
```

### Tech Stack
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Admin Frontend | Vanilla JS + ES Modules | No build step, fast, modular |
| Styling | Tailwind CSS (CDN) | Consistent with public site |
| Charts | Chart.js (CDN) | Data visualization |
| Backend | Vercel Serverless Functions | API routes, OAuth flows |
| Database | Supabase PostgreSQL | Persistent storage + RLS |
| Auth | Supabase Auth (JWT) | Admin authentication |
| AI Generation | Claude Sonnet 4.5 | Content, social copy |
| AI Research | Perplexity Sonar | Trend research, competitive intel |
| Analytics | Google GSC API + GA4 API | SEO + traffic data |
| Social | LinkedIn API + Medium API | Cross-posting |
| CI/CD | GitHub Actions | Blog autopilot, SEO snapshots |
| Hosting | Vercel | Auto-deploy on push |

---

## 4. Feature Modules

### Module A: SEO & Content Autopilot

**Existing:** Blog CRUD, AI generation (Claude), quality gate (11-point/100), Perplexity research, auto-publish (≥85 score), learning loop.

**New capabilities:**
- **Content Calendar** — Month-view grid showing scheduled generations, published posts, autopilot schedule (Mon/Wed/Fri). Drag to reschedule.
- **Split-Pane Editor** — Left: HTML editor. Right: live preview using the same template engine as the public blog.
- **Bulk Operations** — Select multiple posts → publish/archive/regenerate.
- **Quality Analytics** — Chart.js radar chart showing score breakdown across 11 criteria. Line chart tracking quality trends over time.
- **Generation Queue** — Queue multiple topics for batch generation, track progress.

**API Routes:**
- `POST /api/blog/calendar` — CRUD for content_calendar
- `POST /api/blog/bulk` — Bulk operations

**Database:** `content_calendar` table

---

### Module B: SEO Dashboard + Perplexity Intelligence

**Google Search Console Integration:**
- OAuth flow: admin clicks "Connect" → Google consent → callback stores encrypted refresh token in Supabase
- Daily snapshot via GitHub Actions cron (05:00 UTC)
- Dashboard shows: impressions, clicks, CTR, position (4 KPI cards with sparklines)
- Top pages table (sorted by impressions/clicks)
- Top keywords table with position changes (↑↓ arrows)
- 28-day/90-day trend line charts

**Keyword Tracker:**
- Manual keyword input + auto-extraction from `blog_posts.seo_keywords`
- Position history over time (line chart per keyword)
- Group by category (aetherbot/aethermind/aetherdev)

**Technical SEO Health:**
- Crawler checks all pages: meta titles (50-60 chars), descriptions (150-160), canonical, hreflang, alt tags, broken links, Schema.org
- Health score card (0-100) with issue list
- "Fix" guidance for each issue

**Perplexity Intelligence:**
- Trend research interface with saved history
- Competitive analysis: "Who ranks for [keyword]?"
- Content gap analysis: existing topics vs trending topics → "Generate Article" button
- AI industry news feed (cached, 12h TTL)

**API Routes:**
- `GET/POST /api/seo/gsc-auth` — OAuth flow
- `GET /api/seo/gsc` — Fetch + cache GSC data
- `POST /api/seo/health` — Run technical SEO audit
- `POST /api/intelligence/trends` — Trend research
- `POST /api/intelligence/competitive` — Competitive analysis
- `POST /api/intelligence/gaps` — Content gap analysis

**Database:** `seo_snapshots`, `seo_health_checks`, `research_cache`, `settings`

---

### Module C: Community & CRM

**Contacts Directory:**
- List/grid view with filters: lead, client, partner, team, contributor
- Contact detail modal with notes timeline
- Tag-based categorization
- CSV import/export

**Activity Feed:**
- Chronological log of all admin actions
- Auto-logged: post create/publish/delete, social post, contact add, SEO check
- Filterable by entity type

**API Routes:**
- `GET/POST/PUT/DELETE /api/crm/contacts` — Full CRUD
- `GET /api/crm/activity` — Activity feed

**Database:** `contacts`, `activity_log`

---

### Module D: Social Media Orchestrator

**Cross-Posting Dashboard:**
- Visual status per post: LinkedIn (✓/✗/date), Medium (✓/✗/date)
- One-click cross-post button
- Batch cross-post for multiple posts

**Content Scheduling:**
- Calendar view for scheduled social posts
- GitHub Actions cron triggers actual posting

**AI Social Copy:**
- Select blog post → Claude generates LinkedIn post, tweet thread, Medium intro
- Edit in-place, then post

**Social Analytics:**
- Engagement metrics per post (likes, comments, shares)
- Trend charts over time

**API Routes:**
- `GET/POST/PUT/DELETE /api/social/posts` — Social posts CRUD
- `POST /api/social/suggest` — AI copy generation

**Database:** `social_posts`

---

### Module E: KPI Monitor (Google Analytics + Aggregated)

**Google Analytics 4 Integration:**
- Same OAuth pattern as GSC
- GA4 Data API: pageviews, sessions, users, bounce rate, top pages
- Daily snapshot in `analytics_snapshots`

**Aggregated KPI Dashboard:**
- 6 top-level KPI cards: pageviews (7d), sessions (7d), avg CTR, published count, social engagement, content quality avg
- Mini-charts grid:
  - Traffic trend (30-day line chart)
  - Content production (weekly bar chart)
  - SEO health gauge
  - Social engagement by platform

**API Routes:**
- `GET/POST /api/kpi/ga4-auth` — OAuth flow
- `GET /api/kpi/ga4` — Fetch + cache GA4 data
- `GET /api/kpi/dashboard` — Aggregated KPI payload

**Database:** `analytics_snapshots`

---

## 5. Database Schema

Total: **9 new tables** added to existing `blog_posts` table.

See migration file: `supabase-migration-v2.sql`

**Key design decisions:**
- All tables use UUID primary keys (consistent with existing schema)
- JSONB for flexible nested data (metrics, engagement, research results)
- RLS: `anon` = no access, `authenticated` = full CRUD
- Commonly queried fields extracted as columns (not buried in JSONB) for index performance
- Daily snapshots use unique date index to prevent duplicates

---

## 6. Admin Dashboard UI

### Layout
```
┌──────────────────────────────────────────────┐
│  [Logo]  AetherLink Command Center   [User▾] │
├────────┬─────────────────────────────────────┤
│        │                                     │
│ CONTENT│  ┌──────┐ ┌──────┐ ┌──────┐ ┌─────┐│
│ ▸ Posts│  │Views │ │Click │ │ CTR  │ │Score││
│ ▸ Gen  │  │12.4K │ │ 890  │ │3.2%  │ │ 87  ││
│ ▸ Cal  │  └──────┘ └──────┘ └──────┘ └─────┘│
│        │                                     │
│ SEO    │  ┌─────────────────────────────────┐│
│ ▸ Dash │  │    [Chart: Traffic Trend 30d]   ││
│ ▸ Keys │  │                                 ││
│ ▸ Health│ │    ~~~~~/\~~~~~/\~~~~~/\~~~~~   ││
│        │  └─────────────────────────────────┘│
│ INTEL  │                                     │
│ ▸ Trend│  ┌─────────────┐ ┌─────────────────┐│
│ ▸ Comp │  │ Top Keywords│ │ Recent Posts    ││
│ ▸ Gaps │  │ ai chatbot  │ │ [Title] 92pts  ││
│        │  │ ai consult  │ │ [Title] 87pts  ││
│ CRM    │  │ fractional  │ │ [Title] 78pts  ││
│ ▸ Ppl  │  └─────────────┘ └─────────────────┘│
│ ▸ Feed │                                     │
│        │                                     │
│ SOCIAL │                                     │
│ ▸ Posts│                                     │
│ ▸ Sched│                                     │
│        │                                     │
│ KPI    │                                     │
│ ▸ Dash │                                     │
│ ▸ Traff│                                     │
│        │                                     │
│────────│                                     │
│ [⚙Set] │                                     │
│ [↩Log] │                                     │
└────────┴─────────────────────────────────────┘
```

### Design System
- Same as public site: void background, glass cards, cyan/violet/emerald accents
- Sidebar: fixed w-64, collapsible to w-16 (icons only)
- Content area: max-w-7xl, responsive grid
- Cards: backdrop-blur, border-white/8, rounded-2xl
- Active nav: left cyan border, highlighted text

---

## 7. Agentic Roadmap — The To-Do for Opus 4.6

### Phase 1: Foundation (Current Sprint)
- [x] Fix blog button CSS (gap-1 → gap-2)
- [ ] Create Supabase migration v2 SQL
- [ ] Build admin shell: sidebar + router + auth
- [ ] Create ES module file structure under admin/js/
- [ ] Migrate existing blog CRUD into content/dashboard.js
- [ ] Migrate existing AI generator into content/generator.js
- [ ] Migrate existing editor into content/editor.js
- [ ] Add Chart.js CDN to admin
- [ ] Verify all existing functionality works identically

### Phase 2: Content Enhancements
- [ ] Build content calendar API (api/blog/calendar.js)
- [ ] Build calendar UI component (calendar-grid.js)
- [ ] Build content calendar view (content/calendar.js)
- [ ] Build split-pane editor with live preview
- [ ] Build bulk operations API (api/blog/bulk.js)
- [ ] Add quality score Chart.js radar chart
- [ ] Add quality trend line chart
- [ ] Implement activity logging middleware

### Phase 3: SEO Dashboard
- [ ] Install googleapis npm package
- [ ] Build GSC OAuth flow (api/seo/gsc-auth.js)
- [ ] Build GSC data fetcher (api/seo/gsc.js)
- [ ] Build SEO dashboard UI with Chart.js
- [ ] Build keyword tracker view
- [ ] Build health crawler (api/seo/health.js)
- [ ] Build health check UI
- [ ] Create seo-daily-snapshot.yml GitHub Action
- [ ] Build settings page for OAuth management

### Phase 4: Intelligence + Social
- [ ] Build intelligence trends API (api/intelligence/trends.js)
- [ ] Build competitive analysis API (api/intelligence/competitive.js)
- [ ] Build content gaps API (api/intelligence/gaps.js)
- [ ] Build intelligence dashboard UI
- [ ] Build social posts API (api/social/posts.js)
- [ ] Build AI copy suggestion API (api/social/suggest.js)
- [ ] Build social dashboard + scheduling UI
- [ ] Build news feed component

### Phase 5: CRM + KPI + Polish
- [ ] Build contacts API (api/crm/contacts.js)
- [ ] Build activity API (api/crm/activity.js)
- [ ] Build CRM dashboard + contact detail UI
- [ ] Build GA4 OAuth flow (api/kpi/ga4-auth.js)
- [ ] Build GA4 data fetcher (api/kpi/ga4.js)
- [ ] Build KPI aggregation API (api/kpi/dashboard.js)
- [ ] Build KPI dashboard UI
- [ ] Mobile responsiveness pass
- [ ] Performance optimization
- [ ] Documentation

---

## 8. Environment Variables

### Existing (already configured)
| Variable | Service |
|----------|---------|
| `SUPABASE_URL` | Database |
| `SUPABASE_ANON_KEY` | Client auth |
| `SUPABASE_SERVICE_KEY` | Admin ops |
| `ANTHROPIC_API_KEY` | Claude AI |
| `PERPLEXITY_API_KEY` | Research |
| `LINKEDIN_ACCESS_TOKEN` | Social |
| `LINKEDIN_AUTHOR_URN` | Social |
| `MEDIUM_TOKEN` | Social |
| `INDEXNOW_KEY` | SEO indexing |

### New (Phase 3+)
| Variable | Service | Setup |
|----------|---------|-------|
| `GOOGLE_CLIENT_ID` | GSC/GA4 OAuth | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | GSC/GA4 OAuth | Google Cloud Console |
| `SETTINGS_ENCRYPTION_KEY` | Token encryption | Generate 32-byte random |
| `GA4_PROPERTY_ID` | Analytics | GA4 Admin |

---

## 9. Security Considerations

- All admin API routes authenticated via Supabase JWT
- Google OAuth tokens encrypted at rest in Supabase `settings` table
- Admin panel served with `noindex, nofollow`, `no-cache` headers
- CSP header updated to allow Chart.js CDN and Google OAuth redirects
- RLS enforced on all new tables
- Activity logging creates full audit trail
- Rate limiting on AI generation endpoints (existing)

---

*Generated by AetherLink Engineering — February 2026*
*Architecture: Opus 4.6 | Implementation: Claude Code*
