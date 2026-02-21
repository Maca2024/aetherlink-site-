// POST /api/blog/generate — AI article generation in 3 languages via Claude
import { getAuthClientFromReq, getTokenFromReq, handleCors } from '../_lib/supabase.js';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

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
  const { topic, research, category = 'aethermind' } = body;

  if (!topic) return res.status(400).json({ error: 'Missing topic' });

  try {
    // Generate content in all 3 languages in parallel
    const [nl, en, fi] = await Promise.all([
      generateArticle('nl', topic, research, category),
      generateArticle('en', topic, research, category),
      generateArticle('fi', topic, research, category),
    ]);

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
    };

    return res.status(200).json(result);
  } catch (err) {
    console.error('Generate error:', err);
    return res.status(500).json({ error: 'Generation failed', details: err.message });
  }
}

async function generateArticle(lang, topic, research, category) {
  const langNames = { nl: 'Dutch', en: 'English', fi: 'Finnish' };
  const langName = langNames[lang];

  const researchContext = research
    ? `\n\nRESEARCH DATA:\n${typeof research === 'string' ? research : JSON.stringify(research, null, 2)}`
    : '';

  const categoryDescriptions = {
    aetherbot: 'AetherBot — AI Chatbot Platform: Ready-made AI chatbots for websites, trained on business knowledge, multilingual, EU AI Act compliant. Pricing: Starter €49/mo, Professional €599/mo, Enterprise custom. Features: RAG-based knowledge training, analytics, CRM integration, human handoff, branding.',
    aethermind: 'AetherMIND — AI Consultancy & Training: AI Readiness Scans, AI Strategy Development with roadmaps, team training (prompt engineering, AI tools, responsible AI), AI Lead Architecture (fractional CTO model), AI Change Management for organizational transformation.',
    aetherdev: 'AetherDEV — Custom AI Development: Custom AI agents and autonomous workflows, RAG systems and enterprise knowledge bases, API integrations, AI platform architecture, MCP server development, n8n/LangGraph orchestration, Docker deployments.',
  };

  const systemPrompt = `You are an expert AI content writer for AetherLink.ai, a European AI consultancy.
Write NATIVELY in ${langName} (do NOT translate from another language).

About AetherLink:
- European AI One-Stop-Shop, founded 2019, based in Netherlands
- Three core product nodes:
  1. AetherBot — AI chatbot platform (chatbots, conversational AI, customer service automation)
  2. AetherMIND — AI consultancy & training (strategy, readiness scans, AI Lead Architecture, change management)
  3. AetherDEV — Custom AI development (agents, RAG systems, MCP servers, integrations, agentic workflows)
- Focus: EU AI Act compliance, GDPR, responsible AI implementation
- Target audience: Business leaders and decision-makers considering AI adoption

THIS ARTICLE IS FOR THE "${category.toUpperCase()}" NODE:
${categoryDescriptions[category] || categoryDescriptions.aethermind}

The article MUST relate to this node's topics and naturally reference the relevant AetherLink product/service.
Every blog post should provide value around AI trends and news relevant to this node.

Writing style:
- Professional yet accessible, like a trusted advisor
- Data-driven with concrete examples and recent statistics
- Practical advice tied to the node's product/service offering
- Naturally reference AetherLink solutions where relevant (not salesy, but authoritative)
- Use HTML tags for formatting (h2, h3, p, ul, ol, blockquote, strong)

Return ONLY valid JSON with these exact fields:
{
  "title": "Compelling article title (50-70 chars)",
  "description": "SEO meta description (150-160 chars)",
  "content": "Full article body in HTML (1500-2000 words, with h2/h3/p/ul/ol/blockquote tags)",
  "linkedin": "LinkedIn post text (1300-1900 chars) with engaging hook, key insights, and call to action. Include emojis sparingly.",
  "medium": "Full article in Markdown format with proper headings",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
  "seo_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
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
${researchContext}

Generate the article content as specified in your instructions. Return ONLY the JSON object.`,
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
