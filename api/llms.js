// GET /api/llms — Dynamic llms.txt for LLM discoverability
import { getPublicClient } from './_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const supabase = getPublicClient();
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('title_en, title_nl, description_en, description_nl, slug_en, slug_nl, category, published_at')
      .order('published_at', { ascending: false })
      .limit(50);

    let txt = `# AetherLink.ai — llms.txt
# Europe's AI One-Stop-Shop

> AetherLink helps European businesses implement AI strategically, responsibly, and at scale.
> Founded in 2019, based in the Netherlands with operations in Finland and the UAE.

## Products & Services

### AetherBot — AI Chatbot Platform
- Ready-made AI chatbots for websites, trained on your business knowledge
- Live in minutes, multilingual (NL, EN, DE, FR, FI and more)
- EU AI Act compliant and GDPR-proof
- Pricing: Starter €49/mo, Professional €599/mo, Enterprise custom
- URL: https://aetherlink.ai/en/aetherbot

### AetherMIND — AI Consultancy & Training
- AI Readiness Scans and strategic assessments
- AI Strategy Development with implementation roadmaps
- Team training: prompt engineering, AI tools, responsible AI use
- URL: https://aetherlink.ai/en/aethermind

### AetherDEV — Custom AI Development
- Custom AI agents and autonomous workflows
- RAG systems and enterprise knowledge bases
- API integrations and AI platform architecture
- MCP (Model Context Protocol) server development
- URL: https://aetherlink.ai/en/aetherdev

## Expertise

### AI Lead Architecture
- End-to-end AI implementation leadership
- Technology stack selection and architecture design
- URL: https://aetherlink.ai/en/ai-lead-architect

### AI Consultancy
- Strategic AI advisory for C-suite and management
- ROI analysis and business case development
- URL: https://aetherlink.ai/en/ai-consultancy

### AI Change Management
- Organizational transformation for AI adoption
- Employee training and cultural change programs
- URL: https://aetherlink.ai/en/ai-change-management

## Team
- Marco — CTO & AI Lead Architect (5+ years AI experience, specialist in autonomous AI agents, RAG systems, MCP servers)
- Constance — CEO (organizational strategy and business development)
- Ronald — CCO/CFO (commerce, partnerships, and finance)

## Contact
- Email: info@aetherlink.ai
- Phone: +31 6 1377 2333
- Website: https://aetherlink.ai
- LinkedIn: https://www.linkedin.com/company/aetherlink/

## Blog — AI Insights & Strategies
`;

    if (posts && posts.length > 0) {
      for (const post of posts) {
        const date = post.published_at ? post.published_at.split('T')[0] : '';
        txt += `\n### ${post.title_en || post.title_nl}
- ${post.description_en || post.description_nl || 'No description'}
- Category: ${post.category}
- Published: ${date}
- URL: https://aetherlink.ai/en/blog/${post.slug_en}
`;
      }
    }

    txt += `
## Languages
- Dutch (NL): https://aetherlink.ai/nl/
- English (EN): https://aetherlink.ai/en/
- Finnish (FI): https://aetherlink.ai/fi/

## Technical Stack
- AI Models: Claude (Anthropic), GPT (OpenAI), Gemini (Google)
- Infrastructure: Vercel, Supabase, Docker, n8n
- Frameworks: MCP servers, LangGraph, Pinecone, RAG
- Compliance: EU AI Act, GDPR, AVG
`;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(txt);
  } catch (err) {
    console.error('llms.txt error:', err);
    return res.status(500).send('Error generating llms.txt');
  }
}
