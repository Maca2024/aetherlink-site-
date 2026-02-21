// POST /api/blog/publish?id=uuid — Publish a blog post + IndexNow submit
import { getAdminClient, verifyAdmin, handleCors } from '../_lib/supabase.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await verifyAdmin(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // Accept id from query string or body
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const id = req.query.id || body.id;
  if (!id) return res.status(400).json({ error: 'Missing post id' });

  const admin = getAdminClient();

  // Update status to published
  const { data: post, error } = await admin
    .from('blog_posts')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Submit URLs to IndexNow (non-blocking)
  const urls = [
    `https://aetherlink.ai/nl/blog/${post.slug_nl}`,
    `https://aetherlink.ai/en/blog/${post.slug_en}`,
    `https://aetherlink.ai/fi/blog/${post.slug_fi}`,
    'https://aetherlink.ai/nl/blog/',
    'https://aetherlink.ai/en/blog/',
    'https://aetherlink.ai/fi/blog/',
    'https://aetherlink.ai/sitemap.xml',
  ];

  // Fire-and-forget IndexNow submission
  submitIndexNow(urls).catch(err => console.error('IndexNow error:', err));

  return res.status(200).json({ success: true, post });
}

async function submitIndexNow(urls) {
  const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '80a20edad1ec4e3c8e3e9e93fa1f3b2c';
  const payload = {
    host: 'aetherlink.ai',
    key: INDEXNOW_KEY,
    keyLocation: `https://aetherlink.ai/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };

  await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
