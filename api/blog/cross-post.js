// POST /api/blog/cross-post?id=uuid — Cross-post to LinkedIn and/or Medium
import { getAdminClient, getAuthClientFromReq, getTokenFromReq, handleCors } from '../_lib/supabase.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify authentication
  const token = getTokenFromReq(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const authClient = getAuthClientFromReq(req);
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const id = req.query.id || body.id;
  // Accept platforms array or individual booleans from admin panel
  let platforms = body.platforms || [];
  if (!platforms.length) {
    if (body.linkedin) platforms.push('linkedin');
    if (body.medium) platforms.push('medium');
    if (!platforms.length) platforms = ['linkedin', 'medium'];
  }
  const lang = body.lang || 'en';

  if (!id) return res.status(400).json({ error: 'Missing post id' });

  const admin = getAdminClient();
  const { data: post, error } = await admin
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !post) return res.status(404).json({ error: 'Post not found' });

  const results = {};

  // ── LinkedIn ──
  if (platforms.includes('linkedin') && process.env.LINKEDIN_ACCESS_TOKEN) {
    try {
      const linkedinResult = await postToLinkedIn(post, lang);
      results.linkedin = linkedinResult;

      // Track in database
      await admin.from('blog_posts').update({
        linkedin_posted_at: new Date().toISOString(),
        linkedin_post_url: linkedinResult.url || null,
      }).eq('id', id);
    } catch (err) {
      results.linkedin = { error: err.message };
    }
  }

  // ── Medium ──
  if (platforms.includes('medium') && process.env.MEDIUM_TOKEN) {
    try {
      const mediumResult = await postToMedium(post, lang);
      results.medium = mediumResult;

      // Track in database
      const mediumUpdate = {};
      mediumUpdate.medium_posted_at = new Date().toISOString();
      if (lang === 'en') mediumUpdate.medium_url_en = mediumResult.url || null;
      if (lang === 'nl') mediumUpdate.medium_url_nl = mediumResult.url || null;
      await admin.from('blog_posts').update(mediumUpdate).eq('id', id);
    } catch (err) {
      results.medium = { error: err.message };
    }
  }

  return res.status(200).json({ success: true, results });
}

// ── LinkedIn Community Management API ──
async function postToLinkedIn(post, lang) {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const authorUrn = process.env.LINKEDIN_AUTHOR_URN; // e.g., urn:li:person:XXXXX

  const summaryField = `linkedin_summary_${lang}`;
  const slugField = `slug_${lang}`;
  const summary = post[summaryField] || post.linkedin_summary_en || '';
  const articleUrl = `https://aetherlink.ai/${lang}/blog/${post[slugField]}`;
  const hashtags = (post.linkedin_hashtags || []).map(h => `#${h.replace(/^#/, '')}`).join(' ');

  const text = `${summary}\n\n${hashtags}\n\n${articleUrl}`;

  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: 'ARTICLE',
          media: [{
            status: 'READY',
            originalUrl: articleUrl,
            title: { text: post[`title_${lang}`] || post.title_en },
            description: { text: post[`description_${lang}`] || post.description_en || '' },
          }],
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`LinkedIn API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  return { success: true, id: data.id, url: `https://www.linkedin.com/feed/update/${data.id}` };
}

// ── Medium Publishing API ──
async function postToMedium(post, lang) {
  const mediumToken = process.env.MEDIUM_TOKEN;

  // First get the user ID
  const userRes = await fetch('https://api.medium.com/v1/me', {
    headers: { 'Authorization': `Bearer ${mediumToken}` },
  });
  const userData = await userRes.json();
  const userId = userData.data?.id;
  if (!userId) throw new Error('Could not get Medium user ID');

  const markdownField = `medium_markdown_${lang}`;
  const titleField = `title_${lang}`;
  const slugField = `slug_${lang}`;
  const canonicalUrl = `https://aetherlink.ai/${lang}/blog/${post[slugField]}`;

  const response = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${mediumToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: post[titleField] || post.title_en,
      contentFormat: 'markdown',
      content: post[markdownField] || post.medium_markdown_en || '',
      canonicalUrl,
      tags: (post.seo_keywords || []).slice(0, 5),
      publishStatus: 'draft', // Post as draft for manual review on Medium
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Medium API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  return { success: true, id: data.data?.id, url: data.data?.url };
}
