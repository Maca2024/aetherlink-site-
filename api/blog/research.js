// POST /api/blog/research — AI trend research via Perplexity Sonar
import { verifyAdmin, handleCors } from '../_lib/supabase.js';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await verifyAdmin(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { topic, keywords = [] } = body;

  if (!topic) return res.status(400).json({ error: 'Missing topic' });

  try {
    const searchQuery = `${topic} ${keywords.join(' ')} AI trends 2025 2026 enterprise implementation best practices chatbots consultancy custom development`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: `You are an AI industry research analyst for AetherLink.ai, a European AI consultancy with three product nodes:
1. AetherBot — AI chatbot platform (conversational AI, customer service automation)
2. AetherMIND — AI consultancy & training (strategy, AI Lead Architecture, change management)
3. AetherDEV — Custom AI development (agents, RAG, MCP servers, agentic workflows)

Research the given topic thoroughly, focusing on how it relates to these product areas. Focus on:
- Current state and latest developments (2025-2026)
- Enterprise implementation patterns and best practices
- Real statistics, case studies, and ROI data
- European/GDPR/EU AI Act compliance considerations
- Practical advice for business decision-makers
- How AetherLink's products/services address these trends

Return your research as structured JSON with these fields:
{
  "summary": "2-3 paragraph executive summary",
  "key_findings": ["finding 1", "finding 2", ...],
  "statistics": ["stat with source 1", "stat with source 2", ...],
  "trends": ["trend 1", "trend 2", ...],
  "enterprise_applications": ["application 1", "application 2", ...],
  "eu_considerations": ["consideration 1", ...],
  "suggested_angles": ["blog angle 1", "blog angle 2", ...],
  "sources": ["source title - URL", ...]
}`
          },
          {
            role: 'user',
            content: searchQuery,
          }
        ],
        temperature: 0.2,
        max_tokens: 4000,
        return_citations: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Perplexity API error:', errText);
      return res.status(502).json({ error: 'Perplexity API error', details: errText });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const citations = data.citations || [];

    // Try to parse structured JSON from the response
    let research;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      research = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: content, sources: citations };
    } catch {
      research = { summary: content, sources: citations };
    }

    // Add citations from Perplexity
    if (citations.length > 0) {
      research.perplexity_citations = citations;
    }

    return res.status(200).json({
      topic,
      keywords,
      research,
      raw_content: content,
      model: data.model,
    });
  } catch (err) {
    console.error('Research error:', err);
    return res.status(500).json({ error: 'Research failed', details: err.message });
  }
}
