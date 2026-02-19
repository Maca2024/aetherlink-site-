// AETHER-ASSIST TTS — ElevenLabs Text-to-Speech
// Streams audio from ElevenLabs multilingual v2

// ─── Rate Limiting (in-memory, per-instance) ───
const ttsRateLimitMap = new Map();
const TTS_RATE_LIMIT_WINDOW = 60 * 1000;
const TTS_RATE_LIMIT_MAX = 8;

function checkTtsRateLimit(ip) {
  const now = Date.now();
  const record = ttsRateLimitMap.get(ip);
  if (!record || now - record.start > TTS_RATE_LIMIT_WINDOW) {
    ttsRateLimitMap.set(ip, { start: now, count: 1 });
    return true;
  }
  if (record.count >= TTS_RATE_LIMIT_MAX) return false;
  record.count++;
  return true;
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed = ['https://aetherlink.ai', 'https://www.aetherlink.ai', 'https://aetherlink-website.vercel.app'];
  res.setHeader('Access-Control-Allow-Origin', allowed.includes(origin) ? origin : allowed[0]);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  if (!checkTtsRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many TTS requests. Please try again in a minute.' });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'TTS not configured' });

  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text required' });
    }

    // Strip markdown for cleaner speech
    const cleanText = text
      .replace(/\*\*(.+?)\*\*/g, '$1')       // bold
      .replace(/\*(.+?)\*/g, '$1')            // italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links → text only
      .replace(/`([^`]+)`/g, '$1')            // inline code
      .replace(/^[-*] /gm, '')                // list markers
      .replace(/\n{2,}/g, '. ')               // paragraph breaks → pause
      .trim();

    if (!cleanText) {
      return res.status(400).json({ error: 'No speakable text' });
    }

    // Limit text to ~500 chars for cost control
    const trimmed = cleanText.length > 500
      ? cleanText.slice(0, 497) + '...'
      : cleanText;

    const voiceId = process.env.ELEVENLABS_VOICE_ID || 'ErXwobaYiN019PkySvjV';

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: trimmed,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs error:', response.status, errorText);
      return res.status(502).json({ error: 'TTS service unavailable' });
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Transfer-Encoding', 'chunked');

    const reader = response.body.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }

    res.end();
  } catch (error) {
    console.error('TTS error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.end();
    }
  }
}
