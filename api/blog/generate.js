// POST /api/blog/generate — AI article generation with quality gate + learning loop
import { getAdminClient, verifyAdmin, handleCors } from '../_lib/supabase.js';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await verifyAdmin(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { topic, research, category = 'aethermind', keywords = [] } = body;

  if (!topic) return res.status(400).json({ error: 'Missing topic' });

  try {
    // Fetch learning context: top and bottom scoring articles
    const learningContext = await getLearningContext();

    // Generate content in all 3 languages in parallel
    const [nl, en, fi] = await Promise.all([
      generateArticle('nl', topic, research, category, keywords, learningContext),
      generateArticle('en', topic, research, category, keywords, learningContext),
      generateArticle('fi', topic, research, category, keywords, learningContext),
    ]);

    // Run quality gate on primary (NL) content
    const qualityScore = calculateQualityScore(nl, en, topic);

    const result = {
      title_nl: nl.title, title_en: en.title, title_fi: fi.title,
      slug_nl: slugify(nl.title), slug_en: slugify(en.title), slug_fi: slugify(fi.title),
      description_nl: nl.description, description_en: en.description, description_fi: fi.description,
      content_nl: nl.content, content_en: en.content, content_fi: fi.content,
      linkedin_summary_nl: nl.linkedin, linkedin_summary_en: en.linkedin, linkedin_summary_fi: fi.linkedin,
      linkedin_hashtags: en.hashtags || [],
      medium_markdown_nl: nl.medium, medium_markdown_en: en.medium, medium_markdown_fi: fi.medium,
      seo_keywords: en.seo_keywords || [],
      category,
      generation_topic: topic,
      research_data: research || null,
      author: 'Marco',
      author_title: 'CTO & AI Lead Architect',
      quality_score: qualityScore.total,
      status: qualityScore.total >= 85 ? 'review' : 'draft',
    };

    return res.status(200).json({
      ...result,
      quality_breakdown: qualityScore,
      auto_publishable: qualityScore.total >= 85,
    });
  } catch (err) {
    console.error('Generate error:', err);
    return res.status(500).json({ error: 'Generation failed', details: err.message });
  }
}

// ── Learning Loop: fetch top/bottom articles as context ──
async function getLearningContext() {
  try {
    const admin = getAdminClient();

    // Top 3 best-scoring articles
    const { data: topPosts } = await admin
      .from('blog_posts')
      .select('title_en, category, feedback_score, feedback_comments, learning_notes')
      .not('feedback_score', 'is', null)
      .order('feedback_score', { ascending: false })
      .limit(3);

    // Bottom 3 worst-scoring articles
    const { data: bottomPosts } = await admin
      .from('blog_posts')
      .select('title_en, category, feedback_score, feedback_comments, learning_notes')
      .not('feedback_score', 'is', null)
      .order('feedback_score', { ascending: true })
      .limit(3);

    if (!topPosts?.length && !bottomPosts?.length) return '';

    let context = '\n\nLEARNING FROM PREVIOUS ARTICLES:';

    if (topPosts?.length) {
      context += '\n\nHIGH-SCORING articles (learn from these):';
      for (const p of topPosts) {
        context += `\n- "${p.title_en}" (score: ${p.feedback_score}/100, category: ${p.category})`;
        if (p.learning_notes) context += ` — Notes: ${p.learning_notes}`;
        if (p.feedback_comments?.length) {
          const comments = Array.isArray(p.feedback_comments) ? p.feedback_comments : [];
          const recent = comments.slice(-2).map(c => c.text || c).join('; ');
          if (recent) context += ` — Feedback: ${recent}`;
        }
      }
    }

    if (bottomPosts?.length && bottomPosts[0]?.feedback_score < 70) {
      context += '\n\nLOW-SCORING articles (avoid these patterns):';
      for (const p of bottomPosts) {
        if (p.feedback_score >= 70) continue;
        context += `\n- "${p.title_en}" (score: ${p.feedback_score}/100, category: ${p.category})`;
        if (p.learning_notes) context += ` — Notes: ${p.learning_notes}`;
        if (p.feedback_comments?.length) {
          const comments = Array.isArray(p.feedback_comments) ? p.feedback_comments : [];
          const recent = comments.slice(-2).map(c => c.text || c).join('; ');
          if (recent) context += ` — Feedback: ${recent}`;
        }
      }
    }

    return context;
  } catch {
    return '';
  }
}

