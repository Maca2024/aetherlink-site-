// GET /api/blog/render?lang=nl&slug=my-post
// Dynamic blog post rendering with CDN caching
import { getPublicClient, CORS } from '../_lib/supabase.js';
import { renderBlogPost } from '../_lib/template.js';

export default async function handler(req, res) {
  // CORS
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { lang = 'nl', slug } = req.query;
  if (!['nl', 'en', 'fi'].includes(lang)) return res.status(400).send('Invalid language');
  if (!slug) return res.status(400).send('Missing slug');

  try {
    const supabase = getPublicClient();
    const slugCol = `slug_${lang}`;

    // Fetch the post by slug (RLS ensures only published posts are returned)
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq(slugCol, slug)
      .single();

    if (error || !post) {
      // 404 — render a simple not-found page
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
      return res.status(404).send(`<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>404 — AetherLink</title><style>body{font-family:sans-serif;background:#05060f;color:#e4e8f1;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}a{color:#8b5cf6}</style></head><body><div style="text-align:center"><h1>404</h1><p>Article not found.</p><a href="/${lang}/blog/">Back to blog</a></div></body></html>`);
    }

    // Fetch related posts (same category, max 3, excluding current)
    const { data: related } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('category', post.category)
      .neq('id', post.id)
      .order('published_at', { ascending: false })
      .limit(3);

    const html = renderBlogPost(post, related || [], lang);

    // CDN cache: 1 hour, stale-while-revalidate for 1 day
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(html);
  } catch (err) {
    console.error('Blog render error:', err);
    return res.status(500).send('Internal server error');
  }
}
