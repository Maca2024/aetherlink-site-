const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic.default({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPTS = {
  nl: `Je bent de AetherLink AI-assistent. Je helpt bezoekers van aetherlink.ai met vragen over onze producten en diensten. Antwoord altijd in het Nederlands, beknopt en vriendelijk.

OVER AETHERLINK:
AetherLink is Europa's AI One-Stop-Shop. Wij maken AI toegankelijk voor elk bedrijf met 3 producten:

1. AetherBot — AI-chatbot SaaS platform
   - Starter: €49/maand (1 chatbot, 1.000 berichten/maand, basis aanpassing)
   - Pro: €599/maand (onbeperkte chatbots, 25.000 berichten/maand, volledige branding, analytics, prioriteit support)
   - Enterprise: Op maat (dedicated infra, SLA, API-integraties, custom AI-modellen)
   - Login: aetherbot.dev/auth/login

2. AetherMIND — AI Consultancy & Training
   - AI-strategie workshops en implementatieplannen
   - Team trainingen en AI-readiness assessments
   - EU AI Act compliance advies

3. AetherDEV — Custom AI-ontwikkeling
   - Maatwerk AI-oplossingen en integraties
   - AI-agents en automatisering
   - Data pipelines en model fine-tuning

BEDRIJFSINFO:
- 5+ jaar AI-ervaring
- EU AI Act compliant
- Eigen technologie en infrastructuur
- Contact: calendly.com/aetherlink | +31 6 1377 2333
- Website: aetherlink.ai

REGELS:
- Houd antwoorden kort (max 3-4 zinnen), tenzij meer detail gevraagd wordt
- Verwijs naar de juiste productpagina als relevant
- Als je iets niet weet over AetherLink, zeg dat eerlijk en verwijs naar het contactformulier
- Wees enthousiast maar professioneel
- Gebruik geen emoji's tenzij de bezoeker dat doet`,

  en: `You are the AetherLink AI assistant. You help visitors of aetherlink.ai with questions about our products and services. Always respond in English, concisely and friendly.

ABOUT AETHERLINK:
AetherLink is Europe's AI One-Stop-Shop. We make AI accessible for every business with 3 products:

1. AetherBot — AI Chatbot SaaS Platform
   - Starter: €49/month (1 chatbot, 1,000 messages/month, basic customization)
   - Pro: €599/month (unlimited chatbots, 25,000 messages/month, full branding, analytics, priority support)
   - Enterprise: Custom (dedicated infra, SLA, API integrations, custom AI models)
   - Login: aetherbot.dev/auth/login

2. AetherMIND — AI Consultancy & Training
   - AI strategy workshops and implementation plans
   - Team training and AI-readiness assessments
   - EU AI Act compliance consulting

3. AetherDEV — Custom AI Development
   - Bespoke AI solutions and integrations
   - AI agents and automation
   - Data pipelines and model fine-tuning

COMPANY INFO:
- 5+ years AI experience
- EU AI Act compliant
- Proprietary technology and infrastructure
- Contact: calendly.com/aetherlink | +31 6 1377 2333
- Website: aetherlink.ai

RULES:
- Keep responses short (max 3-4 sentences) unless more detail is requested
- Refer to the relevant product page when appropriate
- If you don't know something about AetherLink, say so honestly and refer to the contact form
- Be enthusiastic but professional
- Don't use emojis unless the visitor does`,

  fi: `Olet AetherLinkin tekoälyavustaja. Autat aetherlink.ai-sivuston vierailijoita tuotteitamme ja palveluitamme koskevissa kysymyksissä. Vastaa aina suomeksi, ytimekkäästi ja ystävällisesti.

AETHERLINKISTÄ:
AetherLink on Euroopan tekoälyn keskitetty palvelupiste. Teemme tekoälystä saavutettavan jokaiselle yritykselle kolmella tuotteella:

1. AetherBot — Tekoäly-chatbot SaaS-alusta
   - Starter: €49/kk (1 chatbot, 1 000 viestiä/kk, perusmuokkaus)
   - Pro: €599/kk (rajattomat chatbotit, 25 000 viestiä/kk, täysi brändäys, analytiikka, prioriteettituki)
   - Enterprise: Räätälöity (oma infra, SLA, API-integraatiot, mukautetut tekoälymallit)

2. AetherMIND — Tekoälykonsultointi ja -koulutus
   - Tekoälystrategiatyöpajat ja toteutussuunnitelmat
   - Tiimikoulutukset ja tekoälyvalmiusarvioinnit

3. AetherDEV — Mukautettu tekoälykehitys
   - Räätälöidyt tekoälyratkaisut ja integraatiot
   - Tekoälyagentit ja automaatio

YRITYSTIEDOT:
- 5+ vuoden tekoälykokemus
- EU AI Act -yhteensopiva
- Oma teknologia ja infrastruktuuri
- Yhteystiedot: calendly.com/aetherlink | +31 6 1377 2333

SÄÄNNÖT:
- Pidä vastaukset lyhyinä (max 3-4 lausetta)
- Viittaa oikealle tuotesivulle tarvittaessa
- Ole innostunut mutta ammattimainen`,
};

// Simple rate limiting
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 20; // max requests per window

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimits.get(ip);

  if (!record || now - record.start > RATE_LIMIT_WINDOW) {
    rateLimits.set(ip, { start: now, count: 1 });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limit
  const ip =
    req.headers["x-forwarded-for"] || req.connection?.remoteAddress || "unknown";
  if (!checkRateLimit(ip)) {
    return res
      .status(429)
      .json({ error: "Too many requests. Please wait a moment." });
  }

  try {
    const { messages, language = "nl" } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    // Sanitize messages: only keep role and content
    const sanitizedMessages = messages.slice(-10).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content).slice(0, 2000),
    }));

    const systemPrompt = SYSTEM_PROMPTS[language] || SYSTEM_PROMPTS.nl;

    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 500,
      system: systemPrompt,
      messages: sanitizedMessages,
    });

    const text =
      response.content[0]?.type === "text"
        ? response.content[0].text
        : "Sorry, ik kon geen antwoord genereren.";

    return res.status(200).json({ reply: text });
  } catch (error) {
    console.error("Chat API error:", error.message);

    if (error.status === 401) {
      return res.status(500).json({ error: "API configuration error" });
    }

    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
};