// ── Quality Gate: automatic scoring ──
function calculateQualityScore(nlArticle, enArticle, topic) {
  const scores = {};

  // 1. Word count (target: 1500-2500 words) — max 15 points
  const text = (nlArticle.content || '').replace(/<[^>]+>/g, '');
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 1500 && wordCount <= 2500) scores.wordCount = 15;
  else if (wordCount >= 1200) scores.wordCount = 10;
  else if (wordCount >= 800) scores.wordCount = 5;
  else scores.wordCount = 0;

  // 2. H2 headings (target: 4-6) — max 10 points
  const h2Count = (nlArticle.content || '').match(/<h2/gi)?.length || 0;
  if (h2Count >= 4 && h2Count <= 7) scores.headings = 10;
  else if (h2Count >= 2) scores.headings = 5;
  else scores.headings = 0;

  // 3. Title length (50-70 chars) — max 10 points
  const titleLen = (nlArticle.title || '').length;
  if (titleLen >= 40 && titleLen <= 80) scores.titleLength = 10;
  else if (titleLen >= 20) scores.titleLength = 5;
  else scores.titleLength = 0;

  // 4. Meta description (150-160 chars) — max 10 points
  const descLen = (nlArticle.description || '').length;
  if (descLen >= 130 && descLen <= 170) scores.metaDescription = 10;
  else if (descLen >= 80) scores.metaDescription = 5;
  else scores.metaDescription = 0;

  // 5. Internal links to AetherLink pages — max 10 points
  const internalLinks = (nlArticle.content || '').match(/aetherlink\.ai|aetherbot|aethermind|aetherdev/gi)?.length || 0;
  if (internalLinks >= 3) scores.internalLinks = 10;
  else if (internalLinks >= 1) scores.internalLinks = 5;
  else scores.internalLinks = 0;

  // 6. Has blockquote — max 5 points
  scores.blockquote = (nlArticle.content || '').includes('<blockquote') ? 5 : 0;

  // 7. Has ordered/unordered lists — max 5 points
  const hasList = (nlArticle.content || '').includes('<ul') || (nlArticle.content || '').includes('<ol');
  scores.lists = hasList ? 5 : 0;

  // 8. LinkedIn summary exists and is good length — max 10 points
  const linkedinLen = (nlArticle.linkedin || '').length;
  if (linkedinLen >= 800 && linkedinLen <= 2000) scores.linkedin = 10;
  else if (linkedinLen >= 300) scores.linkedin = 5;
  else scores.linkedin = 0;

  // 9. SEO keywords present — max 10 points
  const keywordsCount = (enArticle.seo_keywords || []).length;
  if (keywordsCount >= 5) scores.seoKeywords = 10;
  else if (keywordsCount >= 3) scores.seoKeywords = 5;
  else scores.seoKeywords = 0;

  // 10. Medium markdown exists — max 5 points
  scores.medium = (nlArticle.medium || '').length > 500 ? 5 : 0;

  // 11. Keyword in title — max 10 points
  const topicWords = topic.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const titleLower = (nlArticle.title || '').toLowerCase();
  const keywordInTitle = topicWords.some(w => titleLower.includes(w));
  scores.keywordInTitle = keywordInTitle ? 10 : 0;

  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  return { ...scores, total, maxPossible: 100, wordCount: scores.wordCount, actualWordCount: wordCount };
}

