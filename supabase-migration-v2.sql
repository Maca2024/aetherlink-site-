-- ============================================================
-- AetherLink Command Center — Database Migration v2
-- Run after supabase-migration.sql (blog_posts table)
-- ============================================================

-- 1. Settings (OAuth tokens, config)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  encrypted BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage settings"
  ON settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Content Calendar
CREATE TABLE IF NOT EXISTS content_calendar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  topic TEXT,
  category TEXT DEFAULT 'aethermind' CHECK (category IN ('aetherbot','aethermind','aetherdev')),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME DEFAULT '08:00',
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned','generating','review','published','cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_calendar_date ON content_calendar(scheduled_date);
CREATE INDEX idx_calendar_status ON content_calendar(status);

ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage calendar"
  ON content_calendar FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. SEO Snapshots (daily GSC data cache)
CREATE TABLE IF NOT EXISTS seo_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  gsc_data JSONB DEFAULT '{}',
  total_impressions INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  avg_ctr NUMERIC(5,4) DEFAULT 0,
  avg_position NUMERIC(6,2) DEFAULT 0,
  pages JSONB DEFAULT '[]',
  keywords JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_seo_date ON seo_snapshots(snapshot_date);

ALTER TABLE seo_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage seo_snapshots"
  ON seo_snapshots FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. SEO Health Checks
CREATE TABLE IF NOT EXISTS seo_health_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  check_date TIMESTAMPTZ DEFAULT NOW(),
  broken_links JSONB DEFAULT '[]',
  missing_meta JSONB DEFAULT '[]',
  missing_alt_tags JSONB DEFAULT '[]',
  indexnow_submissions JSONB DEFAULT '[]',
  overall_score INTEGER DEFAULT 0,
  details JSONB DEFAULT '{}'
);

CREATE INDEX idx_health_date ON seo_health_checks(check_date DESC);

ALTER TABLE seo_health_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage health_checks"
  ON seo_health_checks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Research Cache (Perplexity results)
CREATE TABLE IF NOT EXISTS research_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  research_type TEXT DEFAULT 'trend' CHECK (research_type IN ('trend','competitive','gap','news')),
  result JSONB NOT NULL,
  sources JSONB DEFAULT '[]',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_research_type ON research_cache(research_type);
CREATE INDEX idx_research_expires ON research_cache(expires_at);

ALTER TABLE research_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage research_cache"
  ON research_cache FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Contacts (CRM)
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  company TEXT,
  role TEXT,
  type TEXT DEFAULT 'lead' CHECK (type IN ('lead','client','partner','team','contributor')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','inactive','archived')),
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  avatar_url TEXT,
  phone TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contacts_type ON contacts(type);
CREATE INDEX idx_contacts_status ON contacts(status);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage contacts"
  ON contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. Social Posts
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE SET NULL,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin','medium','twitter','other')),
  content TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','scheduled','posted','failed')),
  post_url TEXT,
  engagement JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_social_platform ON social_posts(platform);
CREATE INDEX idx_social_status ON social_posts(status);
CREATE INDEX idx_social_scheduled ON social_posts(scheduled_at);

ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage social_posts"
  ON social_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. Analytics Snapshots (GA4 data cache)
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  source TEXT DEFAULT 'ga4' CHECK (source IN ('ga4','gsc','manual')),
  metrics JSONB NOT NULL DEFAULT '{}',
  pageviews INTEGER DEFAULT 0,
  sessions INTEGER DEFAULT 0,
  users INTEGER DEFAULT 0,
  bounce_rate NUMERIC(5,2),
  avg_session_duration NUMERIC(8,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_analytics_date_source ON analytics_snapshots(snapshot_date, source);

ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage analytics_snapshots"
  ON analytics_snapshots FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. Activity Log (audit trail)
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_created ON activity_log(created_at DESC);
CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read activity_log"
  ON activity_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert activity_log"
  ON activity_log FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================
-- Done. 9 tables created with RLS and indexes.
-- ============================================================
