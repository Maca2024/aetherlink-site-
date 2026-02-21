// GET /api/sitemap — Dynamic sitemap.xml with blog posts from Supabase
import { getPublicClient } from './_lib/supabase.js';

const STATIC_PAGES = {
  nl: ['', 'aetherbot', 'aethermind', 'aetherdev', 'ai-lead-architect', 'ai-consultancy', 'ai-verandermanagement', 'privacy'],
  en: ['', 'aetherbot', 'aethermind', 'aetherdev', 'ai-lead-architect', 'ai-consultancy', 'ai-change-management', 'privacy'],
  fi: ['', 'aetherbot', 'aethermind', 'aetherdev', 'ai-lead-architect', 'ai-consultancy', 'ai-muutoshallinta', 'privacy'],
};

const HREFLANG_MAP = {
  0: { nl: '', en: '', fi: '' },
  1: { nl: 'aetherbot', en: 'aetherbot', fi: 'aetherbot' },
  2: { nl: 'aethermind', en: 'aethermind', fi: 'aethermind' },
  3: { nl: 'aetherdev', en: 'aetherdev', fi: 'aetherdev' },
  4: { nl: 'ai-lead-architect', en: 'ai-lead-architect', fi: 'ai-lead-architect' },
  5: { nl: 'ai-consultancy', en: 'ai-consultancy', fi: 'ai-consultancy' },
  6: { nl: 'ai-verandermanagement', en: 'ai-change-management', fi: 'ai-muutoshallinta' },
  7: { nl: 'privacy', en: 'privacy', fi: 'privacy' },
};

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const supabase = getPublicClient();
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug_nl, slug_en, slug_fi, updated_at, published_at')
      .order('published_at', { ascending: false });

    const base = 'https://aetherlink.ai';
    const now = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

    // Static pages with hreflang alternates
    for (const [idx, mapping] of Object.entries(HREFLANG_MAP)) {
      for (const lang of ['nl', 'en', 'fi']) {
        const slug = mapping[lang];
        const loc = slug ? `${base}/${lang}/${slug}` : `${base}/${lang}/`;
        xml += `  <url>
    <loc>${loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${slug ? '0.8' : '1.0'}</priority>
`;
        for (const altLang of ['nl', 'en', 'fi']) {
          const altSlug = mapping[altLang];
          const altLoc = altSlug ? `${base}/${altLang}/${altSlug}` : `${base}/${altLang}/`;
          xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altLoc}"/>
`;
        }
        xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${slug ? `${base}/nl/${mapping.nl}` : `${base}/nl/`}"/>
  </url>
`;
      }
    }

    // Blog index pages
    for (const lang of ['nl', 'en', 'fi']) {
      xml += `  <url>
    <loc>${base}/${lang}/blog/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
`;
      for (const altLang of ['nl', 'en', 'fi']) {
        xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${base}/${altLang}/blog/"/>
`;
      }
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${base}/nl/blog/"/>
  </url>
`;
    }

    // Blog posts
    if (posts && posts.length > 0) {
      for (const post of posts) {
        const lastmod = (post.updated_at || post.published_at || '').split('T')[0] || now;
        for (const lang of ['nl', 'en', 'fi']) {
          const slug = post[`slug_${lang}`];
          if (!slug) continue;
          xml += `  <url>
    <loc>${base}/${lang}/blog/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
`;
          for (const altLang of ['nl', 'en', 'fi']) {
            const altSlug = post[`slug_${altLang}`];
            if (altSlug) {
              xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${base}/${altLang}/blog/${altSlug}"/>
`;
            }
          }
          xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${base}/nl/blog/${post.slug_nl}"/>
  </url>
`;
        }
      }
    }

    xml += `</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(xml);
  } catch (err) {
    console.error('Sitemap error:', err);
    return res.status(500).send('Internal server error');
  }
}