async function generateArticle(lang, topic, research, category, keywords, learningContext) {
  const langNames = { nl: 'Dutch', en: 'English', fi: 'Finnish' };
  const langName = langNames[lang];

  const researchContext = research
    ? `\n\nRESEARCH DATA (use these real facts, statistics and sources):\n${typeof research === 'string' ? research : JSON.stringify(research, null, 2)}`
    : '';

  const keywordsContext = keywords?.length
    ? `\n\nTARGET SEO KEYWORDS: ${keywords.join(', ')}`
    : '';

  const categoryDescriptions = {
    aetherbot: 'AetherBot — AI Chatbot Platform: Ready-made AI chatbots for websites, trained on business knowledge, multilingual, EU AI Act compliant. Pricing: Starter €49/mo, Professional €599/mo, Enterprise custom. Features: RAG-based knowledge training, analytics, CRM integration, human handoff, branding.',
    aethermind: 'AetherMIND — AI Consultancy & Training: AI Readiness Scans, AI Strategy Development with roadmaps, team training (prompt engineering, AI tools, responsible AI), AI Lead Architecture (fractional CTO model), AI Change Management for organizational transformation.',
    aetherdev: 'AetherDEV — Custom AI Development: Custom AI agents and autonomous workflows, RAG systems and enterprise knowledge bases, API integrations, AI platform architecture, MCP server development, n8n/LangGraph orchestration, Docker deployments.',
  };

  const internalLinkPages = {
    aetherbot: `https://aetherlink.ai/${lang}/aetherbot`,
    aethermind: `https://aetherlink.ai/${lang}/aethermind`,
    aetherdev: `https://aetherlink.ai/${lang}/aetherdev`,
    aiLead: `https://aetherlink.ai/${lang}/ai-lead-architect`,
    aiConsult: `https://aetherlink.ai/${lang}/ai-consultancy`,
  };

  const systemPrompt = `You are Marco, CTO & AI Lead Architect at AetherLink.ai — a European AI consultancy. You write with authority, depth, and occasional dry humor. Your articles are the kind that senior executives bookmark and share.

Write NATIVELY in ${langName} — this is NOT a translation. Think, reason, and express yourself naturally in ${langName}.

## About AetherLink
- European AI One-Stop-Shop, founded 2019, based in Netherlands (also Finland & UAE)
- Three product nodes:
  1. AetherBot — AI chatbot platform (conversational AI, customer service automation)
  2. AetherMIND — AI consultancy & training (strategy, readiness scans, AI Lead Architecture, change management)
  3. AetherDEV — Custom AI development (agents, RAG, MCP servers, agentic workflows)
- EU AI Act & GDPR compliance is core to everything we do

## THIS ARTICLE: "${category.toUpperCase()}" NODE
${categoryDescriptions[category] || categoryDescriptions.aethermind}

## EEAT Requirements (Google's ranking criteria)
- **Experience**: Write from first-hand experience implementing AI for European businesses
- **Expertise**: Include technical depth — specific tools, frameworks, architectures, metrics
- **Authoritativeness**: Reference real statistics, name specific companies/studies, cite research
- **Trustworthiness**: Be honest about limitations, include EU regulatory considerations, no hype

## Article Structure Requirements
- 1800-2500 words, 4-6 H2 sections, use H3 for subsections
- Opening paragraph: Hook with a compelling insight or statistic, state the problem
- Include at least 1 blockquote with a memorable insight
- Include at least 2 lists (ul or ol) for scannable content
- Reference 2-4 AetherLink service pages naturally: ${JSON.stringify(internalLinkPages)}
- Add "answer capsule" early in the article (a brief summary box the reader can scan)
- Closing: Clear call to action without being salesy

## Writing Style
- Professional yet human — like explaining to a smart friend over coffee
- Depth over breadth: go deep on 4-5 points rather than shallow on 10
- Use concrete examples: "Company X saved Y% by doing Z" not "companies can benefit"
- Sprinkle dry humor where appropriate (1-2 moments per article)
- Short paragraphs (3-4 sentences max), varied sentence length
- Active voice, present tense where possible

## Output Format
Return ONLY valid JSON with these exact fields:
{
  "title": "Compelling article title (50-70 chars, keyword-rich)",
  "description": "SEO meta description (150-160 chars, includes CTA)",
  "content": "Full article body in HTML (h2/h3/p/ul/ol/blockquote/strong/a tags, 1800-2500 words)",
  "linkedin": "LinkedIn post (1300-1900 chars): hook line, 3-4 key insights as short paragraphs, CTA, 2-3 relevant emojis max",
  "medium": "Full article in Markdown with proper headings, suitable for Medium publication",
  "hashtags": ["5 relevant hashtags without # prefix"],
  "seo_keywords": ["5-7 long-tail SEO keywords"]
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: `Write a comprehensive blog article about: "${topic}"

Category: ${category}
Language: ${langName}
${keywordsContext}${researchContext}${learningContext}

Generate the article content following all instructions in your system prompt. Return ONLY the JSON object.`,
      }],
      system: systemPrompt,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API error (${lang}): ${response.status} ${errText}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '';

  // Parse JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Failed to parse JSON for ${lang}`);

  return JSON.parse(jsonMatch[0]);
}

function slugify(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
}
