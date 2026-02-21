-- AetherLink Blog CMS — Supabase Migration
-- Run this in Supabase Dashboard → SQL Editor

-- ═══ Blog Posts Table ═══
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- URL slugs (unique per language)
  slug_nl TEXT UNIQUE NOT NULL,
  slug_en TEXT UNIQUE NOT NULL,
  slug_fi TEXT UNIQUE NOT NULL,

  -- Content per language
  title_nl TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_fi TEXT NOT NULL,
  description_nl TEXT,
  description_en TEXT,
  description_fi TEXT,
  content_nl TEXT NOT NULL DEFAULT '',
  content_en TEXT NOT NULL DEFAULT '',
  content_fi TEXT NOT NULL DEFAULT '',

  -- Social media content
  linkedin_summary_nl TEXT,
  linkedin_summary_en TEXT,
  linkedin_summary_fi TEXT,
  linkedin_hashtags TEXT[] DEFAULT '{}',
  medium_markdown_nl TEXT,
  medium_markdown_en TEXT,
  medium_markdown_fi TEXT,

  -- Metadata
  category TEXT NOT NULL DEFAULT 'aethermind'
    CHECK (category IN ('aetherbot', 'aethermind', 'aetherdev')),
  author TEXT NOT NULL DEFAULT 'Marco',
  author_title TEXT NOT NULL DEFAULT 'CTO & AI Lead Architect',
  word_count INTEGER DEFAULT 0,
  read_time INTEGER DEFAULT 0,
  seo_keywords TEXT[] DEFAULT '{}',

  -- Status & publishing
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'review', 'published', 'archived')),
  published_at TIMESTAMPTZ,

  -- Cross-post tracking
  linkedin_posted_at TIMESTAMPTZ,
  linkedin_post_url TEXT,
  medium_posted_at TIMESTAMPTZ,
  medium_url_en TEXT,
  medium_url_nl TEXT,

  -- AI generation data
  research_data JSONB,
  generation_topic TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ Auto-update updated_at ═══
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ═══ Row Level Security ═══
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public: read only published posts
CREATE POLICY "public_read_published" ON blog_posts
  FOR SELECT
  TO anon
  USING (status = 'published');

-- Authenticated: full CRUD access
CREATE POLICY "auth_full_access" ON blog_posts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ═══ Indexes ═══
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_slug_nl ON blog_posts(slug_nl);
CREATE INDEX idx_blog_posts_slug_en ON blog_posts(slug_en);
CREATE INDEX idx_blog_posts_slug_fi ON blog_posts(slug_fi);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
