// GET /api/blog/list?lang=nl
// Dynamic blog index page with CDN caching
import { getPublicClient, CORS } from '../_lib/supabase.js';
import { renderBlogIndex } from '../_lib/template.js';

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { lang = 'nl' } = req.query;
  if (!['nl', 'en', 'fi'].includes(lang)) return res.status(400).send('Invalid language');

  try {
    const supabase = getPublicClient();

    // Fetch all published posts, newest first (RLS ensures only published)
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('published_at', { ascending: false });

    if (error) throw error;

    const html = renderBlogIndex(posts || [], lang);

    // CDN cache: 1 hour, stale-while-revalidate for 1 day
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(html);
  } catch (err) {
    console.error('Blog list error:', err);
    return res.status(500).send('Internal server error');
  }
}
