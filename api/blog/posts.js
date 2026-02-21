// GET /api/blog/posts — List all posts (admin)
// POST /api/blog/posts — Create new post (admin)
// PUT /api/blog/posts?id=uuid — Update post (admin)
import { getAdminClient, getAuthClientFromReq, getTokenFromReq, handleCors, CORS } from '../_lib/supabase.js';

async function verifyAdmin(req) {
  const token = getTokenFromReq(req);
  if (!token) return null;
  const supabase = getAuthClientFromReq(req);
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const user = await verifyAdmin(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const admin = getAdminClient();

  // ── GET: List all posts or single post by id ──
  if (req.method === 'GET') {
    const { id } = req.query;

    if (id) {
      // Single post with full data (for editor)
      const { data, error } = await admin
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) return res.status(404).json({ error: error.message });
      return res.status(200).json(data);
    }

    // List all posts (summary)
    const { data, error } = await admin
      .from('blog_posts')
      .select('id, slug_nl, slug_en, slug_fi, title_nl, title_en, title_fi, description_nl, description_en, description_fi, category, status, author, published_at, created_at, updated_at, word_count, read_time, generation_topic, research_data, linkedin_posted_at, medium_posted_at, quality_score, feedback_score, feedback_comments, learning_notes')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // ── POST: Create new post ──
  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    // Auto-generate slugs if not provided
    if (!body.slug_nl && body.title_nl) {
      body.slug_nl = slugify(body.title_nl);
    }
    if (!body.slug_en && body.title_en) {
      body.slug_en = slugify(body.title_en);
    }
    if (!body.slug_fi && body.title_fi) {
      body.slug_fi = slugify(body.title_fi);
    }

    // Calculate word count and read time
    const content = body.content_nl || body.content_en || '';
    const text = content.replace(/<[^>]+>/g, '');
    body.word_count = text.split(/\s+/).filter(Boolean).length;
    body.read_time = Math.max(1, Math.ceil(body.word_count / 200));

    const { data, error } = await admin
      .from('blog_posts')
      .insert(body)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data);
  }

  // ── PUT: Update post ──
  if (req.method === 'PUT') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing post id' });

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    delete body.id;
    delete body.created_at;

    // Recalculate word count and read time if content changed
    if (body.content_nl || body.content_en) {
      const content = body.content_nl || body.content_en || '';
      const text = content.replace(/<[^>]+>/g, '');
      body.word_count = text.split(/\s+/).filter(Boolean).length;
      body.read_time = Math.max(1, Math.ceil(body.word_count / 200));
    }

    const { data, error } = await admin
      .from('blog_posts')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data);
  }

  // ── DELETE: Delete post ──
  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing post id' });

    const { error } = await admin
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
}
